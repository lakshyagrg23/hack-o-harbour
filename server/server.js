import express from 'express';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './db.js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate OAuth consent URL
app.get('/auth/url', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope : [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.readonly"
        ],
    });
    res.json({ authUrl });
});

// Handle OAuth callback
app.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;
        console.log("Received OAuth code:", code); // Debugging log

        const { tokens } = await oauth2Client.getToken(code);
        console.log("Received OAuth tokens:", tokens); // Debugging log

        oauth2Client.setCredentials(tokens);
        const accessToken = tokens.access_token;

        // Fetch user details using the access token
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log("User Info Response:", userInfoResponse.data); // Debugging log

        const userEmail = userInfoResponse.data.email;
        const userName = userInfoResponse.data.name;

        // Check if the user exists in the database, if not, insert them
        const userQuery = `INSERT INTO users (google_id, name, email)
                           VALUES ($1, $2, $3)
                           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                           RETURNING id;`;

        const userResult = await pool.query(userQuery, [userInfoResponse.data.id, userName, userEmail]);
        const userId = userResult.rows[0].id;

        console.log("User authenticated with ID:", userId);

        // Insert default categories for new users
        await insertDefaultCategories(userId);

        // Redirect with access token, user ID, and name
        res.redirect(`http://localhost:3000/emails/inbox?access_token=${accessToken}&user_id=${userId}&name=${encodeURIComponent(userName)}`);
    } catch (error) {
        console.error("Error during OAuth callback:", error);
        res.status(500).send("Authentication failed");
    }
});



// Fetch emails by category
app.get('/fetch-emails/:category', async (req, res) => {
    const { category } = req.params;
    const accessToken = req.query.access_token;

    if (!accessToken) {
        return res.status(401).json({ error: "Missing access token" });
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    try {
        // Fetch user details from OAuth
        const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const googleId = userResponse.data.id;

        // Retrieve user_id from database
        const userResult = await pool.query("SELECT id FROM users WHERE google_id = $1", [googleId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found in database" });
        }
        const userId = userResult.rows[0].id;

        // Fetch stored emails from the database
        let emailQuery = "SELECT * FROM email_metadata WHERE user_id = $1";
        let queryParams = [userId];

        if (category !== "All") {
            emailQuery += " AND category = $2";
            queryParams.push(category);
        }

        const emailResult = await pool.query(emailQuery, queryParams);

        if (emailResult.rows.length > 0) {
            return res.json({ emails: emailResult.rows });
        }

        // No stored emails found, fetch from Gmail API
        const response = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
        const messages = response.data.messages || [];

        let emails = [];

        for (const message of messages) {
            const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });

            const headers = msg.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const sender = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
            
            // ✅ Fetch email body correctly
            const body = extractBody(msg.data.payload);
            const receivedAt = new Date(parseInt(msg.data.internalDate)).toISOString();

            // Delay to respect API limits
            await delay(1000);

            // ✅ Classify email with Gemini AI
            const emailCategory = await classifyEmailWithGemini(userId,subject, body);

            // Store in database
            await pool.query(
                `INSERT INTO email_metadata (user_id, email_id, subject, sender, received_at, category)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email_id) DO NOTHING`,
                [userId, message.id, subject, sender, receivedAt, emailCategory]
            );

            // Push email to response list
            if (category === "All" || emailCategory.toLowerCase() === category.toLowerCase()) {
                emails.push({ email_id: message.id, subject, sender, body, category: emailCategory });
            }
        }

        res.json({ emails });
    } catch (error) {
        console.error("Error fetching/classifying emails:", error);
        res.status(500).json({ error: "Failed to fetch/classify emails" });
    }
});


// Helper function to extract email body
function extractBody(payload) {
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return Buffer.from(part.body.data, 'base64').toString();
        }
        // Recursively check for nested parts
        if (part.parts) {
          const nestedBody = extractBody(part);
          if (nestedBody) return nestedBody;
        }
      }
    }
    return payload.body?.data ? Buffer.from(payload.body.data, 'base64').toString() : '';
  }
  
  // Fetch single email by ID
  app.get('/fetch-email/:email_id', async (req, res) => {
    const { email_id } = req.params;
    const accessToken = req.headers.authorization?.split(' ')[1] || req.query.access_token;
  
    if (!email_id || !accessToken) {
      return res.status(400).json({ error: "Missing email_id or access_token" });
    }
  
    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: authClient });
  
    try {
      // Fetch the email from Gmail API
      const msg = await gmail.users.messages.get({ userId: 'me', id: email_id });
  
      const headers = msg.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const sender = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
      const body = extractBody(msg.data.payload);
      const receivedAt = new Date(parseInt(msg.data.internalDate)).toISOString();
  
      // Return in format expected by the frontend
      res.json({ 
        email: { 
          _id: email_id,
          email_id, 
          subject, 
          sender, 
          body, 
          received_at: receivedAt 
        } 
      });
    } catch (error) {
      console.error(`Error fetching email ${email_id}:`, error);
      res.status(500).json({ error: "Failed to fetch email" });
    }
  });
  
  // Helper function for rate limiting
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function classifyEmailWithGemini(userId, subject, body) {
    try {
        // Fetch categories from the database
        const categories = await fetchUserCategories(userId);
        if (categories.length === 0) {
            console.warn(`No categories found for user ${userId}, using defaults.`);
            return "Miscellaneous"; // Fallback if no categories exist
        }

        // Construct category list dynamically
        const categoryList = categories.map((cat, index) => `${index + 1}. ${cat.category_name} - ${cat.category_description}`).join("\n");

        // Construct the prompt dynamically
        const CATEGORY_PROMPT = `
You are an expert email classification assistant. Your task is to read the email below and classify it into one of these categories:

${categoryList}

Email Subject: ${subject}
Email Body: ${body}

Return only the category name out of the given ones.
`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(CATEGORY_PROMPT);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini Classification Failed:', error);
        return "Miscellaneous"; // Fallback
    }
}


const defaultCategories = [
    { name: "Essential", description: "Important career, academic, or life updates such as job offers, exam schedules, etc." },
    { name: "Social", description: "Personal communications and social media notifications." },
    { name: "Promotions", description: "Marketing, sales, and product launch announcements." },
    { name: "Updates", description: "Order status, service updates, or time-sensitive event notifications." },
    { name: "Finance", description: "Banking, billing, investment updates." },
    { name: "Subscriptions", description: "Regular newsletters, content updates from subscribed services." },
    { name: "Miscellaneous", description: "Everything else." }
];

async function fetchUserCategories(userId) {
    console.log(`userId is ${userId}`);
    try {
        let query = `SELECT category_name, category_description FROM category_preferences WHERE user_id = $1;`;
        const result = await pool.query(query, [userId]);
        console.log(result.rows);
        return result.rows; // Returns an array of category objects
    } catch (error) {
        console.error("Error fetching user categories:", error);
        return []; // Return an empty array on failure
    }
}

async function insertDefaultCategories(userId) {
    try {
        for (const category of defaultCategories) {
            await pool.query(
                `INSERT INTO category_preferences (user_id, category_name, category_description) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (user_id, category_name) DO NOTHING;`, 
                [userId, category.name, category.description]
            );
        }
        console.log(`Default categories inserted for user ${userId}`);
    } catch (error) {
        console.error("Error inserting default categories:", error);
    }
}


// for fetching userid to the frontend for displaying category names in side
app.get("/categories/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await pool.query(
            "SELECT category_name AS name, category_description AS title FROM category_preferences WHERE user_id = $1;",
            [userId]
        );

        res.json(result.rows); // Send categories as response
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// app.put('/categories/:userId/:categoryName', async (req, res) => {
//     const { userId, categoryName } = req.params;
//     const { newCategoryName, newDescription } = req.body;

//     console.log("Received update request:", { userId, categoryName, newCategoryName, newDescription });

//     try {
//         // Check if the category exists for the given user
//         const existingCategory = await pool.query(
//             "SELECT * FROM category_preferences WHERE user_id = $1 AND category_name = $2",
//             [userId, categoryName]
//         );

//         if (existingCategory.rows.length === 0) {
//             console.log("Category not found for update.");
//             return res.status(404).json({ error: "Category not found" });
//         }

//         // Update the category name and description
//         const updatedCategory = await pool.query(
//             "UPDATE category_preferences SET category_name = $1, category_description = $2 WHERE user_id = $3 AND category_name = $4 RETURNING *",
//             [newCategoryName, newDescription, userId, categoryName]
//         );

//         console.log("Category updated successfully:", updatedCategory.rows[0]);
//         res.json({ message: "Category updated successfully", category: updatedCategory.rows[0] });
//     } catch (error) {
//         console.error("Error updating category:", error);
//         res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// });

app.put('/categories/:userId/:categoryName', async (req, res) => {
    const { userId, categoryName } = req.params;
    const { newCategoryName, newDescription } = req.body;
    console.log("ddd")
    console.log(req)

    console.log("Received update request:", { userId, categoryName, newCategoryName, newDescription });

    try {
        // Validate inputs
        if (!newCategoryName || !newDescription) {
            return res.status(400).json({ error: "Both newCategoryName and newDescription are required" });
        }

        // Check if the category exists
        const existingCategory = await pool.query(
            "SELECT * FROM category_preferences WHERE user_id = $1 AND category_name = $2",
            [userId, categoryName]
        );

        if (existingCategory.rows.length === 0) {
            console.log("Category not found for update.");
            return res.status(404).json({ error: "Category not found" });
        }

        // Update category
        const updatedCategory = await pool.query(
            "UPDATE category_preferences SET category_name = $1, category_description = $2 WHERE user_id = $3 AND category_name = $4 RETURNING *",
            [newCategoryName, newDescription, userId, categoryName]
        );

        console.log("Category updated successfully:", updatedCategory.rows[0]);
        res.json({ message: "Category updated successfully", category: updatedCategory.rows[0] });
    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


app.post("/categories/:userId", async (req, res) => {
    const { userId } = req.params;
    const { newCategoryName, newDescription } = req.body;

    // Validation: Ensure inputs are not empty
    if (!newCategoryName || !newDescription) {
        return res.status(400).json({ error: "Category name and description are required." });
    }

    try {
        // Insert new category into database
        const result = await pool.query(
            "INSERT INTO category_preferences (user_id, category_name, category_description) VALUES ($1, $2, $3) RETURNING id, category_name AS name, category_description AS title;",
            [userId, newCategoryName, newDescription]
        );

        res.status(201).json(result.rows[0]); // Return newly created category
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete("/categories/:userId/:categoryName", async (req, res) => {
    const { userId, categoryName } = req.params;

    try {
        // Ensure the category belongs to the user before deleting
        const deleteQuery = `
            DELETE FROM category_preferences
            WHERE user_id = $1 AND category_name = $2
            RETURNING *;
        `;
        const { rows } = await pool.query(deleteQuery, [userId, categoryName]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Category not found or doesn't belong to the user" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

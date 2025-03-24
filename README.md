# MailWise: AI-Powered Email Management System

MailWise is an AI-powered email management system designed to transform the way users interact with their inbox. By leveraging **Google Gemini AI**, MailWise provides a **personalized, efficient, and time-saving** email experience. It seamlessly integrates with Gmail via OAuth & Gmail API, intelligently categorizing emails to **reduce clutter**, **enhance productivity**, and **help users focus on what truly matters**. With custom categories and an intuitive UI, MailWise ensures that managing emails is no longer a hassle but a streamlined experience tailored to individual needs.

![image](https://github.com/user-attachments/assets/7ecb40db-ec77-490a-b5cc-1cdbaa21ed70)

![image](https://github.com/user-attachments/assets/5037688f-d57b-443f-9e07-51f1e8065428)


## Features
- **AI-Powered Email Classification**: Utilizes Google Gemini AI to classify emails into relevant categories.
- **Predefined & Custom Categories**: Offers default categories while allowing users to create personalized ones.
- **Seamless Gmail Integration**: Uses OAuth authentication and Gmail API for secure access.
- **User-Friendly Interface**: Built with ReactJS and Tailwind CSS for a smooth experience.

---

## Project Structure

```
MailWise/
├── client/               # Frontend (React.js)
│   ├── src/
│   │   ├── components/  # UI components (Sidebar, Header, EmailView, etc.)
│   │   ├── api/         # API request handlers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Main pages
│   │   ├── routes/      # Route definitions
│   │   ├── content/     # Sidebar content
│   │   ├── assets/      # Static assets
│   │   └── index.js     # Entry point
│   ├── public/          # Static public files
│   ├── package.json     # Dependencies
│   └── README.md        # Frontend documentation
│
└── server/              # Backend (Node.js + Express)
    ├── db.js            # PostgreSQL connection
    ├── server.js        # Express server setup
    ├── package.json     # Dependencies
    └── .env             # Environment variables (not included in repo)
```

---

## 🛠️ Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **PostgreSQL**


### Backend Setup
```bash
cd server
npm install
```

Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```sh
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_REDIRECT_URI=

   DB_USER=
   DB_HOST=
   DB_NAME=
   DB_PASSWORD=
   DB_PORT=
   ```

Start the backend server:
```bash
node server.js
```

### Frontend Setup
```bash
cd client
npm install
npm start  
```

The application should now be running on **http://localhost:3000** (frontend) and **http://localhost:5000** (backend).

---

## Usage
1. **Login with Google** – Authenticate using your Gmail account.
2. **View categorized emails** – Emails are automatically sorted into predefined & custom categories.
3. **Create custom categories** – Add new categories based on preferences.
4. **Delete categories** – Remove unwanted categories.

---

## Technologies Used
- **Frontend**: ReactJS, Tailwind CSS
- **Backend**: NodeJS, ExpressJS, PostgreSQL
- **AI Integration**: Google Gemini AI
- **External APIs**: Gmail API

---

## API Endpoints
### **Authentication**
- `GET /auth/google` – Initiates Google OAuth flow
- `GET /auth/google/callback` – Handles OAuth callback

### **Emails**
- `GET /emails/:userId` – Fetches categorized emails
- `POST /emails/:userId` – Stores email metadata

### **Categories**
- `GET /categories/:userId` – Fetches user-defined categories
- `POST /categories/:userId` – Creates a new category
- `DELETE /categories/:userId/:categoryName` – Deletes a category

---

##  Contribution
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

---

## License
This project is licensed under the MIT License.

---

# MailWise: AI-Powered Email Management System

MailWise is an AI-powered email management system designed to transform the way users interact with their inbox. By leveraging **Google Gemini AI**, MailWise provides a **personalized, efficient, and time-saving** email experience. It seamlessly integrates with Gmail via OAuth & Gmail API, intelligently categorizing emails to **reduce clutter**, **enhance productivity**, and **help users focus on what truly matters**. With custom categories and an intuitive UI, MailWise ensures that managing emails is no longer a hassle but a streamlined experience tailored to individual needs.

## 🚀 Features
- **AI-powered email categorization** using Google Gemini AI.
- **Google OAuth & Gmail API integration** for seamless access.
- **Custom email categories** – users can modify predefined categories and create new ones.
- **Modern UI** resembling Gmail for intuitive user experience.
- **Database integration with PostgreSQL** for user and email storage.
- **Secure authentication** using OAuth 2.0.

---

## 🏗️ Project Structure

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

### Clone the Repository
```bash
git clone https://github.com/lakshyagrg23/hack-o-harbour.git
cd hack-o-harbour
```

### Backend Setup
```bash
cd server
npm install  # Install dependencies
```

Create a `.env` file in the `server/` directory with the following:
```env
DATABASE_URL=your_postgresql_connection_string
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret
GMAIL_REDIRECT_URI=your_google_redirect_uri
JWT_SECRET=your_secret_key
```

Start the backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd client
npm install  # Install dependencies
npm start    # Start the React app
```

The application should now be running on **http://localhost:3000** (frontend) and **http://localhost:5000** (backend).

---

## 📌 Usage
1. **Login with Google** – Authenticate using your Gmail account.
2. **View categorized emails** – Emails are automatically sorted into predefined & custom categories.
3. **Create custom categories** – Add new categories based on preferences.
4. **Delete categories** – Remove unwanted categories.

---

## 🛠️ Tech Stack
### **Frontend:**
- React.js
- React Router
- Tailwind CSS
- Axios
- Framer Motion (Animations)

### **Backend:**
- Node.js
- Express.js
- PostgreSQL (`pg` library)
- Google OAuth 2.0
- Gmail API

---

## 📜 API Endpoints
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

## 📌 Contribution
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

---

## 📄 License
This project is licensed under the MIT License.

---

## ✨ Acknowledgments
- Google OAuth & Gmail API Docs
- PostgreSQL Documentation
- OpenAI for AI classification inspiration

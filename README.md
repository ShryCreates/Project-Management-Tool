# ProjectFlow — Team Collaboration Tool

A full-stack project management tool like Trello/Asana with real-time WebSocket notifications.

📌 Project Overview

ProjectFlow is a modern full-stack project management application built using the MERN Stack. It helps individuals and teams efficiently organize projects, manage tasks using a Kanban board, collaborate with teammates, and monitor project progress through an intuitive dashboard.

The application provides a clean, responsive, and user-friendly interface inspired by popular project management platforms such as Trello, Jira, ClickUp, and Linear.

✨ Features

🔐 Authentication
User Registration
Secure Login
JWT Authentication
Protected Routes
Logout Functionality

📊 Dashboard
Personalized Welcome Dashboard
Total Projects Overview
My Projects
Shared Projects
Quick Project Navigation
Responsive Project Cards

📁 Project Management
Create New Projects
Edit Project Details
Delete Projects
Project Descriptions
Multiple Projects Support

✅ Task Management
Kanban Board
To Do
In Progress
In Review
Done

Features include:

Create Tasks
Edit Tasks
Delete Tasks
Drag & Drop Tasks
Organize Tasks by Status

👥 Team Collaboration
Invite Team Members
Manage Collaborators
Shared Projects
Team Workspace

🔎 Search & Filters
Search Tasks
Filter by Members
Filter by Priority
Quick Navigation

🎨 Modern UI
Dark Theme
Responsive Design
Interactive Dashboard
Clean Navigation Sidebar
Beautiful Project Cards
Modern Kanban Layout

🛠 Tech Stack

Frontend
React.js
React Router
Axios
Tailwind CSS
Context API
React Icons

Backend
Node.js
Express.js
JWT Authentication
Bcrypt.js
REST APIs

Database
MongoDB
Mongoose

Other Tools
Git
GitHub
Postman
Nodemon
dotenv

📂 Folder Structure
ProjectFlow/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── assets/
│   │   └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── .env
│
├── README.md
└── package.json

🚀 Installation

Clone Repository
git clone https://github.com/yourusername/ProjectFlow.git
cd ProjectFlow
Install Dependencies

Frontend
cd client
npm install

Backend
cd server
npm install

Environment Variables

Create a .env file inside the server directory.

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

Start Backend
cd server
npm run dev

Start Frontend
cd client
npm run dev

📷 Screenshots
Dashboard
<img width="1910" height="867" alt="Screenshot 2026-06-26 095327" src="https://github.com/user-attachments/assets/f12e8635-9d21-4904-b1d5-908aeda9764b" />
<img width="1912" height="863" alt="Screenshot 2026-06-26 095346" src="https://github.com/user-attachments/assets/e0122281-f031-492b-bffa-a4c3a30bf592" />

Kanban Board
<img width="1912" height="875" alt="Screenshot 2026-06-26 095405" src="https://github.com/user-attachments/assets/ce704c7c-ecf8-4ac2-b107-bf8d456e7744" />
<img width="1912" height="867" alt="Screenshot 2026-06-26 095459" src="https://github.com/user-attachments/assets/66115297-2457-4c17-b005-6b288dc4931b" />
<img width="1912" height="867" alt="Screenshot 2026-06-26 095540" src="https://github.com/user-attachments/assets/5e8ffd55-fa1b-4c8b-9448-178afa6e4891" />

API Endpoints

Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile

Projects
GET /api/projects
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id

Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

Author
Shreya Kumari
GitHub: https://github.com/ShryCreates
LinkedIn: https://www.linkedin.com/in/shreya-kumari-24a249333/
```

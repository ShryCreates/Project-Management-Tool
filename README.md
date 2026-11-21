# 🚀 ProjectFlow - Full Stack Project Management Tool

A modern **MERN Stack Project Management Application** that enables individuals and teams to efficiently plan, organize, track, and collaborate on projects using an interactive Kanban board. The application provides secure authentication, project management, task tracking, team collaboration, and a responsive user interface inspired by tools like Trello, Jira, and ClickUp.

---

## 📌 Features

### 🔐 Authentication & Authorization
- User Registration & Login
- JWT-based Authentication
- Protected Routes
- Secure Password Hashing using bcrypt
- User Profile Management

### 📊 Dashboard
- Personalized Dashboard
- Project Overview
- Total Projects Statistics
- My Projects
- Shared Projects
- Responsive Project Cards

### 📁 Project Management
- Create New Projects
- Edit Project Details
- Delete Projects
- Project Descriptions
- Project Collaboration

### ✅ Task Management
- Interactive Kanban Board
- Drag & Drop Tasks
- Create, Update & Delete Tasks
- Task Priorities
- Task Status Tracking
- Task Assignment
- Due Date Management

### 👥 Team Collaboration
- Invite Members
- Manage Team Members
- Shared Workspaces
- Collaborative Project Access

### 🔍 Search & Filters
- Search Tasks
- Filter by Member
- Filter by Priority
- Quick Navigation

### 🎨 User Interface
- Modern Dark Theme
- Responsive Design
- Interactive Dashboard
- Smooth Navigation
- Clean and Professional Layout

---

# 🛠 Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Icons
- Zustand (State Management)

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js
- REST API

### Database
- MongoDB
- Mongoose

### Tools & Utilities
- Git
- GitHub
- Postman
- Nodemon
- dotenv

---

# 📂 Project Structure

```
Project_Management_Tool/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/ShryCreates/HorizonTechX_Project-Management-Tool.git
```

```bash
cd HorizonTechX_Project-Management-Tool
```

---

## Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

# ▶️ Run the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

The application will run on:

```
Frontend : http://localhost:5173

Backend  : http://localhost:5000
```

---


## 🚀 Live Demo

[Project Management Tool](https://project-management-tool-xj3r.vercel.app)


# 📸 Screenshots

## 🏠 Dashboard
<img width="1900" height="868" alt="image" src="https://github.com/user-attachments/assets/aab03a08-7a7d-4914-9e59-e79799b41996" />
<img width="1908" height="851" alt="image" src="https://github.com/user-attachments/assets/5cd6da1d-7923-4e3d-a830-ef45cb52b5ac" />
---

## 📋 Kanban Board
<img width="1898" height="862" alt="image" src="https://github.com/user-attachments/assets/f4f91dd5-5938-4a67-89f1-a8d6630f3de2" />
<img width="843" height="852" alt="image" src="https://github.com/user-attachments/assets/a44570c9-47a8-4275-849d-d6a8531b9496" />

---

## 🔐 Login Page
<img width="800" height="847" alt="image" src="https://github.com/user-attachments/assets/be93a75b-7b5e-44dd-84fb-3977f96b5a42" />
---

## 📝 Register Page
<img width="716" height="847" alt="image" src="https://github.com/user-attachments/assets/07590634-116d-4f18-bd0e-eccb0f041dff" />
---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |
| GET | `/api/auth/profile` | Get User Profile |

---

## Projects

| Method | Endpoint |
|---------|----------|
| GET | `/api/projects` |
| POST | `/api/projects` |
| PUT | `/api/projects/:id` |
| DELETE | `/api/projects/:id` |

---

## Tasks

| Method | Endpoint |
|---------|----------|
| GET | `/api/tasks` |
| POST | `/api/tasks` |
| PUT | `/api/tasks/:id` |
| DELETE | `/api/tasks/:id` |

---

## Comments

| Method | Endpoint |
|---------|----------|
| GET | `/api/comments/:taskId` |
| POST | `/api/comments` |

---

# 👩‍💻 Author

**Shreya Kumari**

### Connect with Me

- GitHub: https://github.com/ShryCreates
- LinkedIn: https://www.linkedin.com/in/shreya-kumari-24a249333/
- Email: shry1012005@gmail.com

---

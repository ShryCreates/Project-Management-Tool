# ProjectFlow — Team Collaboration Tool

A full-stack project management tool like Trello/Asana with real-time WebSocket notifications.

## Features
- User authentication (register / login with JWT)
- Project creation with custom colors and auto-generated Kanban columns
- Drag-and-drop task cards across columns (dnd-kit)
- Task assignment, priority, due dates, labels, and checklists
- Comments and collaboration on tasks
- Member management (invite by name/email search)
- Real-time notifications via Socket.io WebSockets
- Fully responsive dark-mode UI

## Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Backend
```bash
cd server
npm install
# Edit .env — set MONGO_URI and JWT_SECRET
npm run dev        # starts on port 5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev        # starts on port 5173
```

Open `http://localhost:5173` in your browser.

## Project Structure
```
Project_Management_Tool/
├── server/
│   ├── models/         # User, Project, Task, Comment
│   ├── routes/         # auth, projects, tasks, comments, users
│   ├── middleware/     # JWT auth
│   ├── utils/          # token generator
│   └── index.js        # Express + Socket.io server
└── client/
    └── src/
        ├── components/
        │   ├── board/  # KanbanBoard, BoardColumn, TaskCard, modals
        │   └── layout/ # Sidebar, Navbar, Layout
        ├── pages/      # Login, Register, Dashboard, Board
        ├── store/      # Zustand stores (auth, project, task, notifications)
        ├── hooks/      # useSocket
        ├── lib/        # axios instance, socket.io client
        └── types/      # TypeScript interfaces
```

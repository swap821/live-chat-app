# 💬 Live Chat App : https://live-chat-app-five-amber.vercel.app/

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern, full-stack real-time chat application built using the MERN stack and Socket.io. The platform enables users to communicate instantly through private chat rooms with persistent message storage and a responsive modern interface.

This project demonstrates real-time communication systems, WebSocket implementation, scalable frontend architecture, backend API integration, and database persistence using MongoDB.

---

# ✨ Key Features

## ⚡ Real-Time Messaging
- Instant bi-directional communication using WebSockets
- Real-time message broadcasting with Socket.io
- Low-latency chat experience

## 🔒 Private Chat Rooms
- Users can join custom room IDs
- Conversations remain isolated and private
- Multiple rooms supported simultaneously

## 👤 Custom Usernames
- Temporary usernames for room-based chatting
- Personalized chat identity without account creation

## 💾 Persistent Chat History
- Messages stored securely in MongoDB
- Previous chats automatically loaded when users rejoin rooms
- Database persistence using Mongoose ODM

## 🎨 Modern Responsive UI
- Clean and minimal chat interface
- Fully responsive across desktop and mobile devices
- Built rapidly using Tailwind CSS

## 🚨 Error Handling & Stability
- Robust socket connection handling
- Backend validation and error management
- Smooth user experience during reconnections

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Socket.io-client

## Backend
- Node.js
- Express.js
- Socket.io

## Database
- MongoDB Atlas
- Mongoose ODM

---

# 📂 Project Structure

```plaintext
live-chat-app/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

---

# 📌 Prerequisites

Make sure you have installed:
- Node.js
- npm
- MongoDB Atlas account or local MongoDB setup

Download Node.js:
https://nodejs.org/

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/swap821/live-chat-app.git
cd live-chat-app
```

---

# 🔧 Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
npm install
```

---

## 🌐 Configure Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

---

## ▶️ Start Backend Server

```bash
npm run dev
```

---

# 🎨 Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 🌍 Run the Application

Visit:

```bash
http://localhost:5173
```

Open multiple browser tabs/windows to test the real-time chat functionality.

---

# 🌐 Deployment

This project is deployment-ready and can be hosted using:

## Frontend Hosting
- Vercel
- Netlify

## Backend Hosting
- Render
- Railway

## Database
- MongoDB Atlas

---

# 🧠 Concepts & Skills Demonstrated

This project demonstrates practical understanding of:

- Real-Time WebSocket Communication
- MERN Stack Development
- Socket.io Event Handling
- REST API Integration
- MongoDB Database Persistence
- React Component Architecture
- Responsive UI Design
- Asynchronous JavaScript
- Backend Scalability
- Full-Stack Deployment

---

# 🚀 Future Improvements

- User Authentication System
- Online/Offline User Status
- Typing Indicators
- File & Image Sharing
- Emoji Reactions
- Voice & Video Calling
- Message Notifications
- End-to-End Encryption

---

# 👨‍💻 Author

## Swapnil Kumar

- GitHub: https://github.com/swap821
- LinkedIn: https://www.linkedin.com/in/swapnil-kumar-73a68a308

---

# ⭐ Project Goal

This project was built to strengthen and demonstrate:
- Full-Stack MERN Development
- Real-Time Communication Systems
- WebSocket Implementation
- Scalable Frontend & Backend Architecture
- Database Management
- Professional Software Engineering Practices

---

# 📜 License

This project is open-source and available for educational and learning purposes.

# Live Chat App

A modern, secure, full-stack real-time chat application built with the MERN stack and Socket.io. Features typing indicators, online user presence, message reactions, emoji picker, dark mode, and a responsive UI — all with production-grade security.

> **Live Demo:** https://live-chat-app-five-amber.vercel.app/

---

## Features

### Real-Time Messaging
- Instant bi-directional communication via WebSockets (Socket.io)
- Persistent message storage in MongoDB
- Message reactions (emoji) with toggle support
- Chat history automatically loaded when joining a room

### Typing Indicators
- "X is typing..." with animated bouncing dots
- Smart multi-user display ("Alice and Bob are typing", "Alice and 2 others are typing")
- 2-second debounce with automatic timeout

### Online User Presence
- Real-time list of users in each room
- Colored avatar circles with user initials
- Stacked avatar preview in the chat header
- Join/leave notifications

### Emoji Picker
- 28 commonly used emojis
- Click to insert into message input
- Click-outside to close

### Dark Mode
- Toggle between light and dark themes
- Persists preference to localStorage
- Respects system `prefers-color-scheme` on first visit
- Full Tailwind `dark:` support across all components

### Responsive Design
- Mobile-first layout with adaptive heights
- Mobile back button to leave room
- Touch-friendly buttons and inputs
- Works on desktop, tablet, and phone

### Browser Notifications
- Desktop notification on new messages (when tab is hidden)
- Respects Notification API permission

### Connection Resilience
- Connection status indicator (green/red dot)
- Automatic reconnection with 5 retry attempts
- Exponential backoff (1s - 5s)
- Warning banner when server is unreachable

---

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS v3
- Socket.io-client
- React Context + Custom Hooks

### Backend
- Node.js + Express
- Socket.io
- MongoDB Atlas + Mongoose
- Helmet (security headers)
- express-rate-limit
- express-mongo-sanitize

### DevOps
- Frontend: Vercel
- Backend: Render / Railway
- Database: MongoDB Atlas

---

## Project Structure

```
live-chat-app/
|
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── security.js          # Helmet, CORS, rate limiting, mongo-sanitize
│   │   │   ├── validation.js        # Input validators for all socket events
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── models/
│   │   │   └── Message.js           # Mongoose schema with reactions
│   │   ├── sockets/
│   │   │   └── chatSocket.js        # All socket event handlers
│   │   └── utils/
│   │       └── logger.js            # Structured console logger
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   └── server.js                     # Entry point
|
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── SocketContext.jsx    # Socket lifecycle management
│   │   ├── hooks/
│   │   │   ├── useChat.js           # Message state & send logic
│   │   │   ├── useTyping.js         # Typing indicator debounce
│   │   │   ├── useOnlineUsers.js    # Online user tracking
│   │   │   └── useNotifications.js  # Browser notification API
│   │   ├── components/
│   │   │   ├── ChatRoom.jsx         # Main chat container
│   │   │   ├── JoinForm.jsx         # Room join form with validation
│   │   │   ├── MessageList.jsx      # Scrollable message list
│   │   │   ├── MessageBubble.jsx    # Individual message bubble
│   │   │   ├── ChatInput.jsx        # Message input with emoji
│   │   │   ├── TypingIndicator.jsx  # "X is typing" animation
│   │   │   ├── OnlineUsers.jsx      # Online users dropdown
│   │   │   ├── EmojiPicker.jsx      # Emoji selection grid
│   │   │   └── DarkModeToggle.jsx   # Light/dark mode toggle
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
|
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/swap821/live-chat-app.git
cd live-chat-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

> **Security note:** Never commit your `.env` file. The `.env.example` shows the required variables without real values.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
VITE_BACKEND_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the App

Visit `http://localhost:5173` and open multiple browser tabs to test real-time chat.

---

## Environment Variables

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `FRONTEND_URL` | Yes | Allowed CORS origin(s). Comma-separated for multiple |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | `development` or `production` |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 900000 = 15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default: 100) |

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | No | Backend URL (default: http://localhost:3001) |

---

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add `VITE_BACKEND_URL` environment variable
5. Deploy

### Backend (Render)
1. Push code to GitHub
2. Create Web Service on [Render](https://render.com)
3. Set root directory to `backend`
4. Add all environment variables from `.env.example`
5. Deploy

### Backend (Railway)
1. Push code to GitHub
2. Create project on [Railway](https://railway.app)
3. Deploy from GitHub repo
4. Add environment variables
5. Deploy

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info (name, version, status) |
| `GET` | `/health` | Health check with DB status & online user count |

## Socket Events

### Client -> Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ room, username }` | Join a chat room |
| `leave_room` | `room` | Leave current room |
| `send_message` | `{ room, author, message, time }` | Send a message |
| `typing` | `{ room, author }` | Start typing indicator |
| `stop_typing` | `{ room, author }` | Stop typing indicator |
| `add_reaction` | `{ room, messageId, emoji, author }` | Toggle reaction on message |

### Server -> Client

| Event | Payload | Description |
|-------|---------|-------------|
| `load_messages` | Array of messages | Previous messages on room join |
| `receive_message` | Message object | New message broadcast |
| `user_typing` | `{ author }` | Someone started typing |
| `user_stopped_typing` | `{ author }` | Someone stopped typing |
| `user_joined` | `{ username, usersOnline, usersList }` | User joined room |
| `user_left` | `{ username, usersOnline, usersList }` | User left room |
| `reaction_updated` | `{ messageId, reactions }` | Reaction changed on message |
| `error_event` | `{ code, message }` | Error notification |

---

## Security Features

- **Helmet** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **MongoDB Sanitization** - Prevents NoSQL injection by stripping `$` and `.`
- **Strict CORS** - Whitelist-based origin validation
- **Input Validation** - All socket payloads validated (max lengths, required fields, sanitization)
- **Global Error Handler** - Safe error responses, no stack trace leakage in production
- **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT
- **Environment Variables** - No secrets in source code

---

## Concepts & Skills Demonstrated

- Real-time WebSocket Communication (Socket.io)
- MERN Stack Development
- React 19 + Custom Hooks + Context API
- Component-based architecture
- Security hardening (helmet, rate limiting, input validation)
- MongoDB Database Persistence with Mongoose
- Responsive UI Design (Tailwind CSS)
- Dark mode implementation
- Browser Notification API
- Graceful error handling and reconnection
- Full-stack deployment

---

## Changelog

### v2.0.0 (2026)
- **Security:** Added helmet, rate limiting, mongo-sanitize, input validation, strict CORS
- **Architecture:** Refactored from monolith to modular structure (backend + frontend)
- **Features:** Typing indicators, online user presence, emoji picker, dark mode, browser notifications
- **UX:** Responsive design, connection status, loading states, form validation
- **Dev:** Switched to ES modules, added structured logging, health check endpoint

### v1.0.0
- Initial release with basic real-time chat
- Room-based messaging
- Persistent message history
- Basic responsive UI

---

## Author

**Swapnil Kumar**
- GitHub: https://github.com/swap821
- LinkedIn: https://www.linkedin.com/in/swapnil-kumar-73a68a308
- Portfolio: https://swapnil-kumar-portfolio.vercel.app/

---

## License

This project is open-source and available for educational and learning purposes.

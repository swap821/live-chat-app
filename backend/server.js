const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // Import our new model

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Inside server.js, update the io setup:
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, 
    methods: ["GET", "POST"]
  }
});

// --- MongoDB Connection ---
// Replace this URI with your MongoDB Atlas connection string if you are using the cloud!
// For local MongoDB, this standard URI works perfectly.
const MONGO_URI = "mongodb+srv://kumarswapnil82_db_user:RfSvSjBJZ9oAj8pv@cluster1.kvyaq5w.mongodb.net/?appName=Cluster1"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('📦 Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Socket.io Logic ---
io.on('connection', (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  // 1. Listen for a user joining a specific room
  socket.on("join_room", async (room) => {
    socket.join(room);
    console.log(`User ID: ${socket.id} joined room: ${room}`);

    // Fetch previous messages ONLY for this specific room
    try {
      const roomMessages = await Message.find({ room: room }).sort({ createdAt: 1 }).limit(50);
      socket.emit('load_messages', roomMessages);
    } catch (error) {
      console.error("Error loading room messages:", error);
    }
  });

  // 2. Handle sending messages to a specific room
  socket.on('send_message', async (data) => {
    try {
      // Save to MongoDB with the room ID attached
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time
      });
      const savedMessage = await newMessage.save();

      // Emit ONLY to users in that specific room using .to()
      socket.to(data.room).emit('receive_message', {
        id: savedMessage._id,
        room: savedMessage.room,
        author: savedMessage.author,
        message: savedMessage.message,
        time: savedMessage.time
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
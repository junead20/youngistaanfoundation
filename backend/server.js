const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'Manobandhu API is live! 🚀 Please use http://localhost:5173 for the frontend.' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/community', require('./routes/community'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/recommendation', require('./routes/recommendation'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'Manobandhu API running ✅' }));

// Socket.IO for real-time mentor chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Manobandhu server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error(err);
    console.log('⚠️  Starting server without DB (mock mode)...');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Manobandhu server running on port ${process.env.PORT} (no DB)`);
    });
  });

module.exports = { app, io };

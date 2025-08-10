// server/index.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Message from './models/message.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// =========================
// API Routes
// =========================

// Get all conversations (latest message + message count)
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          lastMessage: { $first: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          wa_id: "$_id",
          lastMessage: 1,
          count: 1
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);
    res.json(conversations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get messages for a specific wa_id
app.get('/api/messages/:wa_id', async (req, res) => {
  try {
    const messages = await Message.find({ wa_id: req.params.wa_id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { wa_id, from, to, body } = req.body;
    const ts = Date.now();

    const doc = new Message({
      id: 'local-' + ts,
      meta_msg_id: null,
      wa_id,
      from,
      to,
      body,
      timestamp: ts,
      datetime: new Date(ts),
      type: 'text',
      status: 'sent',
      outgoing: true
    });

    const saved = await doc.save();
    io.emit('new_message', saved);
    res.json(saved);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =========================
// Socket.IO Connection
// =========================
io.on('connection', socket => {
  console.log('🔌 socket connected:', socket.id);
});

// Start Server
server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

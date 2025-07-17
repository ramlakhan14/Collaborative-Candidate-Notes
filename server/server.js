const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const noteRoutes = require('./routes/note');
const { verifyJWT } = require('./middleware/auth');

require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

global._io = io;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/auth', authRoutes);
app.use('/api/candidates', verifyJWT, candidateRoutes);
app.use('/api/notes', verifyJWT, noteRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use((req, res) => {
  console.log(" Unknown route hit:", req.originalUrl);
  res.status(404).json({ error: "Route not found" });
});
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Socket.IO setup
require('./socket')(io);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

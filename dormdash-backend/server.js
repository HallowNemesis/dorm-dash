import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';   // new import
import rideRoutes from './routes/ride.js';
import { registerRideSocketHandlers } from './sockets/rideSocket.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ride', rideRoutes);

// test route
app.get('/', (req, res) => res.send('Dorm Dash API Running'));

// create HTTP + WebSocket server
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend (ngrok or mobile)
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  registerRideSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

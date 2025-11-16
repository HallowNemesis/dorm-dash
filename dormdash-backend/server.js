import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';   // new import

const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);            // mount profile routes

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
  console.log(`User connected: ${socket.id}`);

  // Rider requests a ride
  socket.on('requestRide', (data) => {
    console.log('Ride requested:', data);
    io.emit('newRideRequest', data); // broadcast to drivers
  });

  // Driver accepts a ride
  socket.on('acceptRide', (data) => {
    console.log('Ride accepted:', data);
    io.emit('rideAccepted', data); // notify rider
  });

  // Real-time location updates
  socket.on('driverLocation', (location) => {
    console.log('Driver location update:', location);
    io.emit('updateDriverLocation', location);
  });

  // Chat messages between rider and driver
  socket.on('chatMessage', (message) => {
    console.log('Chat message:', message);
    io.emit('newChatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

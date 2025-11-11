import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send('Dorm Dash API Running'));

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
    // Example: broadcast to all available drivers
    io.emit('newRideRequest', data);
  });

  // Driver accepts a ride
  socket.on('acceptRide', (data) => {
    console.log('Ride accepted:', data);
    io.emit('rideAccepted', data); // Notify rider
  });

  // Real-time location updates

  socket.on('driverLocation', (location) => {
    console.log(' Driver location update:', location);
    io.emit('updateDriverLocation', location);
  });

  // Chat messages between rider and driver
  socket.on('chatMessage', (message) => {
    console.log(' Chat message:', message);
    io.emit('newChatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
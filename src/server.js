const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
// Increase body parser limits to handle profile images
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with larger limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with larger limit

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Initialize WebSocket server
let wsServer = null;
// Always initialize WebSocket server in production and when MongoDB is configured
if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
  try {
    const WebSocketServer = require('./websocket/WebSocketServer');
    wsServer = new WebSocketServer(server);
  } catch (error) {
    console.log('WebSocket server initialization skipped:', error.message);
  }
}

// Only try to connect to MongoDB and set up routes if MONGODB_URI is provided
if (process.env.MONGODB_URI || process.env.NODE_ENV === 'production') {
  // Database connection
  const connectDB = require('./config/db');
  connectDB();

  // API Routes (only set up if MongoDB is configured)
  const userRoutes = require('./routes/userRoutes');
  const appointmentRoutes = require('./routes/appointmentRoutes');
  const patientRoutes = require('./routes/patientRoutes');
  const activityLogRoutes = require('./routes/activityLogRoutes');
  const queueRoutes = require('./routes/queueRoutes');
  const messageRoutes = require('./routes/messageRoutes');
  const fitnessDataRoutes = require('./routes/fitnessDataRoutes');
  const aiInsightRoutes = require('./routes/aiInsightRoutes');

  app.use('/api/users', userRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/activity-logs', activityLogRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/fitness-data', fitnessDataRoutes);
  app.use('/api/ai-insights', aiInsightRoutes);
} else {
  console.log('MongoDB not configured. API routes requiring database access will not be available.');
  console.log('To enable database features, set MONGODB_URI in your .env file.');
}

// Routes that work without database
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SevaOnline Backend API',
    databaseConnected: !!(process.env.MONGODB_URI || process.env.NODE_ENV === 'production'),
    websocketEnabled: !!wsServer,
    instructions: process.env.MONGODB_URI ?
      'API is ready to use' :
      'To enable full API functionality, configure MongoDB connection string in .env file'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    databaseConnected: !!(process.env.MONGODB_URI || process.env.NODE_ENV === 'production'),
    websocketEnabled: !!wsServer,
    connectedClients: wsServer ? wsServer.getConnectedClientsCount() : 0
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  // For Render deployment
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
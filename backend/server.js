import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  mongoSanitizeMiddleware,
} from './src/middleware/security.js';
import { globalErrorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { registerChatSocket, getTotalOnlineCount } from './src/sockets/chatSocket.js';
import logger from './src/utils/logger.js';

// Validate required environment variables
const REQUIRED_ENV_VARS = ['MONGO_URI', 'FRONTEND_URL'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  logger.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Express App Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(rateLimitMiddleware);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP + Socket.IO Server
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL;
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  connectTimeout: 45000,
  pingTimeout: 30000,
  pingInterval: 25000,
});

// Register socket event handlers
registerChatSocket(io);

// HTTP Routes

/**
 * Health check endpoint.
 */
app.get('/health', (_req, res) => {
  const dbState = ['connecting', 'connected', 'disconnecting', 'disconnected'][
    mongoose.connection.readyState || 0
  ];
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
    onlineUsers: getTotalOnlineCount(),
  });
});

/**
 * API root.
 */
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Live Chat API',
    version: '2.0.0',
    status: 'running',
    docs: '/health',
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Database Connection & Server Start
const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Accepting CORS from: ${FRONTEND_URL}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await io.close();
      logger.info('Socket.IO server closed');
      await disconnectDatabase();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error(`Shutdown error: ${err.message}`);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  shutdown('UNHANDLED_REJECTION');
});

// Start
startServer();

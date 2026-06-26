import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../utils/logger.js';

/**
 * Parse and validate CORS origins from environment variable.
 * Supports comma-separated origins.
 */
const getCorsOrigins = () => {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);

  return origins.map((origin) => {
    if (origin === '*') {
      logger.warn('CORS origin set to wildcard (*) - not recommended for production');
      return origin;
    }
    return origin;
  });
};

/**
 * Helmet middleware for security headers.
 * Configured for Socket.io compatibility.
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...getCorsOrigins()],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CORS middleware with whitelist validation.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200,
});

/**
 * Rate limiting middleware - 100 requests per 15 minutes per IP.
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * MongoDB sanitization middleware - prevents NoSQL injection.
 * Strips out keys starting with $ or containing .
 */
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Sanitized potentially malicious key: ${key} from ${req.ip}`);
  },
});

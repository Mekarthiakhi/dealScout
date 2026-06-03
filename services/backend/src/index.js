import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { searchProducts } from './services/productSearch.js';
import { getSuggestions } from './services/suggestions.js';
import { validateSearchQuery, validateSuggestionQuery } from './middleware/validation.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache (60 seconds TTL)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet());

// Compression middleware for response gzip
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Limit payload size

// ============================================
// RATE LIMITING
// ============================================

// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Search endpoint limiter: 30 requests per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many search requests. Please try again in a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.query.q || req.ip, // Rate limit per search query
});

// Suggestions endpoint limiter: 50 requests per minute
const suggestionsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many suggestion requests. Please try again in a moment.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ============================================
// LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  next();
});

// ============================================
// ROUTES
// ============================================

/**
 * Health Check Endpoint
 * Used for uptime monitoring
 */
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime,
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
    },
    version: '1.0.1',
  });
});

/**
 * Search Products Endpoint
 * GET /api/search?q=iPhone
 */
app.get('/api/search', searchLimiter, validateSearchQuery, async (req, res, next) => {
  try {
    const query = req.query.q.trim();
    
    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cachedResults = cache.get(cacheKey);
    
    if (cachedResults) {
      logger.info(`Cache HIT for query: ${query}`);
      return res.json({
        query,
        products: cachedResults.slice(0, 30),
        total: cachedResults.length,
        cached: true,
      });
    }

    logger.info(`Searching for: ${query}`);
    const products = await searchProducts(query);
    
    // Cache the results
    cache.set(cacheKey, products);
    
    res.json({
      query,
      products: products.slice(0, 30),
      total: products.length,
      cached: false,
    });
  } catch (error) {
    logger.error(`Search error: ${error.message}`, { stack: error.stack });
    next(error);
  }
});

/**
 * Suggestions Endpoint
 * GET /api/suggestions?q=iph
 */
app.get('/api/suggestions', suggestionsLimiter, validateSuggestionQuery, async (req, res, next) => {
  try {
    const query = req.query.q.trim();
    
    // Check cache
    const cacheKey = `suggestions:${query.toLowerCase()}`;
    const cachedSuggestions = cache.get(cacheKey);
    
    if (cachedSuggestions) {
      logger.info(`Cache HIT for suggestions: ${query}`);
      return res.json({ suggestions: cachedSuggestions, cached: true });
    }

    const suggestions = await getSuggestions(query);
    
    // Cache suggestions
    cache.set(cacheKey, suggestions);
    
    res.json({ suggestions, cached: false });
  } catch (error) {
    logger.error(`Suggestions error: ${error.message}`);
    res.json({ suggestions: [], cached: false });
  }
});

/**
 * Clear Cache Endpoint (Admin)
 * POST /api/admin/cache/clear
 */
app.post('/api/admin/cache/clear', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  const providedKey = req.get('X-Admin-Key');
  
  if (!adminKey || providedKey !== adminKey) {
    logger.warn('Unauthorized cache clear attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  cache.flushAll();
  logger.info('Cache cleared by admin');
  res.json({ message: 'Cache cleared successfully' });
});

/**
 * Cache Stats Endpoint
 * GET /api/admin/cache/stats
 */
app.get('/api/admin/cache/stats', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  const providedKey = req.get('X-Admin-Key');
  
  if (!adminKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const stats = cache.getStats();
  res.json(stats);
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  logger.info(`🚀 DealScout Backend running on http://localhost:${PORT}`);
  logger.info(`📍 API Endpoint: http://localhost:${PORT}/api/search?q=iphone`);
  logger.info(`💡 Suggestions: http://localhost:${PORT}/api/suggestions?q=iph`);
  logger.info(`🔍 Health Check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

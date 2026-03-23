import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import apiRouter from './routes/api.js';
import { initializeDatabase } from './database/schema.js';
import { runHeartbeat } from './services/heartbeat.js';

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.APP_API_KEY) {
  throw new Error('CRITICAL: APP_API_KEY environment variable is required for API authorization.');
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://api.anthropic.com", 
        "https://generativelanguage.googleapis.com",
        "http://localhost:3010",
        "http://localhost:3005"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3005',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(express.json());

// Basic Authorization Middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next(); // Always allow OPTIONS
  if (req.path === '/api/health' || process.env.NODE_ENV === 'test') return next();
  
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.APP_API_KEY;
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid X-API-Key' });
  }
  next();
});

// Initialize database
initializeDatabase();

// API routes
app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✅ Backend: http://localhost:${PORT}`);
    // Start background agent processing
    runHeartbeat();
  });
}

export default app;

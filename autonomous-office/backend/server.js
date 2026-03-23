import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import apiRouter from './routes/api.js';
import { initializeDatabase } from './database/schema.js';
import { runHeartbeat } from './services/heartbeat.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: true, // Allow all origins for now to fix 'Failed to fetch'
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
  const expectedKey = process.env.APP_API_KEY || 'biuro-secret-key';
  
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

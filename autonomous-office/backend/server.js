import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { initializeDatabase } from './database/schema.js';
import { runHeartbeat } from './services/heartbeat.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

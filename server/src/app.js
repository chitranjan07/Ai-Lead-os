import express from 'express';
import cors from 'cors';
import leads from './routes/leads.js';
import followUps from './routes/followUps.js';
import dashboard from './routes/dashboard.js';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    if (origin === config.clientOrigin) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ai-lead-followup-os' }));
app.use('/api/leads', leads);
app.use('/api/followups', followUps);
app.use('/api/dashboard', dashboard);
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  next();
});
app.use(errorHandler);

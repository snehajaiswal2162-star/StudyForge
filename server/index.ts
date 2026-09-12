import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { apiRouter } from './routes/api';
import { authRouter } from './routes/auth';
import { testsRouter } from './routes/tests';
import { agentOrchestrator } from './agent/agentOrchestrator';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tests', testsRouter);
app.use('/api', apiRouter);

// Serve static frontend assets in production
const clientDistPath = path.resolve(__dirname, '../../dist/client');
app.use(express.static(clientDistPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      // In dev mode, Vite handles frontend; return informative API welcome message
      res.json({
        service: 'StudyForge Backend API Server',
        status: 'running',
        port: PORT,
        frontend: 'Vite dev server running on http://localhost:5173',
      });
    }
  });
});

app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 StudyForge Server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini (Live API)' : 'MockProvider (Deterministic Demo Fallback)'}`);
  console.log(`====================================================`);

  // Seed and autonomously populate the primary demo plan on startup
  try {
    console.log('⚡ Running initial autonomous agent loop on seeded plan: plan-sneha-dsa...');
    const result = await agentOrchestrator.runLoop('plan-sneha-dsa', 'SERVER_BOOTSTRAP');
    console.log(`✅ Initial plan ready: Status = ${result.finalStatus}, Decisions = ${result.decisions.length}`);
  } catch (err) {
    console.warn('Initial agent loop warmup note:', err);
  }
});

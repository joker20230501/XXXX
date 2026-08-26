import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import jobsRoutes from './routes/jobs.routes';
import workersRoutes from './routes/workers.routes';
import matchingRoutes from './routes/matching.routes';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// API healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Vietnam LBS Job Matcher API',
    timestamp: new Date().toISOString(),
  });
});

// Routes registration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/workers', workersRoutes);
app.use('/api/v1/matching', matchingRoutes);

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;

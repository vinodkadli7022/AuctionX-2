import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { pool } from './config/db.js';
import { redis } from './config/redis.js';
import { initSocketServer } from './sockets/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import playerRoutes from './routes/player.routes.js';
import franchiseRoutes from './routes/franchise.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const httpServer = createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'https://auction-x-2.vercel.app'].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocketServer(io);

// ─── Global Middlewares ───────────────────────────────────────────────────────
// Relax Helmet CSP for external media (Mixkit video) and allow Vercel origins
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for simpler external asset loading during tournament
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [process.env.FRONTEND_URL, 'http://localhost:5173', 'https://auction-x-2.vercel.app'].filter(Boolean);
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Attach io to every request so controllers/services can emit
app.use((req, _res, next) => { req.io = io; next(); });

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/franchises', franchiseRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'checking...',
      redis: 'checking...',
    },
    errors: {}
  };

  try {
    await pool.query('SELECT 1');
    healthStatus.services.database = 'healthy';
  } catch (err) {
    healthStatus.status = 'degraded';
    healthStatus.services.database = 'failed';
    healthStatus.errors.database = err.message;
  }

  try {
    const redisResult = await redis.ping();
    healthStatus.services.redis = redisResult === 'PONG' ? 'healthy' : 'failed';
  } catch (err) {
    healthStatus.status = 'degraded';
    healthStatus.services.redis = 'failed';
    healthStatus.errors.redis = err.message;
  }

  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);
httpServer.listen(PORT, () => {
  console.log(`🚀 AuctionX API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export { io };

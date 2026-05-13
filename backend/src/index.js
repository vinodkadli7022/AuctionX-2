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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocketServer(io);

// ─── Global Middlewares ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  try {
    const pgResult = await pool.query('SELECT 1');
    const redisResult = await redis.ping();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: pgResult.rows.length > 0 ? 'healthy' : 'degraded',
        redis: redisResult === 'PONG' ? 'healthy' : 'degraded',
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      error: err.message,
    });
  }
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);
httpServer.listen(PORT, () => {
  console.log(`🚀 AuctionX API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export { io };

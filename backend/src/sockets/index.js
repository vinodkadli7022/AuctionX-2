import jwt from 'jsonwebtoken';
import { setupAuctionSocketHandlers } from './auction.socket.js';
import { setupBidSocketHandlers } from './bid.socket.js';

/**
 * Initialize the Socket.io server with authentication middleware
 * and event handlers.
 */
export function initSocketServer(io) {
  // ─── Authentication middleware ─────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} [${socket.user?.role} | ${socket.user?.email}]`);

    // Join session room and optional private franchise room
    socket.on('auction:join', ({ sessionId, role, franchiseId }) => {
      if (sessionId) {
        socket.join(sessionId);
        console.log(`   Joined session room: ${sessionId}`);
      }

      if (role === 'franchise' && franchiseId) {
        socket.join(`franchise:${franchiseId}`);
        console.log(`   Joined franchise room: franchise:${franchiseId}`);
      }

      socket.emit('auction:joined', { message: 'Successfully joined auction', sessionId });
    });

    // Setup domain-specific handlers
    setupAuctionSocketHandlers(socket, io);
    setupBidSocketHandlers(socket, io);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} [reason: ${reason}]`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error [${socket.id}]:`, err.message);
    });
  });

  console.log('✅ Socket.io server initialized');
}

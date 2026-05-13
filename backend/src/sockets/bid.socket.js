import { bidService } from '../services/bid.service.js';

/**
 * Bid socket handlers — processes bid:place events from franchise clients.
 * Franchise identity is taken from the verified JWT, NOT from client payload.
 */
export function setupBidSocketHandlers(socket, io) {
  socket.on('bid:place', async (payload) => {
    // Only franchise role can place bids
    if (socket.user?.role !== 'franchise') {
      return socket.emit('bid:error', { message: 'Only franchise accounts can place bids' });
    }

    const { amount, sessionId } = payload;

    // Use franchiseId from verified JWT — never trust client-provided franchiseId
    const franchiseId = socket.user.franchiseId;

    if (!franchiseId) {
      return socket.emit('bid:error', { message: 'No franchise associated with your account' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return socket.emit('bid:error', { message: 'Invalid bid amount' });
    }

    if (!sessionId) {
      return socket.emit('bid:error', { message: 'Session ID required' });
    }

    try {
      await bidService.placeBid({ franchiseId, amount, sessionId }, io);
      socket.emit('bid:accepted', { amount, timestamp: new Date().toISOString() });
    } catch (err) {
      socket.emit('bid:error', { message: err.message });
    }
  });
}

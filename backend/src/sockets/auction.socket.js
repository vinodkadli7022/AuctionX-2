/**
 * Auction socket handlers for auctioneer control events.
 * Note: Most auction control goes through REST API routes (nominate, sold, unsold, pause, resume).
 * Socket handlers here deal with real-time state sync requests.
 */
export function setupAuctionSocketHandlers(socket, io) {
  // Client can request current state (e.g., after reconnect)
  socket.on('auction:get-state', async () => {
    try {
      const { auctionService } = await import('../services/auction.service.js');
      const state = await auctionService.getLiveState();
      socket.emit('auction:state-sync', state);
    } catch (err) {
      socket.emit('auction:error', { message: err.message });
    }
  });
}

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useAuctionStore } from '../stores/useAuctionStore.js';
import { useFranchiseStore } from '../stores/useFranchiseStore.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useAuctionSocket(sessionId) {
  const socketRef = useRef(null);
  const { accessToken, user } = useAuthStore();
  const auction = useAuctionStore();
  const { updateFranchisePurse } = useFranchiseStore();

  useEffect(() => {
    if (!accessToken || !sessionId) return;

    // Create socket with JWT auth
    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // ─── Connection ─────────────────────────────────────────────────────────
    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('auction:join', {
        sessionId,
        role: user?.role,
        franchiseId: user?.franchiseId,
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
      // Re-join rooms after reconnect
      socket.emit('auction:join', {
        sessionId,
        role: user?.role,
        franchiseId: user?.franchiseId,
      });
    });

    // ─── Auction Events ──────────────────────────────────────────────────────
    socket.on('auction:session-started', auction.onSessionStarted);
    socket.on('auction:player-nominated', auction.onPlayerNominated);
    socket.on('auction:bid-placed', auction.onBidPlaced);
    socket.on('auction:timer-tick', auction.onTimerTick);
    socket.on('auction:player-sold', auction.onPlayerSold);
    socket.on('auction:player-unsold', auction.onPlayerUnsold);
    socket.on('auction:session-paused', auction.onSessionPaused);
    socket.on('auction:session-resumed', auction.onSessionResumed);
    socket.on('auction:session-ended', auction.onSessionEnded);

    // ─── Franchise Private Events ────────────────────────────────────────────
    socket.on('franchise:purse-updated', updateFranchisePurse);

    // ─── State Sync (for reconnects) ─────────────────────────────────────────
    socket.on('auction:state-sync', (state) => {
      auction.hydrateFromServer(state);
    });

    // ─── Bid Events ──────────────────────────────────────────────────────────
    socket.on('bid:accepted', () => auction.setBidding(false));
    socket.on('bid:error', (err) => {
      console.error('Bid error:', err.message);
      auction.setBidding(false);
    });

    return () => {
      socket.off('auction:session-started');
      socket.off('auction:player-nominated');
      socket.off('auction:bid-placed');
      socket.off('auction:timer-tick');
      socket.off('auction:player-sold');
      socket.off('auction:player-unsold');
      socket.off('auction:session-paused');
      socket.off('auction:session-resumed');
      socket.off('auction:session-ended');
      socket.off('franchise:purse-updated');
      socket.disconnect();
    };
  }, [accessToken, sessionId]);

  const placeBid = (amount) => {
    if (!socketRef.current?.connected) return;
    auction.setBidding(true);
    socketRef.current.emit('bid:place', { amount, sessionId });
  };

  const requestStateSync = () => {
    socketRef.current?.emit('auction:get-state');
  };

  return { socket: socketRef.current, placeBid, requestStateSync };
}

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
    if (!accessToken) return;

    // Create socket with JWT auth immediately upon login
    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      // If we already have a sessionId, join immediately
      if (sessionId) {
        socket.emit('auction:join', {
          sessionId,
          role: user?.role,
          franchiseId: user?.franchiseId,
        });
      }
    });

    socket.on('connect_error', (err) => console.error('Socket error:', err.message));
    socket.on('disconnect', (reason) => console.warn('Socket disconnected:', reason));

    socket.on('reconnect', () => {
      if (sessionId) {
        socket.emit('auction:join', {
          sessionId,
          role: user?.role,
          franchiseId: user?.franchiseId,
        });
      }
    });

    // ─── Auction Events ──────────────────────────────────────────────────────
    socket.on('auction:session-started', (data) => {
      console.log('🏁 Session started event received');
      auction.onSessionStarted(data);
    });
    socket.on('auction:player-nominated', auction.onPlayerNominated);
    socket.on('auction:bid-placed', auction.onBidPlaced);
    socket.on('auction:timer-tick', auction.onTimerTick);
    socket.on('auction:player-sold', auction.onPlayerSold);
    socket.on('auction:player-unsold', auction.onPlayerUnsold);
    socket.on('auction:session-paused', auction.onSessionPaused);
    socket.on('auction:session-resumed', auction.onSessionResumed);
    socket.on('auction:session-ended', auction.onSessionEnded);
    socket.on('franchise:purse-updated', updateFranchisePurse);
    socket.on('auction:state-sync', (state) => auction.hydrateFromServer(state));
    socket.on('bid:accepted', () => auction.setBidding(false));
    socket.on('bid:error', (err) => {
      console.error('Bid error:', err.message);
      auction.setBidding(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  // Separate effect to join/re-join room when sessionId changes
  useEffect(() => {
    if (socketRef.current?.connected && sessionId) {
      socketRef.current.emit('auction:join', {
        sessionId,
        role: user?.role,
        franchiseId: user?.franchiseId,
      });
    }
  }, [sessionId]);

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

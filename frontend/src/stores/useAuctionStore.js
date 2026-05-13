import { create } from 'zustand';

export const useAuctionStore = create((set, get) => ({
  sessionId: null,
  sessionStatus: null, // 'live' | 'paused' | 'ended' | null
  sessionName: null,
  currentPlayer: null,
  currentHighestBid: 0,
  leadingFranchise: null,
  timerEndTimestamp: null,
  timerSeconds: 30,
  bidHistory: [],       // last 10 bids
  soldHistory: [],      // all sold players
  isNominating: false,
  isBidding: false,

  // Hydrate from REST state-recovery endpoint
  hydrateFromServer: (state) => {
    if (!state) return;
    set({
      sessionId: state.sessionId,
      sessionStatus: state.sessionStatus,
      sessionName: state.sessionName,
      currentPlayer: state.currentPlayerData,
      currentHighestBid: state.currentHighestBid || 0,
      timerEndTimestamp: state.timerEndTimestamp,
      leadingFranchise: state.leadingFranchiseId ? {
        id: state.leadingFranchiseId,
        name: state.leadingFranchiseName,
        logoUrl: state.leadingFranchiseLogoUrl,
        primaryColor: state.leadingFranchiseColor,
      } : null,
    });
  },

  // Socket event handlers
  onSessionStarted: (state) => {
    set({
      sessionId: state.sessionId,
      sessionStatus: 'live',
      sessionName: state.sessionName,
      currentPlayer: null,
      currentHighestBid: 0,
      leadingFranchise: null,
      bidHistory: [],
    });
  },

  onPlayerNominated: ({ player, timerEndTimestamp }) => {
    set({
      currentPlayer: player,
      currentHighestBid: player.base_price,
      leadingFranchise: null,
      timerEndTimestamp,
      bidHistory: [],
      timerSeconds: 30,
    });
  },

  onBidPlaced: ({ amount, franchiseId, franchiseName, franchiseLogo, franchiseColor, newTimerEnd, timestamp, bidCount }) => {
    const bid = { amount, franchiseId, franchiseName, franchiseLogo, franchiseColor, timestamp };
    set((s) => ({
      currentHighestBid: amount,
      leadingFranchise: { id: franchiseId, name: franchiseName, logoUrl: franchiseLogo, primaryColor: franchiseColor },
      timerEndTimestamp: newTimerEnd,
      bidHistory: [bid, ...s.bidHistory].slice(0, 10),
    }));
  },

  onTimerTick: ({ secondsRemaining }) => {
    set({ timerSeconds: secondsRemaining });
  },

  onPlayerSold: ({ player, franchise, finalPrice }) => {
    set((s) => ({
      currentPlayer: null,
      currentHighestBid: 0,
      leadingFranchise: null,
      timerEndTimestamp: null,
      soldHistory: [{ player, franchise, finalPrice }, ...s.soldHistory],
    }));
  },

  onPlayerUnsold: ({ player }) => {
    set({ currentPlayer: null, currentHighestBid: 0, leadingFranchise: null, timerEndTimestamp: null });
  },

  onSessionPaused: () => set({ sessionStatus: 'paused' }),
  onSessionResumed: () => set({ sessionStatus: 'live' }),
  onSessionEnded: () => set({ sessionStatus: 'ended', currentPlayer: null }),

  setSoldHistory: (history) => set({ soldHistory: history }),
  setNominating: (v) => set({ isNominating: v }),
  setBidding: (v) => set({ isBidding: v }),
  reset: () => set({ sessionId: null, sessionStatus: null, currentPlayer: null, currentHighestBid: 0, leadingFranchise: null, bidHistory: [], timerSeconds: 30 }),
}));

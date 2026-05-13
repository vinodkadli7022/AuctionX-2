import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useAuctionStore } from '../stores/useAuctionStore.js';
import { useFranchiseStore } from '../stores/useFranchiseStore.js';
import { useAuctionSocket } from '../hooks/useAuctionSocket.js';
import { auctionApi } from '../api/index.js';
import { CountdownRing } from '../components/ui/CountdownRing.jsx';
import { BidTicker } from '../components/auction/BidTicker.jsx';
import { MoneyDisplay } from '../components/ui/MoneyDisplay.jsx';
import { getBidIncrements, formatMoney } from '../utils/money.js';

import stadiumBg from '../assets/stadium-bg.png';

export default function FranchisePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const auction = useAuctionStore();
  const { franchises, fetchFranchises } = useFranchiseStore();
  const [customAmount, setCustomAmount] = useState('');
  const [lastBidStatus, setLastBidStatus] = useState(null); // 'accepted' | 'error' | null
  const [bidErrorMsg, setBidErrorMsg] = useState('');

  const myFranchise = franchises.find(f => f.id === id) || franchises.find(f => f.id === user?.franchiseId);
  const isMyTurn = auction.leadingFranchise?.id === id || auction.leadingFranchise?.id === user?.franchiseId;
  const { placeBid, socket } = useAuctionSocket(auction.sessionId);

  useEffect(() => {
    fetchFranchises();
    auctionApi.getSession().then(res => {
      if (res.data) auction.hydrateFromServer(res.data);
    }).catch(() => {});
  }, []);

  // Socket bid feedback
  useEffect(() => {
    if (!socket) return;
    socket.on('bid:accepted', () => { setLastBidStatus('accepted'); setTimeout(() => setLastBidStatus(null), 2000); });
    socket.on('bid:error', ({ message }) => {
      setLastBidStatus('error');
      setBidErrorMsg(message);
      setTimeout(() => setLastBidStatus(null), 3000);
    });
    return () => { socket.off('bid:accepted'); socket.off('bid:error'); };
  }, [socket]);

  const handleBid = (amount) => {
    console.log('🔘 Bid Attempt:', { amount, sessionId: auction.sessionId, canBid, isBidding: auction.isBidding, socketConnected: socket?.connected });
    if (auction.isBidding || !auction.sessionId) {
      console.warn('❌ Bid Blocked:', { isBidding: auction.isBidding, hasSession: !!auction.sessionId });
      return;
    }
    setLastBidStatus(null);
    setBidErrorMsg('');
    placeBid(amount);
  };

  const handleCustomBid = () => {
    const amount = parseInt(customAmount, 10);
    if (!amount || amount <= 0) return;
    handleBid(amount);
    setCustomAmount('');
  };

  const hasPlayer = !!auction.currentPlayer;
  const isLive = auction.sessionStatus === 'live';
  const isPaused = auction.sessionStatus === 'paused';
  const isEnded = auction.sessionStatus === 'ended';
  const bidIncrements = getBidIncrements(auction.currentHighestBid, auction.bidCount === 0);

  // Check if this franchise can bid (purse / squad / overseas constraints)
  const canBid = myFranchise && isLive && hasPlayer &&
    myFranchise.purse_remaining >= auction.currentHighestBid &&
    myFranchise.squad_count < 25 &&
    !(auction.currentPlayer?.nationality === 'Overseas' && myFranchise.overseas_count >= 8);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={stadiumBg}
        className="absolute inset-0 z-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        style={{ filter: 'brightness(0.3) contrast(1.1) saturate(0.8)' }}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-sports-stadium-lights-and-field-4444-large.mp4" type="video/mp4" />
      </video>
      
      {/* Dynamic Overlays */}
      <div className="absolute inset-0 z-10 bg-black/60" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent to-black" />

      {/* Header */}
      <header className="relative z-30 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-white/10 backdrop-blur-xl bg-black/40 gap-4 md:gap-0">
        <div className="flex items-center gap-4">
          {myFranchise && (
            <>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-display font-black text-white text-base md:text-xl shadow-2xl shrink-0"
                style={{ 
                  background: myFranchise.primary_color,
                  boxShadow: `0 8px 25px ${myFranchise.primary_color}66`
                }}>
                {myFranchise.short_name}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base md:text-2xl font-black text-white tracking-tighter uppercase truncate leading-none">{myFranchise.name}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1.5">
                  <div className="flex items-center gap-1.5 text-gold font-black text-[10px] md:text-xs uppercase tracking-widest">
                    <span>Purse:</span>
                    <MoneyDisplay lakhs={myFranchise.purse_remaining} size="xs" className="text-gold" />
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                  <div className="text-white/40 font-black text-[8px] md:text-[10px] uppercase tracking-widest">
                    Squad: {myFranchise.squad_count}/25 • OVS: {myFranchise.overseas_count}/8
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
          <div className={`flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black border transition-all duration-500 ${
            isLive ? 'bg-green-500/20 border-green-500/40 text-green-500' :
            isPaused ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isLive ? 'animate-pulse bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-white/20'}`} />
            {auction.sessionStatus?.toUpperCase() || 'OFFLINE'}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/franchise/${id}/squad`)} className="text-[9px] md:text-xs font-black text-white/40 hover:text-gold uppercase tracking-widest transition-all">My Squad</button>
            <button onClick={logout} className="px-3 md:px-5 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-y-auto lg:overflow-hidden no-scrollbar">

        {/* LEFT: Player Info (40%) */}
        <div className="lg:w-2/5 border-r border-white/5 p-4 md:p-6 flex flex-col gap-4">
          {!hasPlayer ? (
            <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center text-center">
              {isPaused ? (
                <div className="slide-in">
                  <div className="text-5xl mb-4">⏸️</div>
                  <p className="font-display text-2xl text-yellow-400 font-black uppercase tracking-tighter">Auction Paused</p>
                  <p className="text-white/40 text-sm mt-2 font-medium">Strategize with your team. Resuming soon.</p>
                </div>
              ) : isEnded ? (
                <div className="slide-in">
                  <div className="text-5xl mb-4">🏁</div>
                  <p className="font-display text-2xl text-white font-black uppercase tracking-tighter">Auction Ended</p>
                  <button onClick={() => navigate(`/franchise/${id}/squad`)}
                    className="mt-6 px-8 py-3 rounded-xl bg-gold text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl">
                    View Final Squad
                  </button>
                </div>
              ) : (
                <div className="slide-in">
                  <div className="text-5xl mb-4 animate-bounce">⏳</div>
                  <p className="text-white/40 text-sm font-black uppercase tracking-[0.2em]">Next player coming up...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-[2rem] overflow-hidden slide-in flex flex-col bg-black/40 border border-white/10">
              <div className="relative h-48 md:h-72 overflow-hidden">
                {auction.currentPlayer.photo_url
                  ? <img src={auction.currentPlayer.photo_url} alt={auction.currentPlayer.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-b from-white/5 to-white/10 opacity-20">🏏</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-4 right-4 text-3xl drop-shadow-2xl">{auction.currentPlayer.nationality === 'Indian' ? '🇮🇳' : '🌍'}</div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-2">{auction.currentPlayer.name}</h2>
                  <div className="flex items-center gap-3 text-white/60 font-black text-[10px] md:text-xs uppercase tracking-widest">
                     <span>{auction.currentPlayer.role}</span>
                     <span className="w-1 h-1 rounded-full bg-white/20" />
                     <span>Age {auction.currentPlayer.age}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 grid grid-cols-3 gap-3 md:gap-4 bg-white/5">
                <div className="bg-black/30 rounded-xl p-3 md:p-4 text-center border border-white/5">
                  <p className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Base Price</p>
                  <MoneyDisplay lakhs={auction.currentPlayer.base_price} size="sm md:text-lg" className="text-gold" />
                </div>
                <div className="bg-black/30 rounded-xl p-3 md:p-4 text-center border border-white/5">
                  <p className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">IPL Caps</p>
                  <p className="font-display text-base md:text-xl font-black text-white mt-1">{auction.currentPlayer.ipl_caps}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 md:p-4 text-center border border-white/5">
                  <p className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Category</p>
                  <p className="text-xs md:text-sm font-black text-white mt-1.5 uppercase tracking-tighter truncate">{auction.currentPlayer.nationality}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Bidding Panel (60%) */}
        <div className="lg:w-3/5 p-4 md:p-6 flex flex-col gap-4 md:gap-6">

          {/* Current Bid Display */}
          <div className="glass rounded-[2rem] p-6 md:p-10 text-center relative overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent pointer-events-none" />
            <p className="text-[9px] md:text-xs text-white/30 font-black uppercase tracking-[0.2em] mb-2 md:mb-4">Current Highest Bid</p>
            <div className={auction.leadingFranchise ? 'gold-pulse' : ''}>
              <MoneyDisplay lakhs={auction.currentHighestBid} size="4xl md:text-6xl" className="text-gold font-black tracking-tighter" />
            </div>

            {auction.leadingFranchise && (
              <div className="flex items-center justify-center gap-3 mt-4 md:mt-6 slide-in">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] md:text-xs shadow-xl"
                  style={{ background: auction.leadingFranchise.primaryColor }}>
                  {auction.leadingFranchise.short_name}
                </div>
                <span className="text-sm md:text-lg font-black text-white uppercase tracking-tight">{auction.leadingFranchise.name}</span>
              </div>
            )}

            {/* Status Badges */}
            {hasPlayer && auction.leadingFranchise && (
              <div className="mt-6 md:mt-10">
                {isMyTurn ? (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/40 text-green-500 font-black text-xs md:text-sm uppercase tracking-widest shadow-xl">
                    <span className="animate-pulse">●</span> YOU ARE LEADING
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 font-black text-xs md:text-sm uppercase tracking-widest animate-pulse shadow-xl">
                    ⚠ OUTBID — RAISE THE STAKES
                  </div>
                )}
              </div>
            )}

            {/* Timer */}
            {hasPlayer && (
              <div className="absolute top-6 right-6 scale-75 md:scale-100 origin-top-right">
                <CountdownRing totalSeconds={30} secondsRemaining={auction.timerSeconds} />
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {lastBidStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 text-red-400 text-xs md:text-sm font-black uppercase tracking-tight slide-in shadow-xl">
              ⚠️ {bidErrorMsg}
            </div>
          )}
          {lastBidStatus === 'accepted' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4 text-green-400 text-xs md:text-sm font-black uppercase tracking-tight slide-in shadow-xl">
              ⚡ BID ACCEPTED
            </div>
          )}

          {/* Bid Buttons */}
          {hasPlayer && isLive && (
            <div className="relative">
              {/* Diagnostic Debug Panel (Visible only if connection or eligibility is an issue) */}
              {(!socket?.connected || !canBid || !auction.sessionId) && (
                <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-[10px] uppercase tracking-widest font-bold text-blue-400 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    SOCKET: {socket?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${auction.sessionId ? 'bg-green-500' : 'bg-red-500'}`} />
                    SESSION: {auction.sessionId ? 'ACTIVE' : 'NONE'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${canBid ? 'bg-green-500' : 'bg-red-500'}`} />
                    ELIGIBLE: {canBid ? 'YES' : 'NO'}
                  </div>
                </div>
              )}

              {!canBid && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-[2rem] z-10 flex items-center justify-center p-6 text-center border border-white/10">
                  <div>
                    <div className="text-5xl mb-4">🛑</div>
                    <p className="text-white font-black text-xl uppercase tracking-tight">Bid Restricted</p>
                    <p className="text-white/40 text-sm mt-2 font-medium">
                      {myFranchise?.squad_count >= 25 ? 'Your squad is full (25/25)' :
                       myFranchise?.overseas_count >= 8 && auction.currentPlayer?.nationality === 'Overseas' ? 'Overseas limit reached (8/8)' :
                       'Insufficient purse remaining'}
                    </p>
                  </div>
                </div>
              )}
              <div className="glass rounded-[2rem] p-6 md:p-8 space-y-6 md:space-y-8 bg-white/5 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] md:text-xs text-white/30 font-black uppercase tracking-widest">Action Controls</p>
                  <span className="text-[10px] text-gold font-black uppercase tracking-widest">Real-time Sync Active</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
                  {bidIncrements.map(({ label, amount, increment }) => (
                    <button key={amount} onClick={() => handleBid(amount)}
                      disabled={auction.isBidding || !canBid}
                      className="flex flex-col items-center justify-center gap-1 p-4 md:p-5 rounded-2xl bg-white/5 hover:bg-gold text-white hover:text-black border border-white/10 hover:border-gold transition-all duration-300 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white group transform active:scale-95 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50 group-hover:opacity-100">+{increment}</span>
                      <span className="font-display font-black text-base md:text-xl tracking-tighter">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <input
                    type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Custom Bid (Lakhs)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-6 py-4 md:py-5 text-white text-base md:text-xl focus:outline-none focus:border-gold/60 font-black transition-all placeholder:text-white/10"
                    onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
                    disabled={!canBid}
                  />
                  <button onClick={handleCustomBid} disabled={auction.isBidding || !canBid || !customAmount}
                    className="w-full sm:w-auto px-10 py-4 md:py-5 rounded-xl md:rounded-2xl bg-gold text-black font-display font-black text-xl uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 shadow-xl transform active:scale-95">
                    {auction.isBidding ? 'Wait...' : 'Place Bid'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bid Ticker */}
          <div className="glass rounded-[2rem] p-6 md:p-8 flex-1 bg-black/40 border border-white/10 overflow-hidden flex flex-col shadow-2xl">
            <h3 className="text-[10px] md:text-xs text-white/30 font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Auction Momentum</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[200px]">
               <BidTicker bids={auction.bidHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

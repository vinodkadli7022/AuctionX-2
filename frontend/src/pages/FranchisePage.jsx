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
    if (auction.isBidding || !auction.sessionId) return;
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
  const bidIncrements = getBidIncrements(auction.currentHighestBid);

  // Check if this franchise can bid (purse / squad / overseas constraints)
  const canBid = myFranchise && isLive && hasPlayer &&
    myFranchise.purse_remaining > auction.currentHighestBid &&
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
      <header className="relative z-30 flex items-center justify-between px-8 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-6">
          {myFranchise && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-white text-xl shadow-2xl"
                style={{ 
                  background: myFranchise.primary_color,
                  boxShadow: `0 10px 30px ${myFranchise.primary_color}66`
                }}>
                {myFranchise.short_name}
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-white tracking-tighter uppercase">{myFranchise.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-gold font-bold text-xs uppercase tracking-widest">
                    <span>Purse:</span>
                    <MoneyDisplay lakhs={myFranchise.purse_remaining} size="xs" className="text-gold" />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="text-white/40 font-bold text-[10px] uppercase tracking-widest">
                    Squad: {myFranchise.squad_count}/25 • Overseas: {myFranchise.overseas_count}/8
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black border transition-all duration-500 ${
            isLive ? 'bg-green-500/20 border-green-500/40 text-green-500' :
            isPaused ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'animate-pulse bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-white/20'}`} />
            {auction.sessionStatus?.toUpperCase() || 'OFFLINE'}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/franchise/${id}/squad`)} className="text-xs font-black text-white/40 hover:text-gold uppercase tracking-widest transition-all">My Squad</button>
            <button onClick={logout} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">

        {/* LEFT: Player Info (40%) */}
        <div className="lg:w-2/5 border-r border-white/5 p-5 flex flex-col gap-4">
          {!hasPlayer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              {isPaused ? (
                <>
                  <div className="text-5xl mb-3">⏸️</div>
                  <p className="font-display text-xl text-yellow-400">Session Paused</p>
                  <p className="text-sm mt-1">The auctioneer will resume shortly</p>
                </>
              ) : isEnded ? (
                <>
                  <div className="text-5xl mb-3">🏁</div>
                  <p className="font-display text-xl text-white">Auction Ended</p>
                  <button onClick={() => navigate(`/franchise/${id}/squad`)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-gold text-black font-bold hover:bg-gold-hover transition-colors">
                    View Final Squad
                  </button>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3 animate-pulse">⏳</div>
                  <p className="text-sm">Waiting for next player...</p>
                </>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden slide-in flex-1 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                {auction.currentPlayer.photo_url
                  ? <img src={auction.currentPlayer.photo_url} alt={auction.currentPlayer.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-b from-surface to-navy">🏏</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute top-3 right-3 text-2xl">{auction.currentPlayer.nationality === 'Indian' ? '🇮🇳' : '🌍'}</div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-display text-3xl font-bold text-white">{auction.currentPlayer.name}</h2>
                  <p className="text-muted">{auction.currentPlayer.role} · Age {auction.currentPlayer.age}</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted">Base Price</p>
                  <MoneyDisplay lakhs={auction.currentPlayer.base_price} size="lg" className="text-gold" />
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted">IPL Caps</p>
                  <p className="font-display text-xl font-bold text-white mt-1">{auction.currentPlayer.ipl_caps}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted">Nationality</p>
                  <p className="text-lg mt-1">{auction.currentPlayer.nationality === 'Indian' ? '🇮🇳' : '🌍'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Bidding Panel (60%) */}
        <div className="lg:w-3/5 p-5 flex flex-col gap-5">

          {/* Current Bid Display */}
          <div className="glass rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
            <p className="text-xs text-muted uppercase tracking-widest mb-1">Current Highest Bid</p>
            <div className={auction.leadingFranchise ? 'gold-pulse' : ''}>
              <MoneyDisplay lakhs={auction.currentHighestBid} size="3xl" className="text-gold" />
            </div>

            {auction.leadingFranchise && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full"
                  style={{ background: auction.leadingFranchise.primaryColor }} />
                <span className="text-sm font-semibold text-white">{auction.leadingFranchise.name}</span>
              </div>
            )}

            {/* Leading / Outbid badge */}
            {hasPlayer && auction.leadingFranchise && (
              <div className="mt-3">
                {isMyTurn ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/50 border border-green-500/50 text-green-400 font-bold text-sm">
                    ✅ YOU ARE LEADING
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/50 border border-red-500/50 text-red-400 font-bold text-sm animate-pulse">
                    🔴 OUTBID — Place a higher bid!
                  </span>
                )}
              </div>
            )}

            {/* Timer */}
            {hasPlayer && (
              <div className="flex justify-center mt-4">
                <CountdownRing totalSeconds={30} secondsRemaining={auction.timerSeconds} />
              </div>
            )}
          </div>

          {/* Bid Error/Success Message */}
          {lastBidStatus === 'error' && (
            <div className="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm slide-in">
              ❌ {bidErrorMsg}
            </div>
          )}
          {lastBidStatus === 'accepted' && (
            <div className="bg-green-900/40 border border-green-700/50 rounded-xl px-4 py-3 text-green-300 text-sm slide-in">
              ✅ Bid placed successfully!
            </div>
          )}

          {/* Bid Buttons */}
          {hasPlayer && isLive && (
            <div className="relative">
              {!canBid && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🚫</div>
                    <p className="text-white font-semibold">Cannot Bid</p>
                    <p className="text-muted text-sm mt-1">
                      {myFranchise?.squad_count >= 25 ? 'Squad full (25/25)' :
                       myFranchise?.overseas_count >= 8 && auction.currentPlayer?.nationality === 'Overseas' ? 'Overseas limit reached (8/8)' :
                       'Insufficient purse'}
                    </p>
                  </div>
                </div>
              )}
              <div className="glass rounded-2xl p-5 space-y-4">
                <p className="text-xs text-muted uppercase tracking-widest">Quick Bid</p>
                <div className="grid grid-cols-5 gap-2">
                  {bidIncrements.map(({ label, amount, increment }) => (
                    <button key={amount} onClick={() => handleBid(amount)}
                      disabled={auction.isBidding || !canBid}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed group">
                      <span className="text-xs text-muted group-hover:text-gold">{increment}</span>
                      <span className="font-display font-bold text-white text-sm group-hover:text-gold">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="flex gap-3">
                  <input
                    type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                    placeholder="Custom amount in Lakhs..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60"
                    onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
                    disabled={!canBid}
                  />
                  <button onClick={handleCustomBid} disabled={auction.isBidding || !canBid || !customAmount}
                    className="px-5 py-2.5 rounded-lg bg-gold text-black font-display font-bold hover:bg-gold-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    {auction.isBidding ? '⏳' : 'Place Bid'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Overlay when no player */}
          {!hasPlayer && isLive && (
            <div className="glass rounded-2xl p-6 text-center border border-white/5">
              <div className="text-4xl mb-2 animate-pulse">⏳</div>
              <p className="text-muted">Waiting for the next player to be nominated...</p>
            </div>
          )}

          {/* Bid Ticker */}
          <div className="glass rounded-2xl p-4 flex-1">
            <h3 className="text-xs text-muted uppercase tracking-widest mb-3">Live Bid Feed</h3>
            <BidTicker bids={auction.bidHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

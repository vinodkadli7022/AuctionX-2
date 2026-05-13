import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useAuctionStore } from '../stores/useAuctionStore.js';
import { useFranchiseStore } from '../stores/useFranchiseStore.js';
import { usePlayerStore } from '../stores/usePlayerStore.js';
import { useAuctionSocket } from '../hooks/useAuctionSocket.js';
import { auctionApi } from '../api/index.js';
import { CountdownRing } from '../components/ui/CountdownRing.jsx';
import { BidTicker } from '../components/auction/BidTicker.jsx';
import { FranchisePurseCard } from '../components/franchise/FranchisePurseCard.jsx';
import { MoneyDisplay } from '../components/ui/MoneyDisplay.jsx';

function NominateModal({ onClose, onNominate }) {
  const { upcomingPlayers, fetchUpcoming } = usePlayerStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUpcoming(); }, []);

  const filtered = upcomingPlayers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Select Next Player</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="p-4 border-b border-white/10">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search player..." autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-muted py-8">No upcoming players found</p>
          )}
          {filtered.map(p => (
            <button key={p.id} onClick={() => { onNominate(p.id); onClose(); }}
              className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gold/30 transition-all text-left group">
              <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏏</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white group-hover:text-gold transition-colors">{p.name}</p>
                <p className="text-xs text-muted">{p.role} · {p.nationality === 'Indian' ? '🇮🇳' : '🌍'}</p>
              </div>
              <span className="font-display font-bold text-gold text-sm flex-shrink-0">
                {p.base_price >= 100 ? `${p.base_price/100} Cr` : `${p.base_price} L`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuctioneerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const auction = useAuctionStore();
  const { franchises, fetchFranchises } = useFranchiseStore();
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionName, setSessionName] = useState('IPL Mega Auction 2025');
  const [showStartForm, setShowStartForm] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const { socket } = useAuctionSocket(auction.sessionId);

  useEffect(() => {
    fetchFranchises();
    // Hydrate from server on mount
    import('../api/index.js').then(({ auctionApi }) => {
      auctionApi.getSession().then(res => {
        if (res.data) {
          auction.hydrateFromServer(res.data);
          setSessionStarted(true);
        }
      }).catch(() => {});
    });
  }, []);

  const showStatus = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 3000); };

  const handleAction = async (action, label) => {
    setActionLoading(label);
    try {
      await action();
      showStatus(`✅ ${label} successful`);
    } catch (err) {
      showStatus(`❌ ${err.message || label + ' failed'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartSession = () => handleAction(async () => {
    await auctionApi.startSession(sessionName);
    setSessionStarted(true);
    setShowStartForm(false);
  }, 'Start Session');

  const handleNominate = (playerId) => handleAction(() => auctionApi.nominate(playerId), 'Nominate');
  const handleSold = () => handleAction(() => auctionApi.sold(), 'Sold');
  const handleUnsold = () => handleAction(() => auctionApi.unsold(), 'Unsold');
  const handlePause = () => handleAction(() => auctionApi.pause(), 'Pause');
  const handleResume = () => handleAction(() => auctionApi.resume(), 'Resume');
  const handleEnd = () => handleAction(async () => { await auctionApi.endSession(); setSessionStarted(false); }, 'End Session');

  const isPaused = auction.sessionStatus === 'paused';
  const isLive = auction.sessionStatus === 'live';
  const hasPlayer = !!auction.currentPlayer;
  const hasBid = !!auction.leadingFranchise;

  return (
    <div className="min-h-screen bg-navy flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0d1224 0%, #0a0a1a 100%)' }}>
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl font-bold text-white">AUCTION<span className="text-gold">X</span></h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full live-dot ${isLive ? 'bg-green-400' : isPaused ? 'bg-yellow-400' : 'bg-gray-600'}`} />
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              {auction.sessionStatus || 'Idle'}
            </span>
          </div>
          {auction.sessionName && <span className="text-sm text-muted hidden md:block">{auction.sessionName}</span>}
        </div>
        <div className="flex items-center gap-3">
          {statusMsg && <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white">{statusMsg}</span>}
          <button onClick={() => navigate('/admin/players')} className="text-sm text-muted hover:text-gold transition-colors">Players</button>
          <button onClick={logout} className="text-sm text-muted hover:text-red-400 transition-colors">Logout</button>
        </div>
      </header>

      {/* Session Start */}
      {!sessionStarted && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 w-full max-w-md text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Ready to Start</h2>
            <p className="text-muted mb-6">Configure and launch the IPL Auction session</p>
            {!showStartForm ? (
              <button onClick={() => setShowStartForm(true)}
                className="px-8 py-3 rounded-xl bg-gold text-black font-display font-bold text-lg hover:bg-gold-hover transition-colors shadow-lg shadow-gold/30">
                Start Auction Session
              </button>
            ) : (
              <div className="space-y-4 text-left">
                <input value={sessionName} onChange={e => setSessionName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/60"
                  placeholder="Session name..." />
                <button onClick={handleStartSession} disabled={!!actionLoading}
                  className="w-full py-3 rounded-xl bg-gold text-black font-display font-bold text-lg hover:bg-gold-hover transition-colors disabled:opacity-50">
                  {actionLoading ? 'Starting...' : '🚀 Launch Auction'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Control Panel */}
      {sessionStarted && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">

            {/* LEFT: Player Card (30%) */}
            <div className="col-span-4 border-r border-white/5 p-5 flex flex-col gap-4 overflow-y-auto">
              <h2 className="font-display text-sm font-bold text-muted uppercase tracking-widest">On The Block</h2>
              {!hasPlayer ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted">
                    <div className="text-5xl mb-3">👤</div>
                    <p className="text-sm">No player nominated</p>
                    <p className="text-xs mt-1">Click "Nominate Next" to begin</p>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl overflow-hidden slide-in">
                  <div className="relative h-52 bg-gradient-to-b from-surface to-navy overflow-hidden">
                    {auction.currentPlayer.photo_url
                      ? <img src={auction.currentPlayer.photo_url} alt={auction.currentPlayer.name} className="w-full h-full object-cover object-top" />
                      : <div className="w-full h-full flex items-center justify-center text-7xl">🏏</div>}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {['Batsman','Bowler','All-Rounder','Wicketkeeper'].includes(auction.currentPlayer.role) && (
                        <span className={`px-2 py-1 rounded text-xs font-bold badge-${auction.currentPlayer.role === 'All-Rounder' ? 'allrounder' : auction.currentPlayer.role.toLowerCase()}`}>
                          {auction.currentPlayer.role}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 text-2xl">
                      {auction.currentPlayer.nationality === 'Indian' ? '🇮🇳' : '🌍'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-2xl font-bold text-white">{auction.currentPlayer.name}</h3>
                      <p className="text-muted text-sm">Age {auction.currentPlayer.age} · {auction.currentPlayer.ipl_caps} IPL caps</p>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-muted">Base Price</p>
                      <MoneyDisplay lakhs={auction.currentPlayer.base_price} size="lg" className="text-gold" />
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-muted">Nationality</p>
                      <p className="text-white font-semibold mt-1">{auction.currentPlayer.nationality}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CENTER: Bid Display + Timer (40%) */}
            <div className="col-span-5 border-r border-white/5 p-5 flex flex-col items-center gap-5 overflow-y-auto">
              {/* Current Bid */}
              <div className="w-full text-center">
                <p className="text-xs text-muted uppercase tracking-widest mb-2">Current Highest Bid</p>
                <div className={`${hasBid ? 'gold-pulse' : ''}`}>
                  <MoneyDisplay lakhs={auction.currentHighestBid} size="3xl" className="text-gold" />
                </div>
                {!hasBid && hasPlayer && (
                  <p className="text-sm text-muted mt-1">Base price — no bids yet</p>
                )}
              </div>

              {/* Leading Franchise */}
              {auction.leadingFranchise && (
                <div className="flex flex-col items-center gap-2 slide-in">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white border-2"
                    style={{ background: auction.leadingFranchise.primaryColor, borderColor: auction.leadingFranchise.primaryColor, boxShadow: `0 0 30px ${auction.leadingFranchise.primaryColor}66` }}
                  >
                    {auction.leadingFranchise.logoUrl
                      ? <img src={auction.leadingFranchise.logoUrl} alt="" className="w-16 h-16 object-contain" />
                      : auction.leadingFranchise.name?.substring(0,3)}
                  </div>
                  <p className="text-white font-display font-bold text-lg">{auction.leadingFranchise.name}</p>
                  <span className="text-xs text-green-400 bg-green-900/40 border border-green-700/50 px-3 py-1 rounded-full">HIGHEST BIDDER</span>
                </div>
              )}

              {/* Timer */}
              {hasPlayer && (
                <div className="flex flex-col items-center gap-3">
                  <CountdownRing totalSeconds={30} secondsRemaining={auction.timerSeconds} />
                  <p className="text-xs text-muted">Countdown Timer</p>
                </div>
              )}

              {/* Bid Ticker */}
              <div className="w-full">
                <h3 className="text-xs text-muted uppercase tracking-widest mb-3">Live Bid Feed</h3>
                <BidTicker bids={auction.bidHistory} />
              </div>
            </div>

            {/* RIGHT: Franchise Cards (30%) */}
            <div className="col-span-3 p-5 overflow-y-auto">
              <h2 className="font-display text-sm font-bold text-muted uppercase tracking-widest mb-3">Franchise Purses</h2>
              <div className="space-y-3">
                {franchises.map(f => (
                  <FranchisePurseCard
                    key={f.id} franchise={f} compact
                    isLeading={auction.leadingFranchise?.id === f.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM: Control Bar */}
          <div className="border-t border-white/10 bg-black/40 px-6 py-4 flex items-center gap-4 flex-wrap">
            {/* Nominate */}
            <button
              onClick={() => setShowNominateModal(true)}
              disabled={!!actionLoading || !isLive || hasPlayer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎯 Nominate Next
            </button>

            {/* Sold */}
            <button
              onClick={handleSold}
              disabled={!!actionLoading || !hasBid || !hasPlayer}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading === 'Sold' ? '⏳' : '✅'} SOLD
            </button>

            {/* Unsold */}
            <button
              onClick={handleUnsold}
              disabled={!!actionLoading || !hasPlayer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading === 'Unsold' ? '⏳' : '❌'} Unsold
            </button>

            {/* Pause / Resume */}
            {isPaused ? (
              <button onClick={handleResume} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-sm transition-all disabled:opacity-40">
                ▶️ Resume
              </button>
            ) : (
              <button onClick={handlePause} disabled={!!actionLoading || !isLive}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-700 hover:bg-yellow-600 text-white font-semibold text-sm transition-all disabled:opacity-40">
                ⏸️ Pause
              </button>
            )}

            <div className="flex-1" />

            {/* End Session */}
            <button onClick={handleEnd} disabled={!!actionLoading}
              className="px-4 py-2 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/30 text-sm font-medium transition-all disabled:opacity-40">
              End Session
            </button>
          </div>
        </div>
      )}

      {showNominateModal && (
        <NominateModal onClose={() => setShowNominateModal(false)} onNominate={handleNominate} />
      )}
    </div>
  );
}

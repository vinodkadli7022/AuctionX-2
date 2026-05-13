import { useEffect, useState } from 'react';
import { useAuctionStore } from '../stores/useAuctionStore.js';
import { useFranchiseStore } from '../stores/useFranchiseStore.js';
import { useAuctionSocket } from '../hooks/useAuctionSocket.js';
import { auctionApi, playerApi } from '../api/index.js';
import { BidTicker } from '../components/auction/BidTicker.jsx';
import { MoneyDisplay } from '../components/ui/MoneyDisplay.jsx';
import { formatMoney } from '../utils/money.js';
import stadiumBg from '../assets/stadium-bg.png';

const ROLE_BADGE = {
  'Batsman':     'badge-batsman',
  'Bowler':      'badge-bowler',
  'All-Rounder': 'badge-allrounder',
  'Wicketkeeper':'badge-keeper',
};

export default function SpectatorPage() {
  const auction = useAuctionStore();
  const { franchises, fetchFranchises } = useFranchiseStore();
  const [soldHistory, setSoldHistory] = useState([]);

  // Connect socket as spectator
  useAuctionSocket(auction.sessionId);

  useEffect(() => {
    fetchFranchises();
    auctionApi.getSession().then(res => {
      if (res.data) auction.hydrateFromServer(res.data);
    }).catch(() => {});

    playerApi.getSoldHistory().then(res => {
      setSoldHistory(res.data || []);
    }).catch(() => {});
  }, []);

  // Update sold history when a player is sold
  useEffect(() => {
    if (auction.soldHistory.length > 0) {
      playerApi.getSoldHistory().then(res => setSoldHistory(res.data || [])).catch(() => {});
    }
  }, [auction.soldHistory.length]);

  const sortedFranchises = [...franchises].sort((a, b) =>
    (b.purse_total - b.purse_remaining) - (a.purse_total - a.purse_remaining)
  );

  const totalSpent = franchises.reduce((sum, f) => sum + (f.purse_total - f.purse_remaining), 0);
  const isLive = auction.sessionStatus === 'live';
  const isPaused = auction.sessionStatus === 'paused';

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
      <div className="absolute inset-0 z-10 bg-black/40" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent to-black" />

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">🏏</span>
            <h1 className="font-display text-xl md:text-3xl font-black tracking-tighter uppercase leading-none">
              AUCTION<span className="text-gold">X</span>
            </h1>
          </div>
          <div className="h-6 w-px bg-white/10 hidden lg:block" />
          <span className="text-[10px] md:text-sm font-bold tracking-[0.2em] text-white/40 uppercase hidden lg:block">
            {auction.sessionName || 'IPL Global Auction'}
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Live Circulation</p>
            <span className="font-display font-black text-gold text-lg md:text-2xl drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              {formatMoney(totalSpent)}
            </span>
          </div>
          <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-xs font-black border transition-all duration-500 ${
            isLive ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
            isPaused ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${isLive ? 'animate-pulse bg-red-500 shadow-[0_0_10px_#ef4444]' : isPaused ? 'bg-yellow-500' : 'bg-white/20'}`} />
            <span className="tracking-[0.1em]">{isLive ? 'LIVE' : isPaused ? 'PAUSED' : 'WAITING'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8 overflow-y-auto lg:overflow-hidden no-scrollbar">
        
        {/* Left Column: Player Focus (7/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6">
          {!auction.currentPlayer ? (
            <div className="flex-1 min-h-[400px] glass rounded-[2rem] md:rounded-[3rem] border-white/5 flex items-center justify-center bg-black/40 backdrop-blur-2xl px-6">
              <div className="text-center slide-in">
                <div className="text-6xl md:text-9xl mb-6 md:mb-8 opacity-20">🏏</div>
                <h2 className="font-display text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                  {isPaused ? 'Auction Paused' : 'Next Nomination'}
                </h2>
                <p className="text-white/40 text-sm md:text-lg max-w-md mx-auto leading-relaxed font-medium">
                  The auctioneer is preparing the next player. Grab your popcorn and stay tuned!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 md:gap-6 slide-in">
              {/* Main Player Display */}
              <div className="glass rounded-[2rem] md:rounded-[3rem] border-white/10 overflow-hidden flex flex-col bg-black/60 backdrop-blur-3xl shadow-2xl">
                <div className="relative h-[300px] md:h-[450px] overflow-hidden">
                  {auction.currentPlayer.photo_url
                    ? <img src={auction.currentPlayer.photo_url} alt={auction.currentPlayer.name} className="w-full h-full object-cover object-top" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/80 to-navy/40">
                        <span className="text-8xl md:text-[12rem] opacity-20">🏏</span>
                      </div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] md:text-sm font-black uppercase tracking-widest shadow-xl border border-white/10 ${ROLE_BADGE[auction.currentPlayer.role] || 'bg-white/10 text-white'}`}>
                      {auction.currentPlayer.role}
                    </span>
                    <span className="px-4 py-1.5 rounded-lg text-[10px] md:text-sm font-black uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
                      {auction.currentPlayer.nationality === 'Indian' ? '🇮🇳 Indian' : '🌍 Overseas'}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="font-display text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-3 drop-shadow-2xl">
                          {auction.currentPlayer.name}
                        </h2>
                        <div className="flex items-center gap-4 text-white/60 font-black uppercase tracking-[0.15em] text-[9px] md:text-sm">
                          <span>Age {auction.currentPlayer.age}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                          <span>{auction.currentPlayer.ipl_caps} IPL Caps</span>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-[9px] md:text-xs font-black uppercase tracking-widest mb-2 md:mb-4">
                          Current Valuation
                        </div>
                        <div className="flex items-baseline md:justify-end gap-2">
                           <MoneyDisplay lakhs={auction.currentHighestBid} size="4xl md:text-6xl" className={`text-white font-black tracking-tighter ${auction.leadingFranchise ? 'gold-pulse text-gold' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-6 md:p-8 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center gap-6 sm:gap-0 justify-between">
                  <div className="flex items-center gap-8 w-full sm:w-auto">
                    <div>
                      <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Base Price</p>
                      <MoneyDisplay lakhs={auction.currentPlayer.base_price} size="lg md:text-xl" className="text-white/60" />
                    </div>
                    {auction.leadingFranchise && (
                      <div className="slide-in ml-auto sm:ml-0">
                        <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Top Bidder</p>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-[10px] md:text-sm shadow-xl"
                            style={{ background: auction.leadingFranchise.primaryColor }}>
                            {auction.leadingFranchise.short_name}
                          </div>
                          <span className="font-display font-black text-white text-base md:text-xl tracking-tight">
                            {auction.leadingFranchise.short_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right w-full">
                      <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 text-center sm:text-right">Closing Timer</p>
                      <div className={`font-display font-black text-4xl md:text-5xl tabular-nums tracking-tighter text-center sm:text-right ${auction.timerSeconds <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        00:{auction.timerSeconds < 10 ? `0${auction.timerSeconds}` : auction.timerSeconds}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Feed & Standings (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-8 min-h-[400px] lg:h-auto overflow-hidden">
          {/* Bid Feed */}
          <div className="flex-1 glass rounded-[1.5rem] md:rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="font-display text-[10px] md:text-sm font-black text-white uppercase tracking-[0.2em]">Bidding Feed</h2>
              <div className="px-2 md:px-3 py-1 bg-white/10 rounded-md text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">Live</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar min-h-[250px]">
              <BidTicker bids={auction.bidHistory} />
            </div>
          </div>

          {/* Top Spenders Mini-Standings */}
          <div className="h-auto md:h-1/3 glass rounded-[1.5rem] md:rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="font-display text-[10px] md:text-sm font-black text-white uppercase tracking-[0.2em]">Franchise Spends</h2>
              <button onClick={() => fetchFranchises()} className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-widest hover:underline">Sync</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-3 custom-scrollbar">
              {sortedFranchises.slice(0, 5).map((f, i) => {
                const spent = f.purse_total - f.purse_remaining;
                const pct = (spent / f.purse_total) * 100;
                return (
                  <div key={f.id} className="flex items-center gap-4 group">
                    <div className="text-white/20 font-black text-xs w-4 italic">0{i+1}</div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg"
                      style={{ background: f.primary_color }}>
                      {f.short_name}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-white text-xs md:text-sm truncate uppercase tracking-tighter">{f.short_name}</span>
                        <span className="font-display font-black text-gold text-[10px] md:text-xs">{formatMoney(spent)}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: f.primary_color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ticker: Sold History */}
      <footer className="relative z-20 h-24 md:h-28 border-t border-white/10 bg-black/80 backdrop-blur-3xl flex items-center overflow-hidden px-4 md:px-8">
        <div className="shrink-0 flex items-center gap-3 md:gap-4 border-r border-white/10 pr-4 md:pr-8 mr-4 md:mr-8">
          <span className="text-gold text-base md:text-xl font-black italic tracking-widest uppercase leading-none">RECENTLY<br/>SOLD</span>
        </div>
        <div className="flex-1 flex items-center gap-8 md:gap-12 overflow-x-auto no-scrollbar py-2">
          {soldHistory.length === 0 ? (
            <span className="text-white/20 text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">Waiting for the hammer...</span>
          ) : (
            soldHistory.map(p => (
              <div key={p.id} className="flex items-center gap-3 md:gap-4 shrink-0 slide-in">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl md:text-2xl shadow-lg">
                  {p.role === 'Batsman' ? '🏏' : p.role === 'Bowler' ? '🥎' : '⚡'}
                </div>
                <div>
                  <div className="font-black text-white text-xs md:text-sm uppercase tracking-tight leading-none mb-1">{p.name}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-display font-black text-[10px] md:text-xs tracking-tight">{formatMoney(p.sold_price)}</span>
                    <span className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">{p.sold_to_short || p.franchise_short_name}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </footer>
    </div>
  );
}

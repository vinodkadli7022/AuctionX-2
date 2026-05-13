import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import stadiumBg from '../assets/stadium-bg.png';

const FRANCHISES = [
  { short: 'MI',   name: 'Mumbai Indians',              color: '#004BA0', emoji: '💙' },
  { short: 'CSK',  name: 'Chennai Super Kings',         color: '#F6C000', emoji: '💛' },
  { short: 'RCB',  name: 'Royal Challengers Bengaluru', color: '#CC0000', emoji: '❤️' },
  { short: 'KKR',  name: 'Kolkata Knight Riders',       color: '#3A225D', emoji: '💜' },
  { short: 'DC',   name: 'Delhi Capitals',              color: '#0078BC', emoji: '🔵' },
  { short: 'RR',   name: 'Rajasthan Royals',            color: '#EA1A85', emoji: '💗' },
  { short: 'PBKS', name: 'Punjab Kings',                color: '#ED1B24', emoji: '🔴' },
  { short: 'SRH',  name: 'Sunrisers Hyderabad',         color: '#F7A721', emoji: '🧡' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [step, setStep] = useState('landing'); // 'landing' | 'selection' | 'team-select' | 'login'
  const [selected, setSelected] = useState(null); // 'auctioneer' | franchise short
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleFranchiseClick = (f) => {
    setSelected(f.short);
    setEmail(`${f.short.toLowerCase()}@auctionx.in`);
    setPassword('');
    setLocalError('');
    setStep('login');
  };

  const handleAuctioneerClick = () => {
    setSelected('auctioneer');
    setEmail('auctioneer@auctionx.in');
    setPassword('');
    setLocalError('');
    setStep('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const user = await login(email, password);
      if (user.role === 'auctioneer') navigate('/auctioneer');
      else if (user.role === 'franchise') navigate(`/franchise/${user.franchiseId}`);
      else navigate('/spectator');
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const selectedFranchise = FRANCHISES.find(f => f.short === selected);

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-body">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={stadiumBg}
        className="absolute inset-0 z-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        style={{ filter: 'brightness(0.9) contrast(1.1)' }}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-sports-stadium-lights-and-field-4444-large.mp4" type="video/mp4" />
      </video>
      
      {/* Dynamic Overlays - Much lighter for better visibility */}
      <div className="absolute inset-0 z-10 bg-black/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/40" />

      {/* Navigation Bar */}
      <nav className="relative z-30 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('landing')}>
          <span className="text-3xl">🏏</span>
          <span className="font-display text-2xl font-black text-white tracking-tighter">
            AUCTION<span className="text-gold">X</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <button className="hover:text-gold transition-colors">Home</button>
          <button className="hover:text-gold transition-colors">Today's Auctions</button>
          <button className="hover:text-gold transition-colors">Player Pool</button>
        </div>
        <button 
          onClick={() => setStep('selection')}
          className="px-6 py-2 bg-gold text-black font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95"
        >
          Login / Join
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 py-12">
        
        {/* STEP 1: LANDING PAGE */}
        {step === 'landing' && (
          <div className="max-w-4xl text-center slide-in">
            <div className="inline-block px-4 py-1 bg-gold/20 border border-gold/30 rounded-full text-gold text-xs font-bold tracking-[0.2em] uppercase mb-8">
              #1 Professional Auction Platform
            </div>
            <h1 className="font-display text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-6">
              THE ULTIMATE<br/>
              <span className="text-gold">CRICKET AUCTION</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-white/70 mb-10 leading-relaxed font-light">
              Experience the thrill of the IPL auction with real-time bidding, professional player management, and live synchronization for franchises and fans.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setStep('selection')}
                className="w-full sm:w-auto px-10 py-5 bg-gold text-black font-display font-black text-2xl rounded-xl hover:bg-white hover:shadow-[0_0_50px_rgba(255,215,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                ENTER AUCTION ROOM
              </button>
              <button 
                onClick={() => navigate('/spectator')}
                className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-display font-black text-2xl rounded-xl hover:bg-white/20 transition-all"
              >
                WATCH LIVE →
              </button>
            </div>
            
            {/* Stats Bar */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 glass p-10 border-white/10 backdrop-blur-md bg-black/30 slide-in">
              <div className="text-center">
                <div className="text-4xl font-display font-black text-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">500+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">Players Pool</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">10+</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">Active Leagues</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">REAL-TIME</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">Bidding Engine</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">SECURE</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">Cloud Sync</div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-32 text-left slide-in">
              <h3 className="font-display text-4xl font-black text-white mb-12 text-center uppercase tracking-tight drop-shadow-2xl">
                Everything You Need for a <span className="text-gold">World-Class Auction</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-lg">
                  <div className="text-4xl mb-4">⚡</div>
                  <h4 className="text-xl font-bold text-white mb-3">Live Bidding</h4>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Ultra-low latency bidding engine ensures every bid is recorded instantly across all devices. No more delays.
                  </p>
                </div>
                <div className="p-8 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-lg">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className="text-xl font-bold text-white mb-3">Smart Analytics</h4>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    Track squad balance, purse remaining, and player stats in real-time. Make data-driven decisions on the fly.
                  </p>
                </div>
                <div className="p-8 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-lg">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="text-xl font-bold text-white mb-3">Custom Leagues</h4>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    From local tournaments to mega leagues, customize rules, base prices, and franchise limits with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOGIN CHOICE */}
        {step === 'selection' && (
          <div className="max-w-4xl w-full text-center slide-in">
            <button onClick={() => setStep('landing')} className="text-white/40 hover:text-white mb-8 flex items-center gap-2 mx-auto transition-colors">
              ← Back to Home
            </button>
            <h2 className="font-display text-5xl font-black text-white mb-12 uppercase tracking-tight">
              Select Your <span className="text-gold">Role</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-10 px-4 max-w-5xl mx-auto">
              {/* Auctioneer Card */}
              <div 
                onClick={handleAuctioneerClick}
                className="group relative p-12 rounded-[2.5rem] bg-black/60 border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-500 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_0_80px_rgba(255,215,0,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                <div className="text-8xl mb-8 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">🎙️</div>
                <h3 className="font-display text-4xl font-black text-white mb-4 uppercase tracking-tighter">Auctioneer</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Lead the tournament. Manage the flow, nominate players, and control the hammer with professional tools.
                </p>
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-gold text-black font-black uppercase tracking-widest text-sm rounded-full group-hover:bg-white transition-colors">
                  Enter Dashboard
                </div>
              </div>

              {/* Franchise Card */}
              <div 
                onClick={() => setStep('team-select')}
                className="group relative p-12 rounded-[2.5rem] bg-black/60 border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-500 backdrop-blur-xl hover:scale-[1.05] hover:shadow-[0_0_80px_rgba(255,215,0,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                <div className="text-8xl mb-8 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">🏏</div>
                <h3 className="font-display text-4xl font-black text-white mb-4 uppercase tracking-tighter">Franchise</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Build your dream squad. Bid for players, manage your purse, and outmaneuver other teams.
                </p>
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-sm rounded-full group-hover:bg-gold group-hover:text-black transition-all">
                  Select Team
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TEAM SELECTION */}
        {step === 'team-select' && (
          <div className="max-w-6xl w-full text-center slide-in">
            <button onClick={() => setStep('selection')} className="text-white/40 hover:text-white mb-8 flex items-center gap-2 mx-auto transition-colors">
              ← Back to Choice
            </button>
            <h2 className="font-display text-5xl font-black text-white mb-12 uppercase tracking-tight">
              Choose Your <span className="text-gold">Franchise</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 px-4">
              {FRANCHISES.map((f) => (
                <button
                  key={f.short}
                  onClick={() => handleFranchiseClick(f)}
                  className="group relative p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] hover:border-gold/30"
                  style={{ boxShadow: `0 0 40px ${f.color}22` }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" 
                  />
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white font-display font-black text-2xl shadow-2xl transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: f.color,
                      boxShadow: `0 10px 30px ${f.color}66`
                    }}
                  >
                    {f.short}
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-base font-black text-white group-hover:text-gold transition-colors uppercase tracking-tighter">{f.name}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2 font-bold">Official Franchise</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: LOGIN FORM */}
        {step === 'login' && (
          <div className="w-full max-w-lg slide-in">
            <button onClick={() => selected === 'auctioneer' ? setStep('selection') : setStep('team-select')} className="text-white/40 hover:text-white mb-8 flex items-center gap-2 mx-auto transition-colors">
              ← Change Selection
            </button>
            
            <div className="relative glass rounded-[3rem] p-12 border-white/10 overflow-hidden bg-black/70 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              {/* Dynamic Theme Bar & Glow */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 shadow-[0_5px_30px_var(--glow-color)]" 
                style={{ 
                  background: selected === 'auctioneer' ? '#FFD700' : selectedFranchise?.color,
                  '--glow-color': selected === 'auctioneer' ? '#FFD70088' : `${selectedFranchise?.color}88`
                }}
              />

              <div className="flex flex-col items-center text-center mb-10">
                {selected === 'auctioneer' ? (
                  <div className="text-7xl mb-6 drop-shadow-2xl">🎙️</div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl mb-6"
                    style={{ 
                      background: selectedFranchise?.color,
                      boxShadow: `0 20px 50px ${selectedFranchise?.color}66`
                    }}
                  >
                    {selected}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-4xl font-black text-white uppercase tracking-tighter mb-2">
                    {selected === 'auctioneer' ? 'Auctioneer' : selectedFranchise?.name}
                  </h2>
                  <div className="inline-block px-4 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-[10px] font-black uppercase tracking-[0.2em]">
                    Restricted Access
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Official Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all placeholder:text-white/20"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Secure Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all placeholder:text-white/20"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {localError || error ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-400 text-sm flex items-start gap-4 animate-shake">
                    <span className="text-xl">⚠️</span>
                    <span className="leading-relaxed font-medium">{localError || error}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 rounded-2xl font-display font-black text-3xl tracking-tighter uppercase transition-all duration-500 disabled:opacity-50 transform hover:-translate-y-2 active:translate-y-0"
                  style={{
                    background: selected === 'auctioneer' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : `linear-gradient(135deg, ${selectedFranchise?.color}, ${selectedFranchise?.color}cc)`,
                    color: (selected === 'csk' || selected === 'CSK') ? '#000' : '#fff',
                    boxShadow: `0 20px 60px -10px ${selected === 'auctioneer' ? 'rgba(255,215,0,0.5)' : `${selectedFranchise?.color}77`}`,
                  }}
                >
                  {isLoading ? '⏳ AUTHENTICATING...' : 'ENTER AUCTION'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-30 w-full px-6 py-6 border-t border-white/5 backdrop-blur-md bg-black/40 text-center">
        <p className="text-white/30 text-[10px] uppercase tracking-[0.3em]">
          &copy; 2024 AuctionX &bull; The Ultimate Cricket Auction Experience &bull; Made for Champions
        </p>
      </footer>
    </div>
  );
}

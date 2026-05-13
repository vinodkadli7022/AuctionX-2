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
      <nav className="relative z-30 w-full px-4 md:px-8 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('landing')}>
          <span className="text-2xl md:text-3xl">🏏</span>
          <span className="font-display text-xl md:text-2xl font-black text-white tracking-tighter">
            AUCTION<span className="text-gold">X</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/70 uppercase tracking-widest">
          <button className="hover:text-gold transition-colors">Home</button>
          <button className="hover:text-gold transition-colors">Leagues</button>
          <button className="hover:text-gold transition-colors">Players</button>
        </div>
        <button 
          onClick={() => setStep('selection')}
          className="px-4 md:px-6 py-2 bg-gold text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
        >
          {step === 'landing' ? 'Login / Join' : 'Sign In'}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-center px-4 py-8 md:py-12 overflow-y-auto no-scrollbar">
        
        {/* STEP 1: LANDING PAGE */}
        {step === 'landing' && (
          <div className="max-w-5xl w-full text-center slide-in mt-4 md:mt-0">
            <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-[10px] md:text-xs font-black tracking-[0.2em] uppercase mb-6 md:mb-10">
              #1 Professional Auction Platform
            </div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-6 md:mb-10 drop-shadow-2xl">
              THE ULTIMATE<br/>
              <span className="text-gold">CRICKET AUCTION</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-xl text-white/70 mb-8 md:mb-12 leading-relaxed font-medium">
              Experience the thrill of the IPL auction with real-time bidding, professional player management, and live synchronization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <button 
                onClick={() => setStep('selection')}
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-gold text-black font-display font-black text-xl md:text-2xl rounded-2xl hover:bg-white hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                ENTER AUCTION ROOM
              </button>
              <button 
                onClick={() => navigate('/spectator')}
                className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-display font-black text-xl md:text-2xl rounded-2xl hover:bg-white/10 transition-all"
              >
                WATCH LIVE →
              </button>
            </div>
            
            {/* Stats Bar */}
            <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 glass p-6 md:p-12 border-white/10 backdrop-blur-xl bg-black/40 slide-in rounded-[2rem] md:rounded-[3rem]">
              {[
                { val: '500+', label: 'Players Pool' },
                { val: '10+', label: 'Active Leagues' },
                { val: 'LIVE', label: 'Bidding Engine' },
                { val: 'SECURE', label: 'Cloud Sync' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-4xl font-display font-black text-gold drop-shadow-[0_2px_15px_rgba(255,215,0,0.4)]">{stat.val}</div>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/50 font-black mt-2">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features Section */}
            <div className="mt-24 md:mt-40 text-center slide-in">
              <h3 className="font-display text-3xl md:text-5xl font-black text-white mb-12 md:mb-20 uppercase tracking-tight max-w-2xl mx-auto leading-tight">
                Everything for a <span className="text-gold">World-Class Auction</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                {[
                  { icon: '⚡', title: 'Live Bidding', desc: 'Ultra-low latency bidding engine ensures every bid is recorded instantly. Zero lag experience.' },
                  { icon: '📊', title: 'Smart Analytics', desc: 'Track squad balance, purse remaining, and player stats in real-time. Make data-driven decisions.' },
                  { icon: '🏆', title: 'Custom Leagues', desc: 'From local tournaments to mega leagues, customize rules, base prices, and franchise limits.' }
                ].map((feat, i) => (
                  <div key={i} className="p-8 md:p-10 rounded-[2.5rem] bg-black/40 border border-white/5 backdrop-blur-3xl text-left hover:border-gold/30 transition-all group">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{feat.icon}</div>
                    <h4 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tighter">{feat.title}</h4>
                    <p className="text-white/50 text-sm md:text-base leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOGIN CHOICE */}
        {step === 'selection' && (
          <div className="max-w-5xl w-full text-center slide-in px-4">
            <button onClick={() => setStep('landing')} className="text-white/40 hover:text-gold mb-10 md:mb-16 flex items-center gap-2 mx-auto transition-all font-black uppercase text-[10px] tracking-[0.2em]">
              ← Back to Overview
            </button>
            <h2 className="font-display text-4xl md:text-7xl font-black text-white mb-12 md:mb-20 uppercase tracking-tighter">
              Select Your <span className="text-gold">Role</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
              {/* Auctioneer Card */}
              <div 
                onClick={handleAuctioneerClick}
                className="group relative p-8 md:p-16 rounded-[3rem] bg-black/60 border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-700 backdrop-blur-2xl hover:scale-[1.02] active:scale-[0.98] shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-[3rem] pointer-events-none" />
                <div className="text-7xl md:text-9xl mb-8 md:mb-12 group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl opacity-80">🎙️</div>
                <h3 className="font-display text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 uppercase tracking-tighter leading-none">Auctioneer</h3>
                <p className="text-white/50 text-base md:text-lg leading-relaxed mb-10 font-medium">
                  Lead the tournament. Manage the flow, nominate players, and control the hammer.
                </p>
                <div className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-black font-black uppercase tracking-widest text-xs md:text-sm rounded-full group-hover:bg-white transition-all shadow-[0_10px_30px_rgba(255,215,0,0.3)]">
                  Enter Dashboard
                </div>
              </div>

              {/* Franchise Card */}
              <div 
                onClick={() => setStep('team-select')}
                className="group relative p-8 md:p-16 rounded-[3rem] bg-black/60 border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-700 backdrop-blur-2xl hover:scale-[1.02] active:scale-[0.98] shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[3rem] pointer-events-none" />
                <div className="text-7xl md:text-9xl mb-8 md:mb-12 group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl opacity-80">🏏</div>
                <h3 className="font-display text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 uppercase tracking-tighter leading-none">Franchise</h3>
                <p className="text-white/50 text-base md:text-lg leading-relaxed mb-10 font-medium">
                  Build your dream squad. Bid for players and outmaneuver other teams.
                </p>
                <div className="inline-flex items-center gap-3 px-10 py-4 bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest text-xs md:text-sm rounded-full group-hover:bg-gold group-hover:text-black transition-all shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
                  Select Team
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TEAM SELECTION */}
        {step === 'team-select' && (
          <div className="max-w-6xl w-full text-center slide-in px-4">
            <button onClick={() => setStep('selection')} className="text-white/40 hover:text-gold mb-10 flex items-center gap-2 mx-auto transition-all font-black uppercase text-[10px] tracking-[0.2em]">
              ← Back to Roles
            </button>
            <h2 className="font-display text-4xl md:text-7xl font-black text-white mb-12 md:mb-20 uppercase tracking-tighter">
              Choose Your <span className="text-gold">Franchise</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
              {FRANCHISES.map((f) => (
                <button
                  key={f.short}
                  onClick={() => handleFranchiseClick(f)}
                  className="group relative p-6 md:p-10 rounded-[2.5rem] bg-black/60 border border-white/5 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.05] hover:border-gold/30 hover:shadow-2xl overflow-hidden"
                  style={{ boxShadow: `0 0 40px ${f.color}11` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                  <div
                    className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center text-white font-display font-black text-xl md:text-3xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                      background: f.color,
                      boxShadow: `0 15px 40px ${f.color}66`
                    }}
                  >
                    {f.short}
                  </div>
                  <div className="mt-6 md:mt-8 text-center">
                    <div className="text-sm md:text-lg font-black text-white group-hover:text-gold transition-colors uppercase tracking-tight leading-tight">{f.name}</div>
                    <div className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2 font-black">Official Entry</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: LOGIN FORM */}
        {step === 'login' && (
          <div className="w-full max-w-xl slide-in px-4">
            <button onClick={() => selected === 'auctioneer' ? setStep('selection') : setStep('team-select')} className="text-white/40 hover:text-gold mb-8 flex items-center gap-2 mx-auto transition-all font-black uppercase text-[10px] tracking-[0.2em]">
              ← Change Selection
            </button>
            
            <div className="relative glass rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 border-white/10 overflow-hidden bg-black/70 backdrop-blur-3xl shadow-2xl">
              {/* Dynamic Theme Glow */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 shadow-[0_5px_40px_var(--glow-color)]" 
                style={{ 
                  background: selected === 'auctioneer' ? '#FFD700' : selectedFranchise?.color,
                  '--glow-color': selected === 'auctioneer' ? '#FFD700aa' : `${selectedFranchise?.color}aa`
                }}
              />

              <div className="flex flex-col items-center text-center mb-10 md:mb-16">
                {selected === 'auctioneer' ? (
                  <div className="text-7xl md:text-9xl mb-6 md:mb-10 drop-shadow-2xl">🎙️</div>
                ) : (
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center text-white font-black text-4xl md:text-5xl shadow-2xl mb-8 md:mb-10 transform rotate-3"
                    style={{ 
                      background: selectedFranchise?.color,
                      boxShadow: `0 20px 60px ${selectedFranchise?.color}66`
                    }}
                  >
                    {selected}
                  </div>
                )}
                <div className="slide-in">
                  <h2 className="font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                    {selected === 'auctioneer' ? 'Auctioneer' : selectedFranchise?.name}
                  </h2>
                  <div className="inline-block px-5 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-gold text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-xl">
                    Authorized Personnel Only
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                <div className="space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 md:px-8 py-5 md:py-6 text-white text-base md:text-xl focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all placeholder:text-white/10 font-bold"
                    placeholder="name@auctionx.in"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Secure Pin</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 md:px-8 py-5 md:py-6 text-white text-base md:text-xl focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all placeholder:text-white/10 font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {(localError || error) && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 md:p-6 text-red-400 text-xs md:text-sm flex items-start gap-4 animate-shake shadow-xl">
                    <span className="text-2xl">⚠️</span>
                    <span className="leading-relaxed font-black uppercase tracking-tight">{localError || error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 md:py-8 rounded-2xl md:rounded-3xl font-display font-black text-3xl md:text-4xl tracking-tighter uppercase transition-all duration-700 disabled:opacity-50 transform hover:-translate-y-2 active:translate-y-0 shadow-2xl"
                  style={{
                    background: selected === 'auctioneer' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : `linear-gradient(135deg, ${selectedFranchise?.color}, ${selectedFranchise?.color}cc)`,
                    color: (selected === 'csk' || selected === 'CSK') ? '#000' : '#fff',
                    boxShadow: `0 25px 60px -15px ${selected === 'auctioneer' ? 'rgba(255,215,0,0.6)' : `${selectedFranchise?.color}88`}`,
                  }}
                >
                  {isLoading ? 'Authenticating...' : 'Enter Arena'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="relative z-30 w-full px-6 py-6 md:py-10 border-t border-white/5 backdrop-blur-xl bg-black/60 text-center">
        <p className="text-white/20 text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold leading-loose">
          &copy; 2024 AuctionX Arena &bull; High-Performance Sports Tech &bull; Leveling the Playing Field
        </p>
      </footer>
    </div>
  );
}

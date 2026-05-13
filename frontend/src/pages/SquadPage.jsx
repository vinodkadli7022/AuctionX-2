import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import { useFranchiseStore } from '../stores/useFranchiseStore.js';
import { franchiseApi } from '../api/index.js';
import { formatMoney } from '../utils/money.js';

const ROLE_ORDER = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'];
const ROLE_BADGE = {
  'Batsman':      'badge-batsman',
  'Bowler':       'badge-bowler',
  'All-Rounder':  'badge-allrounder',
  'Wicketkeeper': 'badge-keeper',
};
const ROLE_ICON = {
  'Batsman': '🏏',
  'Bowler': '⚾',
  'All-Rounder': '⭐',
  'Wicketkeeper': '🧤',
};

export default function SquadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { franchises, fetchFranchises } = useFranchiseStore();
  const [squadData, setSquadData] = useState(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(id || user?.franchiseId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFranchises();
  }, []);

  useEffect(() => {
    if (!selectedFranchiseId) return;
    setLoading(true);
    franchiseApi.getSquad(selectedFranchiseId)
      .then(res => setSquadData(res.data))
      .catch(() => setSquadData(null))
      .finally(() => setLoading(false));
  }, [selectedFranchiseId]);

  const franchise = franchises.find(f => f.id === selectedFranchiseId);
  const squad = squadData?.squad || {};
  const totalPlayers = squadData?.total || 0;
  const purseSpent = franchise ? (franchise.purse_total - franchise.purse_remaining) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0d1224 0%, #0a0a1a 100%)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30">
        <h1 className="font-display text-2xl font-bold text-white">
          AUCTION<span className="text-gold">X</span>
          <span className="text-muted font-light text-lg"> / Squad View</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(user?.role === 'auctioneer' ? '/auctioneer' : `/franchise/${user?.franchiseId}`)}
            className="text-sm text-muted hover:text-gold transition-colors"
          >
            ← Back
          </button>
          <button onClick={logout} className="text-sm text-muted hover:text-red-400 transition-colors">Logout</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* Franchise Selector */}
        <div className="px-6 py-4 border-b border-white/5 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {franchises.map(f => {
              const spent = f.purse_total - f.purse_remaining;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFranchiseId(f.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-shrink-0 ${
                    selectedFranchiseId === f.id
                      ? 'border-gold bg-gold/10 shadow-lg shadow-gold/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: f.primary_color }}
                  >
                    {f.short_name.substring(0,2)}
                  </div>
                  <div className="text-left">
                    <p className={`font-display font-bold text-sm ${selectedFranchiseId === f.id ? 'text-gold' : 'text-white'}`}>
                      {f.short_name}
                    </p>
                    <p className="text-xs text-muted">{f.squad_count}/25 · {formatMoney(f.purse_remaining)} left</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Franchise Header Card */}
        {franchise && (
          <div className="px-6 py-5 border-b border-white/5">
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
                  style={{ background: franchise.primary_color, boxShadow: `0 0 30px ${franchise.primary_color}55` }}
                >
                  {franchise.short_name}
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-white">{franchise.name}</h2>
                  <p className="text-muted text-sm">{franchise.home_city}</p>
                </div>
                <div className="flex gap-6 ml-auto flex-wrap">
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">Purse Remaining</p>
                    <p className="font-display text-2xl font-bold text-gold">{formatMoney(franchise.purse_remaining)}</p>
                    <div className="w-32 bg-white/10 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, (franchise.purse_remaining / franchise.purse_total) * 100))}%`,
                          background: franchise.primary_color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">Purse Spent</p>
                    <p className="font-display text-2xl font-bold text-white">{formatMoney(purseSpent)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">Squad</p>
                    <p className="font-display text-2xl font-bold text-white">
                      {franchise.squad_count}<span className="text-muted text-lg">/25</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">Overseas</p>
                    <p className="font-display text-2xl font-bold text-white">
                      {franchise.overseas_count}<span className="text-muted text-lg">/8</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Squad Grid by Role */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted animate-pulse">Loading squad...</div>
          ) : totalPlayers === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted">
              <div className="text-5xl mb-3">🏏</div>
              <p>No players acquired yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              {ROLE_ORDER.map(role => {
                const rolePlayers = squad[role] || [];
                if (rolePlayers.length === 0) return null;
                return (
                  <div key={role}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{ROLE_ICON[role]}</span>
                      <h3 className="font-display text-xl font-bold text-white">{role}s</h3>
                      <span className="text-muted text-sm">({rolePlayers.length})</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {rolePlayers.map(player => (
                        <div key={player.id} className="glass rounded-xl overflow-hidden group hover:border-white/20 transition-all hover:scale-105">
                          <div className="relative h-32 overflow-hidden bg-gradient-to-b from-surface to-navy">
                            {player.photo_url ? (
                              <img
                                src={player.photo_url}
                                alt={player.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">🏏</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute top-2 right-2 text-base">
                              {player.nationality === 'Indian' ? '🇮🇳' : '🌍'}
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="font-display font-bold text-white text-sm leading-tight truncate">
                                {player.name}
                              </p>
                            </div>
                          </div>
                          <div className="p-2.5">
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${ROLE_BADGE[player.role]}`}>
                                {player.role === 'All-Rounder' ? 'AR' : player.role === 'Wicketkeeper' ? 'WK' : player.role.substring(0,3).toUpperCase()}
                              </span>
                              <span className="font-display font-bold text-gold text-sm">
                                {formatMoney(player.price_paid)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

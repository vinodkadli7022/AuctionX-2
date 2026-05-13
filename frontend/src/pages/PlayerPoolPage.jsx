import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePlayerStore } from '../stores/usePlayerStore.js';
import { useAuctionStore } from '../stores/useAuctionStore.js';
import { playerApi, adminApi } from '../api/index.js';
import { formatMoney } from '../utils/money.js';

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'];
const STATUSES = ['', 'upcoming', 'in-auction', 'sold', 'unsold'];
const STATUS_LABELS = { '': 'All', 'upcoming': 'Upcoming', 'in-auction': 'In Auction', 'sold': 'Sold', 'unsold': 'Unsold' };
const ROLE_BADGE = {
  'Batsman':      'badge-batsman',
  'Bowler':       'badge-bowler',
  'All-Rounder':  'badge-allrounder',
  'Wicketkeeper': 'badge-keeper',
};
const STATUS_BADGE = {
  'upcoming':   'badge-upcoming',
  'in-auction': 'badge-auction',
  'sold':       'badge-sold',
  'unsold':     'badge-unsold',
};

function AddPlayerDrawer({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', role: 'Batsman', nationality: 'Indian', age: '', iplCaps: '0', basePrice: '20' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await playerApi.create(fd);
      onAdded();
      onClose();
    } catch (err) { setError(err.message || 'Failed to add player'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-surface border-l border-white/10 overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">Add Player</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-3xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', required: true },
            { label: 'Age', key: 'age', type: 'number', required: true },
            { label: 'IPL Caps', key: 'iplCaps', type: 'number' },
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label className="text-xs text-muted mb-1 block">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60" />
            </div>
          ))}
          <div>
            <label className="text-xs text-muted mb-1 block">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Nationality</label>
            <select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60">
              <option value="Indian">Indian 🇮🇳</option>
              <option value="Overseas">Overseas 🌍</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Base Price (Lakhs)</label>
            <select value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold/60">
              {[20,30,50,75,100,150,200].map(p => <option key={p} value={p}>{formatMoney(p)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Profile Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
              className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer" />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gold text-black font-display font-bold text-lg hover:bg-gold-hover transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PlayerDetailModal({ player, sessionId, onClose }) {
  const [bids, setBids] = useState([]);
  useEffect(() => {
    if (!player || !sessionId) return;
    adminApi.getBidsForPlayer(player.id, sessionId).then(res => setBids(res.data || [])).catch(() => {});
  }, [player, sessionId]);

  if (!player) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">{player.name}</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Role', value: player.role },
              { label: 'Nationality', value: player.nationality },
              { label: 'Age', value: player.age },
              { label: 'IPL Caps', value: player.ipl_caps },
              { label: 'Base Price', value: formatMoney(player.base_price) },
              { label: 'Status', value: player.status?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-muted">{label}</p>
                <p className="font-semibold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>
          {player.status === 'sold' && (
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Sold To</p>
              <p className="font-display text-xl font-bold text-green-400">{player.sold_to_name || player.franchise_name}</p>
              <p className="text-gold font-display font-bold text-lg mt-1">{formatMoney(player.sold_price)}</p>
            </div>
          )}
          {bids.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Bid History ({bids.length})</h3>
              <div className="space-y-2">
                {bids.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                    <span className="text-xs text-muted w-5">{i + 1}</span>
                    <span className="flex-1 text-sm text-white">{b.franchise_name}</span>
                    <span className="font-display font-bold text-gold">{formatMoney(b.amount)}</span>
                    <span className="text-xs text-muted">{new Date(b.placed_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlayerPoolPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { players, total, page, filters, isLoading, fetchPlayers, setFilter, setPage } = usePlayerStore();
  const { sessionId } = useAuctionStore();
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const isAuctioneer = user?.role === 'auctioneer';

  useEffect(() => { fetchPlayers(); }, [filters, page]);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvLoading(true);
    try {
      const fd = new FormData();
      fd.append('csv', file);
      await playerApi.bulkUpload(fd);
      fetchPlayers();
    } catch (err) { alert(err.message || 'CSV upload failed'); }
    finally { setCsvLoading(false); e.target.value = ''; }
  };

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0d1224 0%, #0a0a1a 100%)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30">
        <h1 className="font-display text-2xl font-bold text-white">AUCTION<span className="text-gold">X</span> <span className="text-muted font-light text-lg">/ Players</span></h1>
        <div className="flex items-center gap-3">
          {isAuctioneer && (
            <>
              <label className={`px-4 py-2 rounded-lg border border-white/20 text-sm text-muted hover:text-white hover:border-white/40 cursor-pointer transition-all ${csvLoading ? 'opacity-50' : ''}`}>
                {csvLoading ? '⏳ Uploading...' : '📤 Upload CSV'}
                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={csvLoading} />
              </label>
              <button onClick={() => setShowAddDrawer(true)}
                className="px-4 py-2 rounded-lg bg-gold text-black font-semibold text-sm hover:bg-gold-hover transition-colors">
                + Add Player
              </button>
            </>
          )}
          <button onClick={() => navigate(user?.role === 'auctioneer' ? '/auctioneer' : '/spectator')}
            className="text-sm text-muted hover:text-gold transition-colors">← Back</button>
          <button onClick={logout} className="text-sm text-muted hover:text-red-400 transition-colors">Logout</button>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center gap-4">
        <input
          type="text" placeholder="Search players..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold/60 w-56"
        />
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button key={r} onClick={() => setFilter('role', filters.role === r ? '' : r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filters.role === r ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-muted hover:border-white/30 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['', 'Indian', 'Overseas'].map(n => (
            <button key={n} onClick={() => setFilter('nationality', filters.nationality === n ? '' : n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filters.nationality === n && n !== '' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-muted hover:border-white/30 hover:text-white'}`}>
              {n || 'All Nations'} {n === 'Indian' ? '🇮🇳' : n === 'Overseas' ? '🌍' : ''}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter('status', filters.status === s && s !== '' ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filters.status === s && s !== '' ? 'border-gold bg-gold/10 text-gold' : s === '' && !filters.status ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-muted hover:border-white/30'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted">{total} players</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-muted animate-pulse">Loading players...</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-white/10">
                <th className="text-left pb-3 font-medium w-12"></th>
                <th className="text-left pb-3 font-medium">Player</th>
                <th className="text-left pb-3 font-medium">Role</th>
                <th className="text-left pb-3 font-medium">Nationality</th>
                <th className="pb-3 font-medium text-right">Base Price</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-right">Franchise / Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map(p => (
                <tr key={p.id}
                  onClick={() => (isAuctioneer && ['sold','upcoming','unsold'].includes(p.status)) ? setSelectedPlayer(p) : null}
                  className={`hover:bg-white/3 transition-colors ${isAuctioneer ? 'cursor-pointer' : ''}`}>
                  <td className="py-3 pr-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden">
                      {p.photo_url
                        ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🏏</div>}
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-muted">Age {p.age} · {p.ipl_caps} caps</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[p.role] || ''}`}>{p.role}</span>
                  </td>
                  <td className="py-3 text-sm text-muted">
                    {p.nationality === 'Indian' ? '🇮🇳 Indian' : '🌍 Overseas'}
                  </td>
                  <td className="py-3 text-right font-display font-bold text-gold">{formatMoney(p.base_price)}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE[p.status] || 'bg-gray-800 text-gray-400'}`}>
                      {(p.status || 'upcoming').toUpperCase().replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {p.status === 'sold' && (
                      <div>
                        <p className="text-white text-xs font-semibold">{p.sold_to_name || p.franchise_name}</p>
                        <p className="font-display font-bold text-green-400 text-sm">{formatMoney(p.sold_price)}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-white/10">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white disabled:opacity-40 text-sm transition-colors">
            ← Prev
          </button>
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-muted hover:text-white disabled:opacity-40 text-sm transition-colors">
            Next →
          </button>
        </div>
      )}

      {showAddDrawer && <AddPlayerDrawer onClose={() => setShowAddDrawer(false)} onAdded={fetchPlayers} />}
      {selectedPlayer && <PlayerDetailModal player={selectedPlayer} sessionId={sessionId} onClose={() => setSelectedPlayer(null)} />}
    </div>
  );
}

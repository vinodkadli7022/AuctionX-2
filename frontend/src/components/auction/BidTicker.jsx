import { formatMoney, formatTimeAgo } from '../../utils/money.js';

const NATIONALITY_FLAG = { Indian: '🇮🇳', Overseas: '🌍' };
const ROLE_COLORS = {
  'Batsman': 'badge-batsman',
  'Bowler': 'badge-bowler',
  'All-Rounder': 'badge-allrounder',
  'Wicketkeeper': 'badge-keeper',
};

function RoleBadge({ role }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[role] || 'bg-gray-800 text-gray-300'}`}>
      {role}
    </span>
  );
}

export function BidTicker({ bids = [] }) {
  if (bids.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted text-sm">
        No bids yet — be the first!
      </div>
    );
  }

  return (
    <div className="space-y-1.5 overflow-y-auto max-h-64 pr-1">
      {bids.map((bid, i) => (
        <div
          key={`${bid.franchiseId}-${bid.timestamp}-${i}`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5 ${i === 0 ? 'bid-flash border-yellow-700/50' : ''}`}
        >
          {bid.franchiseLogo ? (
            <img src={bid.franchiseLogo} alt={bid.franchiseName} className="w-6 h-6 object-contain rounded" />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: bid.franchiseColor || '#374151' }}
            >
              {bid.franchiseName?.[0]}
            </div>
          )}
          <span className="text-sm font-medium text-white flex-1 truncate">{bid.franchiseName}</span>
          <span className="font-display font-bold text-gold text-sm">{formatMoney(bid.amount)}</span>
          <span className="text-xs text-muted w-14 text-right">{formatTimeAgo(bid.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}

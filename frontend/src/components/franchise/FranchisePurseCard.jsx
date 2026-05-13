import { formatMoney } from '../../utils/money.js';

export function FranchisePurseCard({ franchise, isLeading = false, compact = false }) {
  if (!franchise) return null;

  const spent = franchise.purse_total - franchise.purse_remaining;
  const pct = Math.max(0, Math.min(100, (franchise.purse_remaining / franchise.purse_total) * 100));

  if (compact) {
    return (
      <div
        className={`glass p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${isLeading ? 'leading-franchise' : ''}`}
      >
        {franchise.logo_url ? (
          <img src={franchise.logo_url} alt={franchise.short_name} className="w-10 h-10 object-contain" />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: franchise.primary_color }}
          >
            {franchise.short_name}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-white truncate">{franchise.short_name}</span>
            <span className="font-display font-bold text-gold text-sm">{formatMoney(franchise.purse_remaining)}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: franchise.primary_color }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>{franchise.squad_count}/25</span>
            <span>{franchise.overseas_count}/8 OS</span>
          </div>
        </div>
        {isLeading && (
          <div className="text-gold text-lg animate-bounce">👑</div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`glass p-5 rounded-2xl transition-all duration-300 ${isLeading ? 'leading-franchise' : ''}`}
    >
      <div className="flex items-center gap-4 mb-4">
        {franchise.logo_url ? (
          <img src={franchise.logo_url} alt={franchise.name} className="w-14 h-14 object-contain" />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: franchise.primary_color }}
          >
            {franchise.short_name}
          </div>
        )}
        <div>
          <h3 className="font-display text-lg font-bold text-white">{franchise.short_name}</h3>
          <p className="text-xs text-muted">{franchise.name}</p>
        </div>
        {isLeading && <span className="ml-auto text-2xl animate-bounce">👑</span>}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-muted">Purse Left</span>
          <span className="font-display font-bold text-gold">{formatMoney(franchise.purse_remaining)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: franchise.primary_color, boxShadow: `0 0 8px ${franchise.primary_color}` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>Spent: {formatMoney(spent)}</span>
          <span>Total: {formatMoney(franchise.purse_total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold font-display text-white">{franchise.squad_count}<span className="text-muted text-sm">/25</span></div>
          <div className="text-xs text-muted">Squad</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold font-display text-white">{franchise.overseas_count}<span className="text-muted text-sm">/8</span></div>
          <div className="text-xs text-muted">Overseas</div>
        </div>
      </div>
    </div>
  );
}

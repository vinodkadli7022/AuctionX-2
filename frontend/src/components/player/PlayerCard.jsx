import { formatMoney } from '../../utils/money.js';

const ROLE_BADGE = {
  'Batsman':     { cls: 'badge-batsman',    label: 'BAT' },
  'Bowler':      { cls: 'badge-bowler',     label: 'BWL' },
  'All-Rounder': { cls: 'badge-allrounder', label: 'AR' },
  'Wicketkeeper':{ cls: 'badge-keeper',     label: 'WK' },
};

export function PlayerCard({ player, size = 'md', showStatus = false, soldFranchise = null }) {
  if (!player) return null;

  const role = ROLE_BADGE[player.role] || { cls: 'bg-gray-800 text-gray-300', label: player.role };
  const isLarge = size === 'lg';

  return (
    <div className={`glass rounded-2xl overflow-hidden ${isLarge ? 'p-0' : 'p-4'}`}>
      {/* Photo */}
      <div className={`relative ${isLarge ? 'h-64' : 'h-40'} bg-gradient-to-b from-surface to-navy flex items-center justify-center overflow-hidden`}>
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={player.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-5xl">
            🏏
          </div>
        )}
        {/* Role badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-md text-xs font-bold ${role.cls}`}>{role.label}</span>
        </div>
        {/* Nationality */}
        <div className="absolute top-3 right-3 text-xl">
          {player.nationality === 'Indian' ? '🇮🇳' : '🌍'}
        </div>
        {showStatus && player.status && (
          <div className="absolute bottom-3 right-3">
            <span className={`px-2 py-1 rounded text-xs font-semibold badge-${player.status.replace('-','')}`}>
              {player.status.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={isLarge ? 'p-5' : 'pt-3'}>
        <h3 className={`font-display font-bold text-white leading-tight ${isLarge ? 'text-3xl' : 'text-base'}`}>
          {player.name}
        </h3>
        <p className={`text-muted ${isLarge ? 'text-sm mt-1 mb-4' : 'text-xs mt-0.5 mb-2'}`}>
          {player.role} · Age {player.age} · {player.ipl_caps || player.ipl_caps === 0 ? `${player.ipl_caps} IPL caps` : ''}
        </p>

        <div className={`flex items-center justify-between ${isLarge ? 'mt-2' : ''}`}>
          <div>
            <p className="text-xs text-muted">Base Price</p>
            <span className="font-display font-bold text-gold text-lg">{formatMoney(player.base_price)}</span>
          </div>
          {soldFranchise && (
            <div className="text-right">
              <p className="text-xs text-muted">Sold to</p>
              <div className="flex items-center gap-1 justify-end">
                {soldFranchise.logo_url && <img src={soldFranchise.logo_url} alt="" className="w-5 h-5 object-contain" />}
                <span className="text-sm font-semibold text-green-400">{soldFranchise.short_name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

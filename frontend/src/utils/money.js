/**
 * Money utility — frontend mirror of backend money.utils.js
 * Single source of truth for all money formatting.
 */
export function formatMoney(lakhs) {
  if (typeof lakhs !== 'number' || isNaN(lakhs)) return '0 L';
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(1);
    return `${formatted} Cr`;
  }
  return `${lakhs} L`;
}

export function getBidIncrements(currentBid) {
  return [
    { label: formatMoney(currentBid + 5), amount: currentBid + 5, increment: '+5L' },
    { label: formatMoney(currentBid + 10), amount: currentBid + 10, increment: '+10L' },
    { label: formatMoney(currentBid + 25), amount: currentBid + 25, increment: '+25L' },
    { label: formatMoney(currentBid + 50), amount: currentBid + 50, increment: '+50L' },
    { label: formatMoney(currentBid + 100), amount: currentBid + 100, increment: '+1Cr' },
  ];
}

export function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

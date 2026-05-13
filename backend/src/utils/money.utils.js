/**
 * Money Utility — Single source of truth for all money formatting.
 * All values stored as integers in Lakhs.
 *
 * Examples:
 *   formatMoney(10000) => "100 Cr"
 *   formatMoney(1500)  => "15 Cr"
 *   formatMoney(150)   => "1.5 Cr"
 *   formatMoney(75)    => "75 L"
 *   formatMoney(20)    => "20 L"
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

/**
 * Parse formatted money string back to Lakhs integer.
 * formatMoney inverse — used for display purposes only.
 */
export function parseMoney(str) {
  if (!str || typeof str !== 'string') return 0;
  const trimmed = str.trim();
  if (trimmed.endsWith('Cr')) {
    return Math.round(parseFloat(trimmed) * 100);
  }
  if (trimmed.endsWith('L')) {
    return Math.round(parseFloat(trimmed));
  }
  return Math.round(parseFloat(trimmed));
}

/**
 * Get bid increment options from current bid.
 * Returns array of {label, amount} for quick-bid buttons.
 */
export function getBidIncrements(currentBid) {
  return [
    { label: `+5L`, amount: currentBid + 5 },
    { label: `+10L`, amount: currentBid + 10 },
    { label: `+25L`, amount: currentBid + 25 },
    { label: `+50L`, amount: currentBid + 50 },
    { label: `+1Cr`, amount: currentBid + 100 },
  ];
}

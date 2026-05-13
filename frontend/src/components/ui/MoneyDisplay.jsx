import { formatMoney } from '../../utils/money.js';

export function MoneyDisplay({ lakhs, className = '', size = 'md' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
    '2xl': 'text-5xl',
    '3xl': 'text-7xl',
  };
  return (
    <span className={`font-display font-bold ${sizes[size] || sizes.md} ${className}`}>
      {formatMoney(lakhs)}
    </span>
  );
}

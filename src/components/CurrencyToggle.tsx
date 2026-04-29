'use client';

import { useCurrency } from '@/lib/currency';
import { FiDollarSign } from 'react-icons/fi';

export default function CurrencyToggle() {
  const { currency, toggleCurrency, formatPrice } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="p-2 rounded-lg hover:bg-purple-900/30 transition-all flex items-center gap-1 text-gray-400 hover:text-purple-400 group relative"
      title={`تبديل العملة (${currency === 'SAR' ? 'دولار' : 'ريال سعودي'})`}
    >
      <FiDollarSign className="w-4 h-4" />
      <span className="text-xs font-medium">
        {currency === 'SAR' ? 'ر.س' : 'USD'}
      </span>
    </button>
  );
}

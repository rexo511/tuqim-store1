'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const USD_RATE = 3.75; // 1 USD = 3.75 SAR approx

interface CurrencyContextType {
  currency: 'SAR' | 'USD';
  toggleCurrency: () => void;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'SAR' | 'USD'>('SAR');

  useEffect(() => {
    const saved = localStorage.getItem('tuqim-currency') as 'SAR' | 'USD' | null;
    if (saved) {
      setCurrency(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tuqim-currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'SAR' ? 'USD' : 'SAR');
  };

  const formatPrice = (price: number): string => {
    const displayPrice = currency === 'SAR' ? price : parseFloat((price / USD_RATE).toFixed(2));
    const symbol = currency === 'SAR' ? ' ر.س' : ' $';
    return `${displayPrice.toLocaleString()} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

import { create } from 'zustand';
import { DEFAULT_WATCHLIST } from '../types';

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: DEFAULT_WATCHLIST,
  add: (symbol) =>
    set((s) => ({
      symbols: s.symbols.includes(symbol) ? s.symbols : [...s.symbols, symbol],
    })),
  remove: (symbol) =>
    set((s) => ({ symbols: s.symbols.filter((sym) => sym !== symbol) })),
  has: (symbol) => get().symbols.includes(symbol),
}));

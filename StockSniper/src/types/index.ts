export interface Quote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency: string;
  marketState: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED' | 'PREPRE' | 'POSTPOST';
  typeDisp?: string;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  candles: CandleData[];
  interval: ChartInterval;
}

export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y';

export interface FuturesSymbol {
  symbol: string;
  name: string;
  category: string;
}

export const FUTURES_SYMBOLS: FuturesSymbol[] = [
  // Equity Futures
  { symbol: 'ES=F', name: 'S&P 500 Futures', category: 'Equity' },
  { symbol: 'NQ=F', name: 'Nasdaq 100 Futures', category: 'Equity' },
  { symbol: 'YM=F', name: 'Dow Jones Futures', category: 'Equity' },
  { symbol: 'RTY=F', name: 'Russell 2000 Futures', category: 'Equity' },
  // Energy
  { symbol: 'CL=F', name: 'Crude Oil Futures', category: 'Energy' },
  { symbol: 'NG=F', name: 'Natural Gas Futures', category: 'Energy' },
  { symbol: 'RB=F', name: 'RBOB Gasoline Futures', category: 'Energy' },
  // Metals
  { symbol: 'GC=F', name: 'Gold Futures', category: 'Metals' },
  { symbol: 'SI=F', name: 'Silver Futures', category: 'Metals' },
  { symbol: 'HG=F', name: 'Copper Futures', category: 'Metals' },
  { symbol: 'PL=F', name: 'Platinum Futures', category: 'Metals' },
  // Agriculture
  { symbol: 'ZC=F', name: 'Corn Futures', category: 'Agriculture' },
  { symbol: 'ZS=F', name: 'Soybean Futures', category: 'Agriculture' },
  { symbol: 'ZW=F', name: 'Wheat Futures', category: 'Agriculture' },
  // Currencies
  { symbol: '6E=F', name: 'Euro FX Futures', category: 'Currencies' },
  { symbol: '6J=F', name: 'Japanese Yen Futures', category: 'Currencies' },
  { symbol: '6B=F', name: 'British Pound Futures', category: 'Currencies' },
  // Bonds
  { symbol: 'ZB=F', name: '30-Year Treasury Futures', category: 'Bonds' },
  { symbol: 'ZN=F', name: '10-Year Treasury Futures', category: 'Bonds' },
  { symbol: 'ZT=F', name: '2-Year Treasury Futures', category: 'Bonds' },
];

export const DEFAULT_WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'QQQ',
];

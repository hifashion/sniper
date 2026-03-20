import axios from 'axios';
import { Quote, CandleData, ChartInterval, ChartRange } from '../types';

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';
const QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';

const client = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0',
  },
});

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const symbolsStr = symbols.join(',');
  const { data } = await client.get(QUOTE_URL, {
    params: {
      symbols: symbolsStr,
      fields: [
        'symbol', 'shortName', 'regularMarketPrice', 'regularMarketChange',
        'regularMarketChangePercent', 'regularMarketVolume', 'regularMarketOpen',
        'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketPreviousClose',
        'marketCap', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'currency',
        'marketState', 'typeDisp',
      ].join(','),
    },
  });
  return data?.quoteResponse?.result ?? [];
}

export async function fetchChartData(
  symbol: string,
  interval: ChartInterval = '5m',
  range: ChartRange = '1d',
): Promise<CandleData[]> {
  const { data } = await client.get(`${BASE_URL}/chart/${symbol}`, {
    params: { interval, range, includePrePost: true },
  });

  const result = data?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp ?? [];
  const { open, high, low, close, volume } = result.indicators?.quote?.[0] ?? {};

  if (!timestamps.length || !close) return [];

  return timestamps.map((t: number, i: number) => ({
    timestamp: t * 1000,
    open: open?.[i] ?? close[i],
    high: high?.[i] ?? close[i],
    low: low?.[i] ?? close[i],
    close: close[i],
    volume: volume?.[i] ?? 0,
  })).filter((c: CandleData) => c.close !== null && !isNaN(c.close));
}

export async function searchSymbols(query: string): Promise<Quote[]> {
  const { data } = await client.get(
    `https://query1.finance.yahoo.com/v1/finance/search`,
    { params: { q: query, quotesCount: 10, newsCount: 0 } },
  );
  const hits = data?.quotes ?? [];
  if (!hits.length) return [];
  const symbols = hits.map((h: { symbol: string }) => h.symbol);
  return fetchQuotes(symbols);
}

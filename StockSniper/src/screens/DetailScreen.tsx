import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useChartData } from '../hooks/useChartData';
import { useQuotes } from '../hooks/useQuotes';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { PriceChart, INTERVALS } from '../components/PriceChart';
import { ChartInterval, ChartRange } from '../types';

interface Props {
  route: any;
  navigation: any;
}

interface Interval {
  label: string;
  interval: ChartInterval;
  range: ChartRange;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatLargeNum(n?: number): string {
  if (n === undefined || n === null) return 'N/A';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

export function DetailScreen({ route, navigation }: Props) {
  const { symbol } = route.params;
  const [selectedInterval, setSelectedInterval] = useState<Interval>(INTERVALS[0]);
  const { data: quotes, isLoading: quotesLoading } = useQuotes([symbol], 10000);
  const { data: candles, isLoading: chartLoading, isError } = useChartData(
    symbol,
    selectedInterval.interval,
    selectedInterval.range,
  );
  const { add, remove, has } = useWatchlistStore();
  const inWatchlist = has(symbol);
  const quote = quotes?.[0];

  const isPositive = (quote?.regularMarketChange ?? 0) >= 0;
  const color = isPositive ? '#00C087' : '#FF4D4D';
  const changeSign = isPositive ? '+' : '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.symbol}>{symbol.replace('=F', '')}</Text>
            {quote && <Text style={styles.name}>{quote.shortName}</Text>}
          </View>
          <TouchableOpacity
            onPress={() => inWatchlist ? remove(symbol) : add(symbol)}
            style={styles.watchBtn}
          >
            <Feather
              name={inWatchlist ? 'star' : 'star'}
              size={22}
              color={inWatchlist ? '#FFD700' : '#666'}
            />
          </TouchableOpacity>
        </View>

        {/* Price hero */}
        {quote && (
          <View style={styles.priceHero}>
            <Text style={styles.bigPrice}>
              {quote.regularMarketPrice < 1
                ? quote.regularMarketPrice.toFixed(4)
                : quote.regularMarketPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.priceRow}>
              <View style={[styles.badge, { backgroundColor: color + '25' }]}>
                <Text style={[styles.badgeText, { color }]}>
                  {changeSign}{quote.regularMarketChangePercent.toFixed(2)}%
                </Text>
              </View>
              <Text style={[styles.changeAbs, { color }]}>
                {changeSign}{Math.abs(quote.regularMarketChange).toFixed(2)}
              </Text>
              <View style={[styles.marketState, { backgroundColor: '#1E1E2E' }]}>
                <Text style={styles.marketStateText}>{quote.marketState}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Chart */}
        <PriceChart
          candles={candles ?? []}
          loading={chartLoading}
          error={isError}
          selectedInterval={selectedInterval}
          onIntervalChange={setSelectedInterval}
          positive={isPositive}
        />

        {/* Stats grid */}
        {quote && (
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Market Data</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Open" value={`$${quote.regularMarketOpen?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="Prev Close" value={`$${quote.regularMarketPreviousClose?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="Day High" value={`$${quote.regularMarketDayHigh?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="Day Low" value={`$${quote.regularMarketDayLow?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="52W High" value={`$${quote.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="52W Low" value={`$${quote.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A'}`} />
              <StatItem label="Volume" value={
                quote.regularMarketVolume >= 1e6
                  ? `${(quote.regularMarketVolume / 1e6).toFixed(1)}M`
                  : quote.regularMarketVolume >= 1e3
                    ? `${(quote.regularMarketVolume / 1e3).toFixed(0)}K`
                    : String(quote.regularMarketVolume)
              } />
              {quote.marketCap && (
                <StatItem label="Market Cap" value={formatLargeNum(quote.marketCap)} />
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  symbol: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  name: { color: '#888', fontSize: 12, marginTop: 1 },
  watchBtn: { padding: 4 },
  priceHero: { paddingHorizontal: 16, paddingBottom: 12 },
  bigPrice: { color: '#FFF', fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  changeAbs: { fontSize: 14, fontWeight: '600' },
  marketState: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  marketStateText: { color: '#888', fontSize: 10 },
  statsCard: {
    margin: 16,
    backgroundColor: '#12122A',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  stat: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  statLabel: { color: '#666', fontSize: 11, marginBottom: 2 },
  statValue: { color: '#DDD', fontSize: 14, fontWeight: '600' },
});

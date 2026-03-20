import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteRow } from '../components/QuoteRow';

interface Props {
  navigation: any;
}

const INDICES = ['SPY', 'QQQ', 'DIA', 'IWM', 'VXX'];
const TOP_STOCKS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO'];
const KEY_FUTURES = ['ES=F', 'NQ=F', 'CL=F', 'GC=F'];

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function MarketsScreen({ navigation }: Props) {
  const allSymbols = [...INDICES, ...TOP_STOCKS, ...KEY_FUTURES];
  const { data: quotes, isLoading, refetch, isRefetching } = useQuotes(allSymbols, 10000);

  const quoteMap = new Map((quotes ?? []).map((q) => [q.symbol, q]));
  const indicesData = INDICES.map((s) => quoteMap.get(s)).filter(Boolean) as NonNullable<typeof quotes>;
  const stocksData = TOP_STOCKS.map((s) => quoteMap.get(s)).filter(Boolean) as NonNullable<typeof quotes>;
  const futuresData = KEY_FUTURES.map((s) => quoteMap.get(s)).filter(Boolean) as NonNullable<typeof quotes>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#00C087"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Markets</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          {isLoading && <ActivityIndicator color="#00C087" />}
        </View>

        {/* Market overview pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
          {indicesData.map((q) => {
            const isPos = q.regularMarketChange >= 0;
            const color = isPos ? '#00C087' : '#FF4D4D';
            return (
              <TouchableOpacity
                key={q.symbol}
                style={styles.pill}
                onPress={() => navigation.navigate('Detail', { symbol: q.symbol })}
              >
                <Text style={styles.pillSymbol}>{q.symbol}</Text>
                <Text style={styles.pillPrice}>
                  {q.regularMarketPrice.toFixed(2)}
                </Text>
                <Text style={[styles.pillChange, { color }]}>
                  {isPos ? '+' : ''}{q.regularMarketChangePercent.toFixed(2)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Key Futures */}
        <SectionHeader
          title="Key Futures"
          onSeeAll={() => navigation.navigate('FuturesTab')}
        />
        {futuresData.map((q) => (
          <QuoteRow
            key={q.symbol}
            quote={q}
            onPress={() => navigation.navigate('Detail', { symbol: q.symbol })}
          />
        ))}

        {/* Top Stocks */}
        <SectionHeader title="Top Stocks" />
        {stocksData.map((q) => (
          <QuoteRow
            key={q.symbol}
            quote={q}
            onPress={() => navigation.navigate('Detail', { symbol: q.symbol })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#666', fontSize: 13, marginTop: 2 },
  pillsRow: { paddingHorizontal: 12, marginBottom: 8 },
  pill: {
    backgroundColor: '#12122A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  pillSymbol: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 2 },
  pillPrice: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  pillChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  seeAll: { color: '#7B61FF', fontSize: 13 },
});

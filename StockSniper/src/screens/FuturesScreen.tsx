import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, SafeAreaView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FUTURES_SYMBOLS } from '../types';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteRow } from '../components/QuoteRow';

interface Props {
  navigation: any;
}

const ALL_CATEGORIES = ['All', 'Equity', 'Energy', 'Metals', 'Agriculture', 'Currencies', 'Bonds'];

export function FuturesScreen({ navigation }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const futuresSymbols = FUTURES_SYMBOLS.map((f) => f.symbol);
  const { data: quotes, isLoading, refetch, isRefetching } = useQuotes(futuresSymbols, 15000);

  const sections = useMemo(() => {
    const quoteMap = new Map((quotes ?? []).map((q) => [q.symbol, q]));

    const categories = activeCategory === 'All'
      ? ['Equity', 'Energy', 'Metals', 'Agriculture', 'Currencies', 'Bonds']
      : [activeCategory];

    return categories.map((cat) => {
      const syms = FUTURES_SYMBOLS.filter((f) => f.category === cat);
      const data = syms
        .map((f) => quoteMap.get(f.symbol))
        .filter(Boolean) as NonNullable<typeof quotes>[0][];
      return { title: cat, data };
    }).filter((s) => s.data.length > 0);
  }, [quotes, activeCategory]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Futures</Text>
        {isLoading && <ActivityIndicator color="#00C087" size="small" />}
      </View>

      {/* Category filter */}
      <View style={styles.filterRow}>
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.filterBtn,
              activeCategory === cat && styles.filterBtnActive,
            ]}
          >
            <Text style={[
              styles.filterText,
              activeCategory === cat && styles.filterTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Market status banner */}
      <View style={styles.marketBanner}>
        <View style={styles.dot} />
        <Text style={styles.bannerText}>Futures markets trade nearly 24/5 — prices update every 15s</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.symbol}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#00C087"
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <QuoteRow
            quote={item}
            onPress={() => navigation.navigate('Detail', { symbol: item.symbol })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color="#00C087" size="large" />
              <Text style={styles.emptyText}>Loading futures data...</Text>
            </View>
          ) : null
        }
      />
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
    paddingVertical: 12,
  },
  title: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    marginBottom: 4,
  },
  filterBtnActive: { backgroundColor: '#7B61FF' },
  filterText: { color: '#888', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  marketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A3050',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C087' },
  bannerText: { color: '#666', fontSize: 11, flex: 1 },
  sectionHeader: {
    backgroundColor: '#0D0D1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  sectionTitle: { color: '#7B61FF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#666', fontSize: 14 },
});

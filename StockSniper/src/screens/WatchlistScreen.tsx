import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  TextInput, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useQuotes } from '../hooks/useQuotes';
import { QuoteRow } from '../components/QuoteRow';
import { searchSymbols } from '../services/yahooFinance';
import { Quote } from '../types';

interface Props {
  navigation: any;
}

export function WatchlistScreen({ navigation }: Props) {
  const { symbols, add, remove, has } = useWatchlistStore();
  const { data: quotes, isLoading, refetch, isRefetching } = useQuotes(symbols, 10000);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Quote[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 1) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchSymbols(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Watchlist</Text>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          style={styles.iconBtn}
        >
          <Feather name={showSearch ? 'x' : 'search'} size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks, ETFs, futures..."
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color="#00C087" />}
        </View>
      )}

      {showSearch && searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(q) => q.symbol}
            renderItem={({ item }) => (
              <View style={styles.searchResult}>
                <TouchableOpacity
                  style={styles.searchResultInfo}
                  onPress={() => {
                    closeSearch();
                    navigation.navigate('Detail', { symbol: item.symbol });
                  }}
                >
                  <Text style={styles.srSymbol}>{item.symbol}</Text>
                  <Text style={styles.srName}>{item.shortName}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    has(item.symbol) ? remove(item.symbol) : add(item.symbol);
                  }}
                  style={styles.addBtn}
                >
                  <Feather
                    name={has(item.symbol) ? 'check' : 'plus'}
                    size={18}
                    color={has(item.symbol) ? '#00C087' : '#888'}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* Watchlist */}
      {!showSearch && (
        <FlatList
          data={quotes}
          keyExtractor={(q) => q.symbol}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#00C087"
            />
          }
          renderItem={({ item }) => (
            <QuoteRow
              quote={item}
              onPress={() => navigation.navigate('Detail', { symbol: item.symbol })}
            />
          )}
          ListHeaderComponent={
            isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color="#00C087" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <Feather name="star" size={40} color="#333" />
                <Text style={styles.emptyText}>Your watchlist is empty</Text>
                <Text style={styles.emptySubText}>Tap search to add stocks</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D1A' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  iconBtn: { padding: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 15 },
  searchResults: { flex: 1, backgroundColor: '#0D0D1A' },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  searchResultInfo: { flex: 1 },
  srSymbol: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  srName: { color: '#888', fontSize: 12, marginTop: 2 },
  addBtn: { padding: 8 },
  centered: { padding: 20, alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#444', fontSize: 13 },
});

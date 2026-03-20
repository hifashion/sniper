import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Quote } from '../types';

interface Props {
  quote: Quote;
  onPress: () => void;
}

function formatPrice(price: number, currency = 'USD'): string {
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`;
  return String(vol);
}

export function QuoteRow({ quote, onPress }: Props) {
  const isPositive = quote.regularMarketChange >= 0;
  const color = isPositive ? '#00C087' : '#FF4D4D';
  const changeSign = isPositive ? '+' : '';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{quote.symbol.replace('=F', '')}</Text>
        <Text style={styles.name} numberOfLines={1}>{quote.shortName}</Text>
        <Text style={styles.volume}>Vol: {formatVolume(quote.regularMarketVolume)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{formatPrice(quote.regularMarketPrice)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.change, { color }]}>
            {changeSign}{quote.regularMarketChangePercent.toFixed(2)}%
          </Text>
        </View>
        <Text style={[styles.changeAbs, { color }]}>
          {changeSign}{formatPrice(Math.abs(quote.regularMarketChange))}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  left: { flex: 1 },
  symbol: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  name: { color: '#888', fontSize: 12, marginTop: 2, maxWidth: 180 },
  volume: { color: '#555', fontSize: 11, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
  price: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  changeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  change: { fontSize: 13, fontWeight: '700' },
  changeAbs: { fontSize: 12, color: '#888' },
});

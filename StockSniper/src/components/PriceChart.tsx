import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText, Rect, G } from 'react-native-svg';
import { CandleData, ChartInterval, ChartRange } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 260;
const PADDING = { top: 20, right: 50, bottom: 30, left: 10 };

const INTERVALS: { label: string; interval: ChartInterval; range: ChartRange }[] = [
  { label: '1D', interval: '5m', range: '1d' },
  { label: '5D', interval: '15m', range: '5d' },
  { label: '1M', interval: '1d', range: '1mo' },
  { label: '3M', interval: '1d', range: '3mo' },
  { label: '6M', interval: '1d', range: '6mo' },
  { label: '1Y', interval: '1wk', range: '1y' },
];

interface Props {
  candles: CandleData[];
  loading?: boolean;
  error?: boolean;
  selectedInterval: { label: string; interval: ChartInterval; range: ChartRange };
  onIntervalChange: (opt: { label: string; interval: ChartInterval; range: ChartRange }) => void;
  positive: boolean;
}

export function PriceChart({ candles, loading, error, selectedInterval, onIntervalChange, positive }: Props) {
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const chartWidth = SCREEN_WIDTH - 32;
  const innerW = chartWidth - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const { minPrice, maxPrice, linePath, areaPath, yLabels, xLabels } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 0, linePath: '', areaPath: '', yLabels: [], xLabels: [] };

    const closes = candles.map((c) => c.close);
    const minPrice = Math.min(...closes);
    const maxPrice = Math.max(...closes);
    const range = maxPrice - minPrice || 1;

    const toX = (i: number) => PADDING.left + (i / (candles.length - 1)) * innerW;
    const toY = (price: number) => PADDING.top + ((maxPrice - price) / range) * innerH;

    let linePath = '';
    let areaPath = '';
    candles.forEach((c, i) => {
      const x = toX(i);
      const y = toY(c.close);
      if (i === 0) {
        linePath += `M${x},${y}`;
        areaPath += `M${x},${PADDING.top + innerH} L${x},${y}`;
      } else {
        linePath += ` L${x},${y}`;
        areaPath += ` L${x},${y}`;
      }
    });
    const lastX = toX(candles.length - 1);
    areaPath += ` L${lastX},${PADDING.top + innerH} Z`;

    // Y labels
    const steps = 5;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => {
      const price = minPrice + (i / steps) * range;
      const y = toY(price);
      return { price, y };
    });

    // X labels - show 4 evenly spaced
    const xCount = 4;
    const xLabels = Array.from({ length: xCount }, (_, i) => {
      const idx = Math.floor((i / (xCount - 1)) * (candles.length - 1));
      const c = candles[idx];
      const d = new Date(c.timestamp);
      const label = selectedInterval.range === '1d'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return { label, x: toX(idx) };
    });

    return { minPrice, maxPrice, linePath, areaPath, yLabels, xLabels };
  }, [candles, innerW, innerH, selectedInterval.range]);

  const color = positive ? '#00C087' : '#FF4D4D';
  const areaColor = positive ? 'rgba(0,192,135,0.15)' : 'rgba(255,77,77,0.15)';

  const tooltipCandle = tooltipIndex !== null ? candles[tooltipIndex] : null;

  return (
    <View style={styles.container}>
      {/* Interval selector */}
      <View style={styles.intervals}>
        {INTERVALS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            onPress={() => onIntervalChange(opt)}
            style={[
              styles.intervalBtn,
              selectedInterval.label === opt.label && { backgroundColor: color },
            ]}
          >
            <Text style={[
              styles.intervalText,
              selectedInterval.label === opt.label && styles.intervalTextActive,
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tooltip */}
      {tooltipCandle && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>
            {new Date(tooltipCandle.timestamp).toLocaleString([], {
              month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
          <Text style={[styles.tooltipPrice, { color }]}>
            ${tooltipCandle.close.toFixed(2)}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={[styles.chartArea, styles.centered]}>
          <ActivityIndicator color={color} size="large" />
        </View>
      ) : error || !candles.length ? (
        <View style={[styles.chartArea, styles.centered]}>
          <Text style={styles.errorText}>No chart data available</Text>
        </View>
      ) : (
        <Svg
          width={chartWidth}
          height={CHART_HEIGHT}
          onPress={(e) => {
            const x = e.nativeEvent.locationX - PADDING.left;
            const idx = Math.round((x / innerW) * (candles.length - 1));
            const clamped = Math.max(0, Math.min(candles.length - 1, idx));
            setTooltipIndex(tooltipIndex === clamped ? null : clamped);
          }}
        >
          {/* Grid lines */}
          {yLabels.map(({ y, price }, i) => (
            <G key={i}>
              <Line
                x1={PADDING.left}
                y1={y}
                x2={chartWidth - PADDING.right}
                y2={y}
                stroke="#2A2A3A"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={chartWidth - PADDING.right + 5}
                y={y + 4}
                fontSize={9}
                fill="#888"
              >
                {price < 1 ? price.toFixed(4) : price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(1)}
              </SvgText>
            </G>
          ))}

          {/* Area fill */}
          <Path d={areaPath} fill={areaColor} />

          {/* Line */}
          <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />

          {/* X labels */}
          {xLabels.map(({ label, x }, i) => (
            <SvgText
              key={i}
              x={x}
              y={CHART_HEIGHT - 5}
              fontSize={9}
              fill="#888"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}

          {/* Tooltip crosshair */}
          {tooltipIndex !== null && candles[tooltipIndex] && (() => {
            const c = candles[tooltipIndex];
            const toX = (i: number) => PADDING.left + (i / (candles.length - 1)) * innerW;
            const toY = (price: number) => {
              const closes = candles.map((c) => c.close);
              const min = Math.min(...closes);
              const max = Math.max(...closes);
              return PADDING.top + ((max - price) / (max - min || 1)) * innerH;
            };
            const cx = toX(tooltipIndex);
            const cy = toY(c.close);
            return (
              <G>
                <Line x1={cx} y1={PADDING.top} x2={cx} y2={PADDING.top + innerH}
                  stroke={color} strokeWidth={1} strokeDasharray="3,3" opacity={0.7} />
                <Rect x={cx - 4} y={cy - 4} width={8} height={8} rx={4} fill={color} />
              </G>
            );
          })()}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  intervals: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  intervalBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1E1E2E',
  },
  intervalText: { color: '#888', fontSize: 12, fontWeight: '600' },
  intervalTextActive: { color: '#FFF' },
  chartArea: { height: CHART_HEIGHT },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 14 },
  tooltip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  tooltipDate: { color: '#888', fontSize: 12 },
  tooltipPrice: { fontSize: 13, fontWeight: '700' },
});

export { INTERVALS };

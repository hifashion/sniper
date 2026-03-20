import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export function MiniSparkline({ data, width = 60, height = 28, positive = true }: Props) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * width;
  const toY = (v: number) => height - ((v - min) / range) * height;

  let d = '';
  data.forEach((v, i) => {
    d += i === 0 ? `M${toX(i)},${toY(v)}` : ` L${toX(i)},${toY(v)}`;
  });

  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={positive ? '#00C087' : '#FF4D4D'} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

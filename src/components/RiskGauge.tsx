import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface RiskGaugeProps {
  value: number; // 0-10
  size?: 'small' | 'large';
}

const COLORS = ['#22c55e', '#fbbf24', '#f59e0b', '#ef4444'];

export const RiskGauge: React.FC<RiskGaugeProps> = ({ value, size = 'large' }) => {
  // Map value 0-10 to 0-100
  const percent = Math.min(Math.max(value * 10, 0), 100);
  const gaugeData = [
    { value: percent },
    { value: 100 - percent }
  ];
  const width = size === 'small' ? 60 : 120;
  const height = size === 'small' ? 60 : 120;
  const cx = width / 2;
  const cy = height / 2;
  const innerRadius = size === 'small' ? 18 : 32;
  const outerRadius = size === 'small' ? 28 : 48;

  // Color by risk
  let color = COLORS[0];
  if (value >= 8) color = COLORS[3];
  else if (value >= 6) color = COLORS[2];
  else if (value >= 4) color = COLORS[1];

  return (
    <div className="flex flex-col items-center justify-center">
      <PieChart width={width} height={height}>
        <Pie
          data={gaugeData}
          startAngle={180}
          endAngle={0}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
        >
          <Cell key="gauge" fill={color} />
          <Cell key="rest" fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <span className="text-lg font-bold mt-2" style={{ color }}>{value.toFixed(1)}</span>
      <span className="text-xs text-gray-500">Risk</span>
    </div>
  );
};

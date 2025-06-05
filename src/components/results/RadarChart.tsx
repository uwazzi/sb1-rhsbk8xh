import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartData } from '../../types';

interface RadarChartProps {
  data: ChartData;
  title?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md bg-white p-2 shadow-md">
        <p className="text-xs font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const RadarChart: React.FC<RadarChartProps> = ({ data, title }) => {
  return (
    <div className="h-full w-full rounded-lg bg-white p-4 shadow-sm">
      {title && <h3 className="mb-4 text-center text-lg font-semibold text-slate-900">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} stroke="#cbd5e1" />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.6}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarChart;
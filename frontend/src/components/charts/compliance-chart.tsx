'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface SectionScore {
  section: string;
  sectionNumber: string;
  score: number;
}

interface TrendDataPoint {
  date: string;
  score: number;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 50) return '#eab308'; // yellow
  return '#ef4444'; // red
};

interface ComplianceBarChartProps {
  data: SectionScore[];
  height?: number;
}

export function ComplianceBarChart({ data, height = 300 }: ComplianceBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis
          type="category"
          dataKey="sectionNumber"
          width={50}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance']}
          labelFormatter={(label) => {
            const item = data.find((d) => d.sectionNumber === label);
            return item ? `Section ${label}: ${item.section}` : label;
          }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ComplianceRadarChartProps {
  data: SectionScore[];
  height?: number;
}

export function ComplianceRadarChart({ data, height = 400 }: ComplianceRadarChartProps) {
  const radarData = data.map((item) => ({
    subject: item.sectionNumber,
    fullMark: 100,
    score: item.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar
          name="Compliance"
          dataKey="score"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.5}
        />
        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance']} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface TrendLineChartProps {
  data: TrendDataPoint[];
  height?: number;
}

export function TrendLineChart({ data, height = 300 }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Compliance']} />
        <Legend />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb' }}
          activeDot={{ r: 8 }}
          name="Overall Compliance"
        />
        {/* Reference lines for thresholds */}
        <Line
          type="monotone"
          dataKey={() => 70}
          stroke="#22c55e"
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          name="Target (70%)"
        />
        <Line
          type="monotone"
          dataKey={() => 50}
          stroke="#ef4444"
          strokeDasharray="5 5"
          strokeWidth={1}
          dot={false}
          name="Critical (50%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface ComplianceGaugeProps {
  value: number;
  size?: number;
}

export function ComplianceGauge({ value, size = 200 }: ComplianceGaugeProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const angle = (percentage / 100) * 180;
  const color = getScoreColor(percentage);

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
      <svg
        viewBox="0 0 200 120"
        width={size}
        height={size / 2 + 30}
        className="transform"
      >
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Center text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="text-3xl font-bold"
          fill={color}
        >
          {Math.round(percentage)}%
        </text>
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="text-sm"
          fill="#6b7280"
        >
          Compliance
        </text>
      </svg>
    </div>
  );
}

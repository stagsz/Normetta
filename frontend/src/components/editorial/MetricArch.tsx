'use client';

interface MetricArchProps {
  topLabel?: string;
  value: number;
  metricLabel: string;
  bottomLabel?: string;
}

export function MetricArch({
  topLabel = 'Non-Conformities',
  value,
  metricLabel,
  bottomLabel = 'Critical_Path',
}: MetricArchProps) {
  return (
    <aside className="ed-module ed-metric-arch ed-animate-in-delay-3">
      <span className="ed-meta">{topLabel}</span>
      <div className="ed-massive-number">{value}</div>
      <div className="ed-metric-label">{metricLabel}</div>
      <span className="ed-meta ed-metric-arch__bottom-meta">{bottomLabel}</span>
    </aside>
  );
}

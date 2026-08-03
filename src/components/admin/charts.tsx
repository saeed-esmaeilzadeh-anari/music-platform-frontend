'use client';

import { formatFaNumber } from '@/lib/utils/format-fa';

// ─── Donut chart ────────────────────────────────────────────────────────────
// Pure SVG, no dependency. Good for small compositions (2-5 segments).

export interface DonutSegment {
  label: string;
  value: number;
  colorVar: string; // CSS color, e.g. 'hsl(var(--primary))'
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({ segments, size = 168, strokeWidth = 22 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((seg, i) => {
              const fraction = seg.value / total;
              const dash = fraction * circumference;
              const offset = -((cumulative / total) * circumference);
              cumulative += seg.value;
              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.colorVar}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{formatFaNumber(total)}</span>
          <span className="text-[11px] text-muted-foreground">مجموع</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.colorVar }} aria-hidden />
              {seg.label}
            </span>
            <span className="font-semibold text-foreground">{formatFaNumber(seg.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Gauge / ratio bar ──────────────────────────────────────────────────────
// A single labeled progress bar — used for e.g. "active subscriptions ÷ users".

interface RatioBarProps {
  label: string;
  numerator: number;
  denominator: number;
  colorVar?: string;
}

export function RatioBar({ label, numerator, denominator, colorVar = 'hsl(var(--primary))' }: RatioBarProps) {
  const pct = denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {formatFaNumber(pct)}٪
          <span className="ms-1.5 font-normal text-muted-foreground">
            ({formatFaNumber(numerator)} از {formatFaNumber(denominator)})
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: colorVar }}
        />
      </div>
    </div>
  );
}

// ─── Horizontal bar list ────────────────────────────────────────────────────
// Simple comparative bars for a handful of labeled counts.

export interface BarItem {
  label: string;
  value: number;
  colorVar?: string;
}

export function BarList({ items }: { items: BarItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{formatFaNumber(item.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.colorVar ?? 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

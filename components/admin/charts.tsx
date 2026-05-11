import { cn } from "@/lib/utils";

type Point = { date: string; value: number };

/**
 * Area chart for 30-day series. No external deps. The path is computed at
 * render time from the provided points, normalized to the SVG viewBox.
 */
export function AreaChart({
  data,
  className,
  formatValue,
  tooltipPrefix,
}: {
  data: Point[];
  className?: string;
  formatValue?: (v: number) => string;
  tooltipPrefix?: string;
}) {
  const width = 600;
  const height = 160;
  const pad = 8;
  const innerH = height - pad * 2;
  const innerW = width - pad * 2;
  const n = data.length;
  const max = Math.max(1, ...data.map((p) => p.value));

  const points = data.map((p, i) => {
    const x = pad + (i / Math.max(1, n - 1)) * innerW;
    const y = pad + innerH - (p.value / max) * innerH;
    return { x, y, ...p };
  });

  const linePath =
    points.length === 0
      ? ""
      : "M " +
        points
          .map((p, i) => (i === 0 ? `${p.x},${p.y}` : `L ${p.x},${p.y}`))
          .join(" ");
  const areaPath =
    points.length === 0
      ? ""
      : `${linePath} L ${pad + innerW},${pad + innerH} L ${pad},${pad + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Série temporal"
      className={cn("h-40 w-full", className)}
    >
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((r) => (
        <line
          key={r}
          x1={pad}
          x2={pad + innerW}
          y1={pad + innerH * r}
          y2={pad + innerH * r}
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#area-grad)" />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p) => (
        <g key={p.date}>
          <circle
            cx={p.x}
            cy={p.y}
            r="6"
            fill="transparent"
            className="cursor-default"
          >
            <title>
              {p.date}: {tooltipPrefix ?? ""}
              {formatValue ? formatValue(p.value) : p.value}
            </title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

/**
 * Compact vertical bars. Good for "orders per day" — easier to read counts
 * than a continuous line.
 */
export function VerticalBars({
  data,
  className,
}: {
  data: Point[];
  className?: string;
}) {
  const width = 600;
  const height = 120;
  const pad = 6;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const max = Math.max(1, ...data.map((p) => p.value));
  const barW = innerW / data.length - 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Barras"
      className={cn("h-28 w-full", className)}
    >
      {data.map((p, i) => {
        const h = (p.value / max) * innerH;
        const x = pad + (i / data.length) * innerW + 1;
        const y = pad + innerH - h;
        return (
          <g key={p.date}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 1)}
              rx="1.5"
              fill="currentColor"
              fillOpacity="0.6"
            >
              <title>
                {p.date}: {p.value}
              </title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Horizontal "bar list" — labelled rows with proportional bars and a right-
 * aligned value. Use for category mix, top organizers, etc.
 */
export function BarList({
  items,
  formatValue,
  className,
}: {
  items: { label: string; value: number; hint?: string }[];
  formatValue?: (v: number) => string;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sem dados ainda.
      </p>
    );
  }
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((it) => {
        const pct = (it.value / max) * 100;
        return (
          <li key={it.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {it.label}
                {it.hint ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {it.hint}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatValue ? formatValue(it.value) : it.value}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-foreground/70"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Small inline trend sparkline that fits inside a card header.
 */
export function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  if (data.length === 0) return null;
  const width = 80;
  const height = 24;
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-6 w-20", className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        points={pts.join(" ")}
      />
    </svg>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { allocatedDecimals, maskCapacity } from "@/lib/energy";
const names = ["Voltage", "Current", "Power", "Energy"];
const units = ["V", "A", "W", "Wh"];
const colors = [
  "var(--gauge-voltage)",
  "var(--gauge-current)",
  "var(--gauge-power)",
  "var(--gauge-energy)",
];
export function Gauges({ values, capacities }: { values: number[]; capacities: number[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
      {values.map((value, index) => {
        const unit = (value < 1000 ? "" : "k") + units[index];
        const text = allocatedDecimals(value < 1000 ? value : value / 1000);
        const limit = maskCapacity(value, capacities[index]);
        const percent = Math.max(0, Math.min(1, value / limit));
        return (
          <figure
            key={names[index]}
            className="text-center"
            aria-label={`${names[index]}: ${text} ${unit}`}
          >
            <svg
              className="mx-auto w-full max-w-40"
              viewBox="0 0 160 90"
              role="img"
              aria-label={`${text} ${unit}; maximum ${capacities[index]} ${units[index]}`}
            >
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke="var(--gauge-track)"
                strokeWidth="28"
              />
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke={colors[index]}
                strokeWidth="28"
                pathLength="100"
                strokeDasharray={`${percent * 100} 100`}
              />
              <text
                x="80"
                y="80"
                textAnchor="middle"
                fill="currentColor"
                fontSize="15"
                fontWeight="bold"
              >
                {text}
                <tspan fontSize="11">{unit}</tspan>
              </text>
            </svg>
            <figcaption className="mt-1 uppercase">{names[index]}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
export function MeterChart({
  series,
  position,
  capacity,
}: {
  series: number[][];
  position: number;
  capacity: number;
}) {
  const container = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 710, height: 350 });
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const values = series[position];
  const latest = values.at(-1) ?? 0;
  const maximum = latest >= capacity - 10 ? capacity : Math.max(1, ...values);
  const left = 46,
    right = size.width - 10,
    bottom = size.height - 26,
    top = 10;
  const points = values
    .map(
      (value, index) =>
        `${left + (index / 99) * (right - left)},${bottom - (value / maximum) * (bottom - top)}`,
    )
    .join(" ");
  const color = ["var(--chart-voltage)", "var(--chart-current)", "var(--chart-power)"][position];
  return (
    <figure>
      <svg
        ref={container}
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="h-[180px] w-full xs:h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]"
        role="img"
        aria-label={`${names[position]} chart, last 100 readings; latest ${allocatedDecimals(latest)} ${units[position]}`}
      >
        {[0, 1, 2, 3, 4, 5].map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={right}
              y1={bottom - (tick / 5) * (bottom - top)}
              y2={bottom - (tick / 5) * (bottom - top)}
              stroke="var(--accent)"
            />
            <text
              x={left - 6}
              y={bottom + 4 - (tick / 5) * (bottom - top)}
              textAnchor="end"
              fill="currentColor"
              fontSize="11"
            >
              {((maximum * tick) / 5).toFixed(maximum < 10 ? 2 : 0)}
            </text>
            <text
              x={left + (tick / 5) * (right - left)}
              y={size.height - 6}
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
            >
              {tick * 20}
            </text>
          </g>
        ))}
        <polygon
          points={`${left},${bottom} ${points} ${right},${bottom}`}
          fill={color}
          fillOpacity=".3"
        />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      </svg>
      <figcaption className="text-center uppercase">{names[position]}</figcaption>
    </figure>
  );
}

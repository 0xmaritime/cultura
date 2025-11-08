"use client";

import { useId, useMemo } from "react";
import clsx from "clsx";

type SparklineProps = {
  data: number[];
  colorStops?: string[];
  className?: string;
};

const width = 220;
const height = 72;

export default function Sparkline({
  data,
  colorStops = ["#a855f7", "#ec4899"],
  className,
}: SparklineProps) {
  const gradientId = useId();

  const { points, min, max } = useMemo(() => {
    if (!data.length) {
      return { points: [], min: 0, max: 0 };
    }

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = Math.max(maxValue - minValue, 1);

    const computedPoints = data.map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return { x, y };
    });

    return { points: computedPoints, min: minValue, max: maxValue };
  }, [data]);

  if (!points.length) return null;

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={clsx("w-full", className)}
      role="img"
      aria-label={`Attention sparkline min ${min} max ${max}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {colorStops.map((stop, index) => (
            <stop
              key={stop}
              offset={`${(index / Math.max(colorStops.length - 1, 1)) * 100}%`}
              stopColor={stop}
              stopOpacity="1"
            />
          ))}
        </linearGradient>
      </defs>

      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        fillOpacity={0.15}
        stroke="none"
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

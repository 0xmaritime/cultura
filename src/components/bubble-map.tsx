"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { entities } from "@/data/entities";

const width = 820;
const height = 520;

const connections: [string, string][] = [
  ["seed-oils", "ai-doom"],
  ["seed-oils", "ozempic-style"],
  ["ai-doom", "anora"],
  ["ai-doom", "vibe-shift"],
  ["vibe-shift", "cottagecore"],
  ["ozempic-style", "vibe-shift"],
];

export default function BubbleMap() {
  const layout = useMemo(() => {
    const layers = [0, 150, 230];
    const centerX = width / 2;
    const centerY = height / 2;

    return entities.map((entity, index) => {
      const radius = 36 + entity.metrics.attention * 55;
      const layer = layers[index % layers.length];
      const angle = (index / entities.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * layer;
      const y = centerY + Math.sin(angle) * layer;

      return { id: entity.id, entity, x, y, radius };
    });
  }, []);

  const [activeId, setActiveId] = useState(layout[0]?.id ?? null);
  const active = layout.find((node) => node.id === activeId) ?? layout[0];

  const edges = useMemo(() => {
    const map = new Map(layout.map((node) => [node.id, node]));
    return connections
      .map(([a, b]) => {
        const source = map.get(a);
        const target = map.get(b);
        if (!source || !target) return null;
        return { id: `${a}-${b}`, source, target };
      })
      .filter(Boolean) as {
      id: string;
      source: (typeof layout)[number];
      target: (typeof layout)[number];
    }[];
  }, [layout]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)]/70 bg-gradient-to-b from-[#fef4ff] via-[#f1f8ff] to-[#fff] p-4 shadow-xl dark:from-[#090712] dark:via-[#050511] dark:to-[#05060a]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <defs>
            {layout.map((node) => (
              <radialGradient
                key={`grad-${node.id}`}
                id={`grad-${node.id}`}
                cx="30%"
                cy="30%"
                r="70%"
              >
                <stop offset="0%" stopColor={node.entity.palette[0]} stopOpacity="0.95" />
                <stop offset="100%" stopColor={node.entity.palette[1]} stopOpacity="0.75" />
              </radialGradient>
            ))}
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
              stroke="url(#edgeGradient)"
              strokeOpacity={0.3}
              strokeWidth={2}
            />
          ))}

          {layout.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={`url(#grad-${node.id})`}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={activeId === node.id ? 3 : 1}
                className="cursor-pointer drop-shadow-2xl transition duration-200 hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
              />
              <text
                x={node.x}
                y={node.y}
                className={clsx(
                  "select-none text-center text-xs font-semibold uppercase tracking-[0.2em]",
                  activeId === node.id ? "fill-white" : "fill-black/75 dark:fill-white/70"
                )}
                textAnchor="middle"
                dy="0.35em"
              >
                {node.entity.name.replace(/ .*/, "")}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-3xl border border-[var(--border)]/70 bg-[var(--card)]/80 p-6 backdrop-blur dark:bg-[var(--card)]">
        {active && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/70">
              Spotlight
            </p>
            <h3 className="text-2xl font-semibold">{active.entity.name}</h3>
            <p className="text-sm text-[var(--foreground)]/80">{active.entity.summary}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Attention" value={`${Math.round(active.entity.metrics.attention * 100)}%`} />
              <Metric
                label="Momentum"
                value={`${active.entity.metrics.momentum > 0 ? "+" : ""}${Math.round(
                  active.entity.metrics.momentum * 100
                )}%`}
              />
              <Metric label="Controversy" value={`${Math.round(active.entity.metrics.controversy * 100)}%`} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/60">
                Communities
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--foreground)]/80">
                {active.entity.communities.slice(0, 4).map((community) => (
                  <span
                    key={community}
                    className="rounded-full border border-[var(--border)]/70 px-3 py-1 backdrop-blur"
                  >
                    {community}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)]/80 bg-white/40 p-3 text-[var(--foreground)] shadow-sm dark:bg-black/30 dark:text-white">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--foreground)]/60 dark:text-white/70">
        {label}
      </p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

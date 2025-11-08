"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { Compass, Radar } from "lucide-react";
import Sparkline from "@/components/search-lens/sparkline";
import { sourceMeta } from "@/components/search-lens/source-meta";
import type { Entity } from "@/data/entities";
import { entities } from "@/data/entities";
import { bubbleLinks } from "@/data/bubble-map";

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 520;

const filterOptions = [
  { id: "all", label: "All attention" },
  { id: "surging", label: "Surging" },
  { id: "steady", label: "Steady heat" },
  { id: "cooling", label: "Cooling" },
  { id: "controversial", label: "Controversial" },
] as const;

type FilterKey = (typeof filterOptions)[number]["id"];

type LayoutNode = {
  id: string;
  x: number;
  y: number;
  radius: number;
  entity: Entity;
};

const countsByFilter = filterOptions.reduce<Record<FilterKey, number>>((acc, option) => {
  acc[option.id] = countEntitiesForFilter(option.id);
  return acc;
}, {} as Record<FilterKey, number>);

function countEntitiesForFilter(filter: FilterKey) {
  if (filter === "all") return entities.length;
  if (filter === "controversial") {
    return entities.filter((entity) => entity.metrics.controversy >= 0.55).length;
  }
  return entities.filter((entity) => entity.momentumStatus === filter).length;
}

const typeLegend = Array.from(
  entities.reduce((map, entity) => {
    const current = map.get(entity.type) ?? { count: 0, color: entity.palette[0] };
    current.count += 1;
    map.set(entity.type, current);
    return map;
  }, new Map<string, { count: number; color: string }>())
).map(([type, meta]) => ({ type, ...meta }));

const matchesFilter = (entity: Entity, filter: FilterKey) => {
  if (filter === "surging" || filter === "steady" || filter === "cooling") {
    return entity.momentumStatus === filter;
  }
  if (filter === "controversial") {
    return entity.metrics.controversy >= 0.55;
  }
  return true;
};

export default function BubbleMap() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = Math.max(420, width * 0.6);
      setViewport({ width, height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  const baseLayout = useMemo(() => {
    const { width, height } = viewport;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;
    const computedRings = [0, maxRadius * 0.55, maxRadius];

    const nodes: LayoutNode[] = entities.map((entity, index) => {
      const ringIndex = index % computedRings.length;
      const theta = (index / entities.length) * Math.PI * 2;
      const x = centerX + Math.cos(theta) * computedRings[ringIndex];
      const y = centerY + Math.sin(theta) * computedRings[ringIndex];
      const radius = 30 + entity.metrics.attention * 55;
      return { id: entity.id, entity, x, y, radius };
    });

    return nodes;
  }, [viewport]);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeId, setActiveId] = useState(baseLayout[0]?.id ?? "");

  const visibleNodes = useMemo(
    () => baseLayout.filter((node) => matchesFilter(node.entity, filter)),
    [baseLayout, filter]
  );

  const activeNodeId = visibleNodes.some((node) => node.id === activeId)
    ? activeId
    : visibleNodes[0]?.id ?? "";
  const activeNode = visibleNodes.find((node) => node.id === activeNodeId) ?? null;

  const nodeMap = useMemo(() => new Map(baseLayout.map((node) => [node.id, node])), [baseLayout]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const edges = useMemo(() => {
    return bubbleLinks
      .map((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return null;
        if (!visibleIds.has(source.id) || !visibleIds.has(target.id)) return null;
        const highlighted = source.id === activeNodeId || target.id === activeNodeId;
        return { id: `${link.source}-${link.target}`, source, target, weight: link.weight, highlighted };
      })
      .filter(Boolean) as {
      id: string;
      source: LayoutNode;
      target: LayoutNode;
      weight: number;
      highlighted: boolean;
    }[];
  }, [nodeMap, visibleIds, activeNodeId]);

  const connected = useMemo(() => {
    if (!activeNode) return [];
    return bubbleLinks
      .filter((link) => link.source === activeNode.id || link.target === activeNode.id)
      .map((link) => {
        const otherId = link.source === activeNode.id ? link.target : link.source;
        const node = nodeMap.get(otherId);
        if (!node) return null;
        return { node, weight: link.weight };
      })
      .filter(Boolean) as { node: LayoutNode; weight: number }[];
  }, [activeNode, nodeMap]);

  const stats = useMemo(() => {
    if (!visibleNodes.length) {
      return { count: 0, momentum: 0, controversy: 0 };
    }
    const sumMomentum = visibleNodes.reduce((sum, node) => sum + node.entity.metrics.momentum, 0);
    const sumControversy = visibleNodes.reduce((sum, node) => sum + node.entity.metrics.controversy, 0);
    return {
      count: visibleNodes.length,
      momentum: sumMomentum / visibleNodes.length,
      controversy: sumControversy / visibleNodes.length,
    };
  }, [visibleNodes]);

  const backgroundClass = isDark
    ? "from-[#07060f] via-[#05040c] to-[#03030a]"
    : "from-[#fff8fb] via-[#f5fbff] to-[#ffffff]";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/70">Bubble map</p>
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">Attention graph (mocked)</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/70">
          <Radar className="h-4 w-4" /> Responsive · theme-aware · sample data
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition",
              filter === option.id
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--border)]/80 text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
            )}
          >
            {option.label}
            <span className="text-xs opacity-75">{countsByFilter[option.id]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/70">
        {typeLegend.map((item) => (
          <span
            key={item.type}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/70 px-3 py-1"
            style={{ backgroundColor: `${item.color}1a` }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: item.color }}
            />
            {item.type} · {item.count}
          </span>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStat label="Visible clusters" value={stats.count.toString()} />
        <QuickStat
          label="Avg. momentum"
          value={`${stats.momentum >= 0 ? "+" : ""}${(stats.momentum * 100).toFixed(0)}%`}
        />
        <QuickStat
          label="Avg. controversy"
          value={`${(stats.controversy * 100).toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div
          ref={containerRef}
          className={clsx(
            "relative overflow-hidden rounded-[2rem] border border-[var(--border)]/70 p-4 shadow-xl",
            `bg-gradient-to-b ${backgroundClass}`
          )}
        >
          <svg
            viewBox={`0 0 ${viewport.width} ${viewport.height}`}
            className="w-full"
            role="img"
            aria-label="Entity bubble map"
          >
            <defs>
              {baseLayout.map((node) => (
                <radialGradient key={`grad-${node.id}`} id={`grad-${node.id}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={node.entity.palette[0]} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={node.entity.palette[1]} stopOpacity="0.55" />
                </radialGradient>
              ))}
              <linearGradient id="edge-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {edges.map((edge) => (
              <line
                key={edge.id}
                x1={edge.source.x}
                y1={edge.source.y}
                x2={edge.target.x}
                y2={edge.target.y}
                stroke={edge.highlighted ? "url(#edge-highlight)" : `rgba(255,255,255,${isDark ? 0.08 : 0.18})`}
                strokeWidth={edge.highlighted ? 3 : 1.2}
                strokeOpacity={edge.highlighted ? 0.9 : 0.6}
              />
            ))}

            {baseLayout.map((node) => {
              const isVisible = visibleIds.has(node.id);
              const isActive = node.id === activeNodeId;
              return (
                <g key={node.id} className={clsx(!isVisible && "opacity-30")}> 
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={`url(#grad-${node.id})`}
                    stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.08)"}
                    strokeWidth={isActive ? 3 : 1.2}
                    className={clsx(
                      "cursor-pointer transition duration-200",
                      isActive && "drop-shadow-[0_0_25px_rgba(255,255,255,0.45)]"
                    )}
                    onMouseEnter={() => isVisible && setActiveId(node.id)}
                    onFocus={() => isVisible && setActiveId(node.id)}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    className={clsx(
                      "select-none text-center text-[0.6rem] font-semibold tracking-[0.25em]",
                      isDark ? "fill-white/70" : "fill-black/60",
                      isActive && "fill-white"
                    )}
                    textAnchor="middle"
                    dy="0.35em"
                  >
                    {node.entity.name.toUpperCase().slice(0, 16)}
                  </text>
                </g>
              );
            })}
          </svg>

          {activeNode && (
            <div className="pointer-events-auto absolute left-6 top-6 max-w-[260px] rounded-2xl border border-white/30 bg-black/40 p-4 text-white backdrop-blur dark:bg-black/60">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Now viewing</p>
              <p className="text-lg font-semibold">{activeNode.entity.name}</p>
              <p className="text-xs text-white/70">{activeNode.entity.lastPulse}</p>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-[var(--border)]/70 bg-[var(--card)]/90 p-6 backdrop-blur">
          {activeNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/70">
                <span className="inline-flex items-center gap-2">
                  <Compass className="h-4 w-4" /> Spotlight
                </span>
                <span>{activeNode.entity.type}</span>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--foreground)] dark:text-white">
                {activeNode.entity.name}
              </h3>
              <p className="text-sm text-[var(--foreground)]/80 dark:text-white/80">
                {activeNode.entity.summary}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricBar
                  label="Attention"
                  value={`${Math.round(activeNode.entity.metrics.attention * 100)}%`}
                  percent={activeNode.entity.metrics.attention}
                  accent={activeNode.entity.palette[0]}
                />
                <MetricBar
                  label="Momentum"
                  value={`${activeNode.entity.metrics.momentum >= 0 ? "+" : ""}${Math.round(
                    activeNode.entity.metrics.momentum * 100
                  )}%`}
                  percent={(activeNode.entity.metrics.momentum + 1) / 2}
                  accent="#34d399"
                />
                <MetricBar
                  label="Controversy"
                  value={`${Math.round(activeNode.entity.metrics.controversy * 100)}%`}
                  percent={activeNode.entity.metrics.controversy}
                  accent="#f472b6"
                />
              </div>

              <div className="rounded-2xl border border-[var(--border)]/70 bg-white/70 p-3 dark:bg-black/40">
                <Sparkline
                  data={activeNode.entity.sparkline}
                  colorStops={activeNode.entity.palette}
                  className="h-20"
                />
                <p className="mt-2 text-xs text-[var(--foreground)]/70 dark:text-white/70">
                  Attention sparkline · {activeNode.entity.lastPulse}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/60">Connected clusters</p>
                <div className="mt-3 space-y-2">
                  {connected.length === 0 && (
                    <p className="text-xs text-[var(--foreground)]/60">No direct links in the mock graph.</p>
                  )}
                  {connected.map(({ node, weight }) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)]/60 px-3 py-2 text-xs text-[var(--foreground)]/80"
                    >
                      <span>{node.entity.name}</span>
                      <span className="font-semibold">{Math.round(weight * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/60">Recent receipts</p>
                <div className="mt-2 space-y-3">
                  {activeNode.entity.receipts.slice(0, 2).map((receipt) => {
                    const meta = sourceMeta[receipt.source];
                    const Icon = meta.Icon;
                    return (
                      <div
                        key={receipt.title}
                        className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/60 px-3 py-2 text-sm"
                      >
                        <span className="rounded-2xl bg-black/5 p-2 dark:bg-white/10">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="text-left">
                          <p className="font-semibold text-[var(--foreground)] dark:text-white">{receipt.title}</p>
                          <p className="text-xs text-[var(--foreground)]/70 dark:text-white/70">
                            {meta.label} · {receipt.context}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--foreground)]/60">
              No clusters for this filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type QuickStatProps = {
  label: string;
  value: string;
};

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)]/70 bg-white/70 px-4 py-3 text-sm dark:bg-black/40">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--foreground)]/60 dark:text-white/70">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[var(--foreground)] dark:text-white">{value}</p>
    </div>
  );
}

type MetricBarProps = {
  label: string;
  value: string;
  percent: number;
  accent: string;
};

function MetricBar({ label, value, percent, accent }: MetricBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 1);
  return (
    <div className="space-y-1 rounded-2xl border border-[var(--border)]/70 bg-white/70 p-3 text-sm dark:bg-black/40">
      <div className="flex items-center justify-between text-xs text-[var(--foreground)]/70 dark:text-white/70">
        <span>{label}</span>
        <span className="font-semibold text-[var(--foreground)] dark:text-white">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 dark:bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${clamped * 100}%`, background: accent }}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { Compass, Radar } from "lucide-react";
import { entities } from "@/data/entities";
import { bubbleLinks } from "@/data/bubble-map";
import Sparkline from "@/components/search-lens/sparkline";

const width = 900;
const height = 520;

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
  entity: (typeof entities)[number];
};

const matchesFilter = (entity: (typeof entities)[number], filter: FilterKey) => {
  if (filter === "surging") return entity.momentumStatus === "surging";
  if (filter === "steady") return entity.momentumStatus === "steady";
  if (filter === "cooling") return entity.momentumStatus === "cooling";
  if (filter === "controversial") return entity.metrics.controversy >= 0.55;
  return true;
};

export default function BubbleMap() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const baseLayout = useMemo<LayoutNode[]>(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const rings = [0, 170, 260];

    return entities.map((entity, index) => {
      const ring = rings[index % rings.length];
      const theta = (index / entities.length) * Math.PI * 2;
      const x = centerX + Math.cos(theta) * ring;
      const y = centerY + Math.sin(theta) * ring;
      const radius = 30 + entity.metrics.attention * 55;
      return { id: entity.id, entity, x, y, radius };
    });
  }, []);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeId, setActiveId] = useState(baseLayout[0]?.id ?? "");

  const visibleNodes = useMemo(() => baseLayout.filter((node) => matchesFilter(node.entity, filter)), [baseLayout, filter]);

  const activeNodeId = visibleNodes.some((node) => node.id === activeId)
    ? activeId
    : visibleNodes[0]?.id ?? baseLayout[0]?.id ?? "";
  const activeNode = visibleNodes.find((node) => node.id === activeNodeId) ?? visibleNodes[0] ?? null;

  const nodeMap = useMemo(() => new Map(baseLayout.map((node) => [node.id, node])), [baseLayout]);
  const visibleIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const edges = useMemo(() => {
    return bubbleLinks
      .map((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return null;
        const visible = visibleIds.has(source.id) && visibleIds.has(target.id);
        return visible ? { id: `${link.source}-${link.target}`, weight: link.weight, source, target } : null;
      })
      .filter(Boolean) as {
      id: string;
      weight: number;
      source: LayoutNode;
      target: LayoutNode;
    }[];
  }, [nodeMap, visibleIds]);

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
      return { count: 0, avgMomentum: 0, avgControversy: 0 };
    }
    const count = visibleNodes.length;
    const avgMomentum =
      visibleNodes.reduce((sum, node) => sum + node.entity.metrics.momentum, 0) / visibleNodes.length;
    const avgControversy =
      visibleNodes.reduce((sum, node) => sum + node.entity.metrics.controversy, 0) / visibleNodes.length;
    return { count, avgMomentum, avgControversy };
  }, [visibleNodes]);

  const backgroundClass = isDark
    ? "from-[#07060f] via-[#05040c] to-[#03030a]"
    : "from-[#fff5fb] via-[#f7fbff] to-[#ffffff]";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/70">Bubble map</p>
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">Attention graph (mocked)</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/70">
          <Radar className="h-4 w-4" /> Reacts to filter + theme · static dataset
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm transition",
              filter === option.id
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--border)]/80 text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStat label="Visible clusters" value={stats.count.toString()} />
        <QuickStat
          label="Avg. momentum"
          value={`${stats.avgMomentum >= 0 ? "+" : ""}${(stats.avgMomentum * 100).toFixed(0)}%`}
        />
        <QuickStat
          label="Avg. controversy"
          value={`${(stats.avgControversy * 100).toFixed(0)}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div
          className={clsx(
            "relative overflow-hidden rounded-[2rem] border border-[var(--border)]/70 p-4 shadow-xl",
            `bg-gradient-to-b ${backgroundClass}`
          )}
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Entity bubble map">
            <defs>
              {baseLayout.map((node) => (
                <radialGradient key={`grad-${node.id}`} id={`grad-${node.id}`} cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={node.entity.palette[0]} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={node.entity.palette[1]} stopOpacity="0.6" />
                </radialGradient>
              ))}
            </defs>

            {edges.map((edge) => {
              const highlighted =
                edge.source.id === activeNodeId || edge.target.id === activeNodeId;
              return (
                <line
                  key={edge.id}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke={highlighted ? "url(#edge-highlight)" : `rgba(255,255,255,${isDark ? 0.06 : 0.18})`}
                  strokeWidth={highlighted ? 3 : 1.4}
                  strokeOpacity={highlighted ? 0.9 : 0.6}
                />
              );
            })}

            <defs>
              <linearGradient id="edge-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

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
                      "select-none text-center text-[0.65rem] font-semibold tracking-[0.25em]",
                      isDark ? "fill-white/80" : "fill-black/70",
                      isActive && "fill-white"
                    )}
                    textAnchor="middle"
                    dy="0.35em"
                  >
                    {node.entity.name.toUpperCase().slice(0, 14)}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-white/70">
            Hover a node to inspect its receipts
          </div>
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

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Attention" value={`${Math.round(activeNode.entity.metrics.attention * 100)}%`} />
                <Metric
                  label="Momentum"
                  value={`${activeNode.entity.metrics.momentum >= 0 ? "+" : ""}${Math.round(
                    activeNode.entity.metrics.momentum * 100
                  )}%`}
                />
                <Metric label="Controversy" value={`${Math.round(activeNode.entity.metrics.controversy * 100)}%`} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/60">Connected clusters</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connected.map(({ node, weight }) => (
                    <span
                      key={node.id}
                      className="rounded-full border border-[var(--border)]/70 px-3 py-1 text-xs text-[var(--foreground)]/80"
                    >
                      {node.entity.name} · {Math.round(weight * 100)}%
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--foreground)]/60">Communities</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--foreground)]/80">
                  {activeNode.entity.communities.map((community) => (
                    <span key={community} className="rounded-full border border-[var(--border)]/70 px-3 py-1">
                      {community}
                    </span>
                  ))}
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

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)]/80 bg-white/70 p-3 text-[var(--foreground)] shadow-sm dark:bg-black/40 dark:text-white">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--foreground)]/60 dark:text-white/70">
        {label}
      </p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
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

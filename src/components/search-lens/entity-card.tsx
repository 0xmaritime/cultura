"use client";

import clsx from "clsx";
import {
  ArrowDownRight,
  ArrowUpRight,
  Link2,
  Sparkles,
} from "lucide-react";
import type { Entity } from "@/data/entities";
import { sourceMeta } from "./source-meta";
import Sparkline from "./sparkline";

const metricLabels: Record<keyof Entity["metrics"], string> = {
  attention: "Attention",
  momentum: "Momentum",
  controversy: "Controversy",
};

type EntityCardProps = {
  entity: Entity;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
};

const formatPercent = (value: number, withSign = false) => {
  const intValue = Math.round(value * 100);
  const sign = withSign && intValue > 0 ? "+" : "";
  return `${sign}${intValue}%`;
};

export default function EntityCard({
  entity,
  isActive,
  onHover,
  onSelect,
}: EntityCardProps) {
  const MomentumIcon = entity.metrics.momentum >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
      className={clsx(
        "group relative w-full rounded-3xl border border-white/5 bg-white/5 p-5 text-left backdrop-blur transition",
        "hover:border-white/30 hover:bg-white/10",
        isActive && "border-white/50 bg-white/15 shadow-lg shadow-rose-500/10"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            {entity.type}
          </p>
          <h3 className="text-xl font-semibold text-white">{entity.name}</h3>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
            "bg-zinc-900/70 text-zinc-100 ring-1 ring-white/10"
          )}
        >
          <MomentumIcon className="h-3 w-3" />
          {entity.momentumStatus}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        {entity.summary}
      </p>

      <div className="mt-5 grid gap-3 text-xs sm:grid-cols-3">
        {(Object.keys(entity.metrics) as (keyof Entity["metrics"])[]).map((metricKey) => (
          <div
            key={metricKey}
            className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2"
          >
            <p className="text-[0.7rem] uppercase tracking-wide text-zinc-400">
              {metricLabels[metricKey]}
            </p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(entity.metrics[metricKey], metricKey !== "attention")}
            </p>
            {metricKey === "momentum" && (
              <p className="text-[0.7rem] text-zinc-400">vs 21d baseline</p>
            )}
            {metricKey === "controversy" && (
              <p className="text-[0.7rem] text-zinc-400">heat index</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="sm:w-1/2">
          <Sparkline
            data={entity.sparkline}
            colorStops={["#f472b6", "#c084fc"]}
            className="h-16"
          />
        </div>
        <div className="sm:w-1/2">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Adjacencies
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {entity.adjacency.map((adjacency) => (
              <span
                key={adjacency}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90"
              >
                {adjacency}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-white/5 bg-black/30 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          <Sparkles className="h-4 w-4 text-amber-200" /> Receipts
        </p>
        <div className="space-y-2">
          {entity.receipts.slice(0, 2).map((receipt) => {
            const meta = sourceMeta[receipt.source];
            const Icon = meta.Icon;
            return (
              <div key={receipt.title} className="flex items-start gap-3">
                <span className="rounded-2xl bg-white/5 p-2">
                  <Icon className={clsx("h-4 w-4", meta.accent)} />
                </span>
                <div className="text-left text-sm">
                  <p className="font-medium text-white/90">{receipt.title}</p>
                  <p className="text-xs text-zinc-400">
                    {meta.label} · {receipt.context} · {receipt.date}
                  </p>
                  <p className="text-xs text-zinc-400">{receipt.snippet}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="flex items-center gap-2 text-xs text-zinc-400">
          <Link2 className="h-3.5 w-3.5" /> {entity.lastPulse}
        </p>
      </div>
    </button>
  );
}

import clsx from "clsx";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Network,
  Users2,
} from "lucide-react";
import type { Entity } from "@/data/entities";
import { sourceMeta } from "./source-meta";

const formatPercent = (value: number, withSign = false) => {
  const rounded = Math.round(value * 100);
  const sign = withSign && rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
};

type EntityDetailProps = {
  entity: Entity;
};

export default function EntityDetail({ entity }: EntityDetailProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          {entity.type}
        </p>
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{entity.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {entity.summary}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white">
            {entity.metrics.momentum >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {entity.momentumStatus}
          </span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBlock label="Attention" value={formatPercent(entity.metrics.attention)} hint="share of mentions" />
        <MetricBlock
          label="Momentum"
          value={formatPercent(entity.metrics.momentum, true)}
          hint="7d vs 21d"
        />
        <MetricBlock label="Controversy" value={formatPercent(entity.metrics.controversy)} hint="sentiment spread" />
      </div>

      <section className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          <Users2 className="h-4 w-4" /> Communities watching
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {entity.communities.map((community) => (
            <span
              key={community}
              className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/90"
            >
              {community}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          <Network className="h-4 w-4" /> Traveling with
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {entity.related.map((item) => (
            <span
              key={item}
              className="rounded-full bg-black/40 px-3 py-1 text-xs text-white/90"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="flex-1 rounded-2xl border border-white/5 bg-black/30 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
          Receipts
        </h3>
        <div className="mt-4 space-y-3">
          {entity.receipts.map((receipt) => {
            const meta = sourceMeta[receipt.source];
            const Icon = meta.Icon;
            return (
              <a
                key={receipt.title}
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-white/40"
              >
                <span className="rounded-2xl bg-black/40 p-2">
                  <Icon className={clsx("h-4 w-4", meta.accent)} />
                </span>
                <div className="text-left text-sm">
                  <p className="font-semibold text-white group-hover:text-white">
                    {receipt.title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {meta.label} · {receipt.context} · {receipt.date}
                  </p>
                  <p className="text-xs text-zinc-400">{receipt.snippet}</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-zinc-500" />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

type MetricBlockProps = {
  label: string;
  value: string;
  hint?: string;
};

function MetricBlock({ label, value, hint }: MetricBlockProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-3">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-400">
        {label}
      </p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

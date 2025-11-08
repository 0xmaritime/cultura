"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { Entity } from "@/data/entities";
import { entities } from "@/data/entities";

const placeholderQueries = [
  "seed oil receipts",
  "AI doom momentum",
  "new vibe shift",
];

const normalize = (value: string) => value.trim().toLowerCase();

export default function SearchPreview() {
  const [query, setQuery] = useState(placeholderQueries[0]);

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return entities.slice(0, 3);

    return entities
      .filter((entity) => {
        const haystack = normalize(
          [entity.name, entity.summary, entity.communities.join(" "), entity.adjacency.join(" ")].join(" ")
        );
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, 3);
  }, [query]);

  return (
    <div className="rounded-3xl border border-[var(--border)]/70 bg-[var(--glass)] p-6 backdrop-blur-md dark:bg-white/5">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--foreground)]/70">
        <Sparkles className="h-4 w-4" /> Search receipts, adjacencies, and metric blends.
      </div>
      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)]/80 bg-white/60 px-4 py-3 text-base text-[var(--foreground)] shadow-sm transition focus-within:ring-2 focus-within:ring-black/5 dark:bg-black/30 dark:text-white dark:focus-within:ring-white/30">
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 bg-transparent outline-none"
          placeholder="Trace an idea…"
        />
      </label>
      <div className="mt-6 space-y-3">
        {results.map((entity) => (
          <ResultRow key={entity.id} entity={entity} />
        ))}
      </div>
    </div>
  );
}

type ResultRowProps = {
  entity: Entity;
};

function ResultRow({ entity }: ResultRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)]/70 bg-white/70 p-4 text-sm shadow-sm transition hover:border-[var(--foreground)]/40 dark:bg-black/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/60 dark:text-white/60">
            {entity.type}
          </p>
          <p className="text-lg font-semibold text-[var(--foreground)] dark:text-white">{entity.name}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/70">
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1",
              entity.metrics.momentum >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200"
            )}
          >
            {entity.metrics.momentum >= 0 ? "Surging" : "Cooling"}
          </span>
        </div>
      </div>
      <p className="text-[var(--foreground)]/80 dark:text-white/70">{entity.summary}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {entity.adjacency.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full border border-[var(--border)]/70 px-2 py-1">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

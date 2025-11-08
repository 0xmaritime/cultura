"use client";

import clsx from "clsx";
import {
  Compass,
  CornerDownLeft,
  Filter,
  Keyboard,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Entity } from "@/data/entities";
import { entities } from "@/data/entities";
import EntityCard from "./entity-card";
import EntityDrawer from "./entity-drawer";
import EntityDetail from "./entity-detail";

type FilterKey = "all" | "surging" | "steady" | "cooling" | "spiky";

const quickFilters: { id: FilterKey; label: string }[] = [
  { id: "all", label: "All signals" },
  { id: "surging", label: "Surging now" },
  { id: "steady", label: "Steady heat" },
  { id: "cooling", label: "Cooling off" },
  { id: "spiky", label: "High controversy" },
];

const starterQueries = [
  "seed oils vs mediterranean",
  "anora film discourse",
  "ai doom acceleration",
  "ozempic style memo",
];

const haystackFor = (entity: Entity) =>
  [
    entity.name,
    entity.summary,
    entity.communities.join(" "),
    entity.adjacency.join(" "),
    entity.related.join(" "),
  ]
    .join(" ")
    .toLowerCase();

export default function SearchLens() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selected, setSelected] = useState<Entity | null>(entities[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredEntities = useMemo(() => {
    let list = [...entities];

    if (filter === "surging" || filter === "steady" || filter === "cooling") {
      list = list.filter((entity) => entity.momentumStatus === filter);
    }

    if (filter === "spiky") {
      list = list.filter((entity) => entity.metrics.controversy >= 0.5);
    }

    if (normalizedQuery) {
      const terms = normalizedQuery.split(/\s+/);
      list = list.filter((entity) => {
        const haystack = haystackFor(entity);
        return terms.every((term) => haystack.includes(term));
      });
    }

    return list.sort((a, b) => {
      const score = (entity: Entity) =>
        entity.metrics.attention * 0.6 + entity.metrics.momentum * 0.4 + entity.metrics.controversy * 0.2;
      return score(b) - score(a);
    });
  }, [filter, normalizedQuery]);

  const activeIndex = filteredEntities.length
    ? Math.min(Math.max(focusedIndex, 0), filteredEntities.length - 1)
    : -1;

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredEntities.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredEntities.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(filteredEntities[activeIndex]);
    }
  };

  const handleSelect = (entity: Entity) => {
    setSelected(entity);
    setDrawerOpen(true);
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-[#040406] via-[#090917] to-[#05050b] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[600px] w-[1200px] rounded-full bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_60%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-16 lg:px-8">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-300">
            <Compass className="h-3.5 w-3.5 text-amber-200" /> Cultura Lens
          </span>
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Navigate the cultural weather map
            </h1>
            <p className="mt-3 max-w-2xl text-base text-zinc-300">
              Search across discourse receipts, attention metrics, and adjacency clusters. The Lens
              highlights how ideas are moving before they trend on mainstream feeds.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur">
          <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 px-4 py-3">
            <Search className="h-5 w-5 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Track an idea, meme, or cluster"
              className="flex-1 bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <span className="hidden items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[0.7rem] text-zinc-400 md:inline-flex">
              <Keyboard className="h-3.5 w-3.5" /> ↑ ↓ Enter
            </span>
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <Filter className="h-4 w-4" /> Quick filters:
            {quickFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={clsx(
                  "rounded-full border border-white/10 px-3 py-1 text-xs",
                  filter === item.id
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
            <CornerDownLeft className="h-4 w-4" /> Try:
            {starterQueries.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => setQuery(starter)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:text-white"
              >
                {starter}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,_1.6fr)_minmax(0,_0.9fr)]">
          <section className="space-y-4">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <p>
                Showing <span className="text-white">{filteredEntities.length}</span> clusters
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Real receipts · metrics mocked locally
              </p>
            </div>

            {filteredEntities.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-zinc-400">
                No clusters yet. Try a broader query or switch filters.
              </div>
            )}

            <div className="space-y-4">
              {filteredEntities.map((entity, index) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  isActive={activeIndex === index || selected?.id === entity.id}
                  onHover={() => setFocusedIndex(index)}
                  onSelect={() => handleSelect(entity)}
                />
              ))}
            </div>
          </section>

          <aside className="hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:block">
            {selected ? (
              <EntityDetail entity={selected} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-zinc-400">
                Select an entity to see its receipts and adjacency map.
              </div>
            )}
          </aside>
        </div>
      </div>

      <EntityDrawer
        entity={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

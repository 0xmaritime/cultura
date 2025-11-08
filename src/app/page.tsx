import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import BubbleMap from "@/components/bubble-map";
import SearchPreview from "@/components/search-preview";
import { entities } from "@/data/entities";

const risingEntities = entities
  .filter((entity) => entity.metrics.momentum > 0)
  .sort((a, b) => b.metrics.momentum - a.metrics.momentum)
  .slice(0, 4);

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-10 pb-24 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/70">
            <Compass className="h-3.5 w-3.5" /> Cultura Pulse
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
              Search the cultural weather — momentum, receipts, adjacency in one lens.
            </h1>
            <p className="text-lg text-[var(--foreground)]/80">
              Drop an idea or meme seed to see who is amplifying it, how attention is moving, and what travels with it.
              Bubble maps, receipts, and entity metrics are mocked locally until the ingestion stack ships.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/lens"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-3 font-semibold text-[var(--background)] shadow-lg shadow-black/10"
            >
              Open the Lens <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/0xmaritime/cultura/blob/main/docs/design%20document.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-[var(--foreground)]/80"
            >
              Read the Spec
            </a>
          </div>
          <div className="rounded-3xl border border-[var(--border)]/70 bg-white/70 p-4 text-sm text-[var(--foreground)]/80 shadow-sm dark:bg-black/40 dark:text-white/70">
            Cultura prototype · powered by static receipts. Next steps: wire Postgres + Qdrant for live data and attach ingestion jobs.
          </div>
        </div>
        <SearchPreview />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/70">Bubble map</p>
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">Mock attention clusters</h2>
          </div>
          <p className="text-sm text-[var(--foreground)]/70">
            Hover a node to inspect its snapshot and cross-community travel.
          </p>
        </div>
        <BubbleMap />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/60">
          <Sparkles className="h-4 w-4" /> Rising discourse
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {risingEntities.map((entity) => (
            <article
              key={entity.id}
              className="rounded-3xl border border-[var(--border)]/70 bg-white/70 p-5 text-sm shadow-sm transition hover:border-[var(--foreground)]/40 dark:bg-black/40"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/60 dark:text-white/60">
                    {entity.type}
                  </p>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] dark:text-white">{entity.name}</h3>
                </div>
                <div className="text-right text-xs text-[var(--foreground)]/70">
                  <p className="font-semibold text-lg">
                    {`${entity.metrics.momentum > 0 ? "+" : ""}${Math.round(entity.metrics.momentum * 100)}%`}
                  </p>
                  <p>Momentum</p>
                </div>
              </div>
              <p className="mt-3 text-[var(--foreground)]/80 dark:text-white/70">{entity.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {entity.communities.slice(0, 3).map((community) => (
                  <span key={community} className="rounded-full border border-[var(--border)]/70 px-3 py-1">
                    {community}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

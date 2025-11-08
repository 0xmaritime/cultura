import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import BubbleMap from "@/components/bubble-map";
import SearchPreview from "@/components/search-preview";
import { entities } from "@/data/entities";

const risingEntities = entities
  .filter((entity) => entity.metrics.momentum > 0)
  .sort((a, b) => b.metrics.momentum - a.metrics.momentum)
  .slice(0, 4);

const stats = {
  totalEntities: entities.length,
  surging: entities.filter((entity) => entity.momentumStatus === "surging").length,
  receipts: entities.reduce((sum, entity) => sum + entity.receipts.length, 0),
};

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-10 pb-24 lg:px-8">
      <section className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/60 px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--foreground)]/70">
          Cultura Pulse
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
            Navigate the cultural weather map — see who is amplifying what before it trends.
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-[var(--foreground)]/80">
            Bubble maps, search lens, and receipts all share the same mock dataset for now. Once the pipeline lands,
            this page becomes the realtime briefing on emerging discourse.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
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
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <StatPill label="Entities mocked" value={stats.totalEntities.toString()} />
          <StatPill label="Surging" value={stats.surging.toString()} />
          <StatPill label="Receipts" value={`${stats.receipts}+`} />
        </div>
      </section>

      <BubbleMap />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SearchPreview />
        <div className="rounded-3xl border border-[var(--border)]/70 bg-white/70 p-6 text-sm text-[var(--foreground)]/80 shadow-sm dark:bg-black/40 dark:text-white/70">
          <p className="text-base font-semibold text-[var(--foreground)] dark:text-white">
            What you&apos;re seeing
          </p>
          <ul className="mt-3 space-y-3">
            <li>Bubble map, search preview, and rising board all pull from the same mocked dataset.</li>
            <li>Next milestone: wire `/lens` to a stub API, then stream real signals from Postgres + Qdrant.</li>
            <li>Theme switch (top right) instantly re-skins the dashboard — just like the future contexts.</li>
          </ul>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/60">
            Prototype mode
          </p>
        </div>
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

type StatPillProps = {
  label: string;
  value: string;
};

function StatPill({ label, value }: StatPillProps) {
  return (
    <span className="rounded-full border border-[var(--border)]/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/70">
      {label}: <span className="pl-2 text-[var(--foreground)]">{value}</span>
    </span>
  );
}

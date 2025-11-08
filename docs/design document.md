CULTURA — SYSTEM DESIGN & PRODUCT SPECIFICATION (Final v1.0)

A New Search Experience for Culture, Discourse, and the Memetic Landscape

⸻

1. PURPOSE

This document is a complete, standalone specification for building Cultura — a platform that replaces traditional search with a direct interface to cultural meaning, discourse dynamics, and memetic history with receipts. It specifies product scope, data pipeline, metrics, APIs, storage, UX, and implementation options suitable for a single engineer to begin work and for future expansion.

⸻

2. PRODUCT OVERVIEW

2.1 Mission

Cultura is a discourse and meaning exploration engine. It maps how ideas, trends, aesthetics, and talking points emerge, spread, mutate, and fade across the internet. Users navigate maps instead of links, explore discourse receipts instead of isolated pages, and see relationships and lifecycles instead of static results.

2.2 Core Questions
	•	Where did this idea come from and who amplified it?
	•	How did discourse and sentiment evolve over time?
	•	Which communities adopted, remixed, or attacked it?
	•	What adjacent ideas travel with it (co-mention + semantic proximity)?
	•	What is its current attention and momentum?

2.3 Primary Interaction Modes (MVP)
	1.	Bubble Map — spatial map of entities sized by attention, colored by momentum, linked by adjacency; borders encode controversy.
	2.	Search Lens — meaning-first query returns entity cards with context: summary, signals, receipts, related clusters.

Planned modules (post-MVP):
	•	Discourse Timeline (talking point evolution)
	•	Memetic Genealogy (lineage and forks)
	•	Receipt Explorer (provenance chains and diffusion)

⸻

3. SCOPE (MVP)

3.1 Included
	•	Ingestion from free/scrapable sources (Reddit, X via snscrape, YouTube, RSS/blogs, Wikipedia/Wikidata, Google Trends)
	•	Normalization → Entities, Artifacts, Signals, Co-mentions
	•	Embeddings + keyword index + blended ranking
	•	Metrics: Attention, Momentum, Controversy, Adjacency
	•	Bubble Map (interactive) + Search Lens + Entity Pages
	•	LLM-assisted: artifact summarization, entity extraction/aliasing, cluster labeling
	•	Minimal admin console for aliasing, merges, and backfills

3.2 Excluded (future)
	•	Paid APIs; high-frequency streaming
	•	Predictive attention forecasting
	•	Cross-platform diffusion modeling
	•	Personalization & accounts
	•	Advanced genealogy editor

⸻

4. ARCHITECTURE OVERVIEW

Layers:
	1.	Ingestion (scrapers, API fetchers, feeds)
	2.	Processing (cleaning, NER, entity linking, embeddings, metrics)
	3.	Storage (PostgreSQL + Vector DB; object storage for raw dumps)
	4.	Search & API (query parsing, ranking, aggregation endpoints)
	5.	Frontend (Next.js app with D3 bubble map and Search Lens)

Design principles: modular, observable, testable, locally runnable, low-cost.

⸻

5. DATA SOURCES

5.1 Primary (free / easy)

Source	Purpose	Access
Reddit	discourse threads, memes, receipts	Official API or JSON; Pushshift mirrors where allowed
X (Twitter)	attention pulses, discourse snapshots	snscrape (no auth), rate-aware
YouTube	commentary videos, transcripts	Data API (free key), transcript scrape where permitted
RSS/Blogs	long-form essays and posts	feedparser + HTML scrape
Wikipedia/Wikidata	canonical metadata & aliases	API
Google Trends	attention index	pytrends

5.2 Optional (as available)

Letterboxd (HTML), Tumblr tags, PodcastIndex, TikTok lite scrapers, GitHub discussions, Substack RSS.

Compliance note: Respect robots.txt; store source URLs and timestamps; provide delete-on-request hooks.

⸻

6. DATA MODEL

6.1 Entities

entity {
  id uuid PK,
  name text,
  type enum('film','person','aesthetic','ideology','meme','topic','community'),
  aliases text[],
  description text,
  canonical_url text,
  created_at timestamptz,
  updated_at timestamptz
}

6.2 Artifacts  (raw receipts)

artifact {
  id uuid PK,
  source enum('reddit','twitter','youtube','rss','wiki','trends'),
  url text,
  author text,
  text text,
  meta jsonb,            -- likes, views, subreddit, channel, tags
  published_at timestamptz,
  inserted_at timestamptz,
  sentiment real,        -- [-1,1]
  stance text,           -- optional (pro/anti/neutral/ironic/etc)
  embedding vector,      -- from selected model
  tokens int
}

6.3 Links  (entity–artifact mapping)

entity_artifact {
  entity_id uuid FK -> entity,
  artifact_id uuid FK -> artifact,
  match_type enum('explicit','alias','semantic'),
  confidence real,
  PRIMARY KEY(entity_id, artifact_id)
}

6.4 Signals (daily aggregates)

entity_signals_day {
  entity_id uuid,
  day date,
  mentions int,
  unique_authors int,
  reactions int,
  sentiment_avg real,
  sentiment_std real,
  velocity real,          -- day-over-day delta (or EMA)
  controversy real,       -- variance-scaled index
  PRIMARY KEY(entity_id, day)
}

6.5 Co-mentions & Adjacency

entity_comentions_day {
  entity_a uuid,
  entity_b uuid,
  day date,
  count int,
  PRIMARY KEY(entity_a, entity_b, day)
}

entity_adjacency {
  entity_a uuid,
  entity_b uuid,
  pmi real,
  embed_sim real,
  score real,             -- normalized blend
  updated_at timestamptz,
  PRIMARY KEY(entity_a, entity_b)
}


⸻

7. FEATURE ENGINEERING

7.1 Core Metrics
	•	Attention = w1mentions + w2reactions + w3*author_diversity (normalized)
	•	Momentum = short-window EMA vs long-window baseline (e.g., 3d vs 21d) or z-score of recent attention
	•	Controversy = normalized sentiment_std × polarity_balance
	•	Adjacency = α*PMI + (1-α)*embedding_similarity (cosine)

7.2 NLP / LLM Features
	•	Entity extraction (NER + rule-based + LLM disambiguation)
	•	Alias generation and merge suggestions
	•	Cluster labeling (e.g., “diet discourse: seed oils / carnivore / IF”)
	•	Representative snippet selection (top-K diverse)
	•	Stance detection (optional)

⸻

8. SEARCH ENGINE

8.1 Indexing
	•	Keyword: Postgres FTS or Tantivy/Meilisearch
	•	Vectors: Qdrant / Weaviate / FAISS
	•	Joins: entity ↔ signals ↔ adjacency ↔ artifacts

8.2 Ranking (blended)

final_score =
  0.40 * bm25_score +
  0.30 * cosine_sim(embedding(query), entity_centroid) +
  0.20 * attention_norm +
  0.10 * recency_boost

Tie-breakers: momentum > controversy > name match.

8.3 Search Output (Search Lens)
	•	Entity card: title, type, short LLM summary
	•	Sparkline: recent attention
	•	Metrics: attention, momentum, controversy
	•	Receipts: top artifacts (quotes/snippets with links)
	•	Related: adjacent entities (reason: co-mention / semantic)
	•	Clusters: quick labels from LLM

⸻

9. VISUALIZATION (BUBBLE MAP)

9.1 Encoding
	•	Node size = attention (sqrt scale)
	•	Node color = momentum (pastel → saturated)
	•	Border = controversy (thin → thick)
	•	Edge opacity = adjacency strength

9.2 Implementation
	•	Option A (recommended): D3 force-directed graph in React (d3-force)
	•	Option B: react-force-graph (WebGL)
	•	Option C: Cytoscape.js

9.3 Interactions
	•	Zoom/pan/drag; filter by type/time; lasso select
	•	Click node → open Search Lens for entity
	•	Hover → tooltip (metrics, mini sparkline)
	•	Cluster grouping by community detection (Louvain/Leiden precomputed)

⸻

10. TECH STACK OPTIONS

10.1 Backend
	•	Option A (recommended): Python FastAPI, uvicorn, pydantic
	•	Option B: NestJS (TypeScript)
	•	Option C: Go (Gin/Fiber)

10.2 Storage
	•	Relational: PostgreSQL (JSONB, FTS, window functions)
	•	Vector: Qdrant (Docker) or Weaviate; fallback FAISS for local dev
	•	Object storage: local /data or S3-compatible (MinIO) for raw dumps

10.3 Data Processing
	•	Python (pandas, polars), spaCy, NLTK, scikit-learn
	•	Embeddings: sentence-transformers (e.g., all-MiniLM-L6-v2) or BGE-small
	•	Orchestration: cron + Makefile initially; optional Prefect for flows

10.4 Frontend
	•	Next.js (App Router), React, TypeScript
	•	TailwindCSS + shadcn/ui
	•	d3.js / react-force-graph

10.5 LLM Integration
	•	Open-source (local/Ollama): Mistral 7B, Llama 3 8B, Qwen 7B
	•	Hosted APIs: GPT-4o-mini, Claude Haiku/Sonnet, Mistral Small
	•	Embeddings: BGE-small / all-MiniLM; optional OpenAI text-embedding-3-small

⸻

11. PIPELINES & ORCHESTRATION

11.1 Ingestion Jobs
	•	reddit_ingest: pull posts/comments by topic keywords & entity aliases → dedupe → store artifacts
	•	twitter_ingest: snscrape by keywords/aliases → store artifacts
	•	youtube_ingest: search channels/videos → fetch stats & transcripts → store artifacts
	•	rss_ingest: parse feeds → extract text → store artifacts
	•	wiki_ingest: pull canonical metadata & aliases → seed entities
	•	trends_ingest: store normalized attention indices

11.2 Processing Jobs
	•	entity_linking: NER + alias matching + semantic link to entities
	•	embeddings_job: compute embeddings for artifacts + entity centroids
	•	signals_aggregate: compute daily aggregates & EMA metrics
	•	adjacency_build: co-mention counts + PMI + cosine sim → score
	•	cluster_labeling: LLM label for top clusters

Scheduling: simple cron; idempotent jobs; checkpointing via watermark tables.

⸻

12. API SPECIFICATION (MVP)

Base path: /api/v1

12.1 Search
	•	GET /search?q=...&limit=20
	•	Returns: [ { entity_id, name, type, score, attention, momentum, controversy, snippet, related_ids[] } ]

12.2 Entities
	•	GET /entities/{id}
	•	Returns: metadata, metrics (last N days), top artifacts, adjacency list
	•	GET /entities/{id}/artifacts?limit=50
	•	GET /entities/{id}/signals?window=30d

12.3 Graph
	•	GET /graph?type=all&limit=500 → nodes, edges for bubble map
	•	GET /graph/cluster/{cluster_id}

12.4 Admin (protected)
	•	POST /admin/alias add alias
	•	POST /admin/merge merge entities
	•	POST /admin/reindex trigger backfill/refresh

Auth: simple token auth via Authorization: Bearer <token> (env-configured).

⸻

13. UX / UI SPEC

13.1 Design Language
	•	Baseline: calm & minimalist (black/white/graphite)
	•	Dashboards: sharp, terminal-like
	•	Accents: low-opacity pastels; subtle motion
	•	Typography: modern sans + monospace for data

13.2 Key Screens
	•	Home: global bubble map + search input
	•	Search Results (Lens): entity cards with metrics, receipts, adjacency
	•	Entity Page: timeline sparkline, summary, receipts, related clusters
	•	Admin: alias manager, entity merge, ETL status

13.3 Interactions
	•	Typeahead suggestions (entity names + nearby concepts)
	•	Keyboard nav (/, Enter, ↑/↓, Esc)
	•	Copy-to-clipboard for receipts and citations
	•	Deep linkable states (/e/{slug}, /search?q=...)

⸻

14. ANALYTICS & EVALUATION

14.1 System Metrics
	•	Ingestion coverage by source
	•	Deduplication rate, error rates per job
	•	Latency: ingest → visible
	•	Index sizes & embedding latency

14.2 Search Quality Signals
	•	CTR on entity results
	•	Save/share/copy actions on receipts
	•	Time-on-entity; hop depth between entities
	•	Qualitative eval set: hand-labeled queries & expected adjacencies

⸻

15. SECURITY, PRIVACY, ETHICS
	•	Respect robots.txt; throttle scrapers
	•	Store source URLs and timestamps; link out for context
	•	Honor takedowns: soft-delete artifacts by URL
	•	PII avoidance: do not collect sensitive personal data; redact usernames on request
	•	Model transparency: show why-related edges (PMI vs semantic)

⸻

16. DEPLOYMENT & DEVOPS
	•	Runtime: Docker compose (api, db, vector, frontend, worker)
	•	Local dev: make up, .env for keys, seed scripts
	•	Migrations: Alembic (if Python) or Prisma (if TS)
	•	Jobs: cron in worker container or Prefect server
	•	Observability: basic logs + health endpoints; optional Prometheus/Grafana

⸻

17. TEST PLAN
	•	Unit: parsing, normalization, scoring, ranking
	•	Integration: ingestion → processing → API roundtrip
	•	Load: vector queries at N qps; graph fetch sizes
	•	UX: keyboard flow, map interactions, mobile-friendly viewport (optional)

⸻

18. PORTFOLIO VALUE & DEMONSTRATIONS
	•	Systems Design: layered architecture, idempotent pipelines
	•	Data Engineering: scrapers, ETL, schema, indexing, embeddings
	•	Analytics: attention/momentum/controversy, adjacency, clustering
	•	Product: new search paradigm; map + lens coherence
	•	Business: flexible to verticals (culture, health/diet discourse, finance memes)

Demo narratives:
	•	“Seed oils vs. Mediterranean diet” discourse over time with receipts
	•	“Anora” film: attention spikes, community crossovers, lineage of references
	•	“AI doom vs. e/acc” clusters and their adjacency dynamics

⸻

19. IMPLEMENTATION CHECKLIST (MVP)
	•	Repo scaffold (frontend, api, worker)
	•	Postgres + Qdrant containers; schema migration
	•	Seed entities from Wikidata + manual list
	•	Reddit/Twitter/YT/RSS ingestors; dedupe + store artifacts
	•	Embedding pipeline + entity centroids
	•	Signals aggregates + metrics (attention/momentum/controversy)
	•	Adjacency build (PMI + cosine)
	•	Search API (blended rank)
	•	Bubble Map endpoint & UI
	•	Search Lens UI + Entity page
	•	LLM summaries & cluster labels
	•	Admin alias/merge tools

⸻

20. NAMING & TAXONOMY
	•	Entity Types: film, person, aesthetic, ideology, meme, topic, community
	•	Sources: reddit, twitter, youtube, rss, wiki, trends
	•	Metrics: attention, momentum, controversy, adjacency

⸻

21. LICENSE & OPEN DATA NOTES
	•	Codebase: MIT or Apache-2.0
	•	Data: store only derived features + link to originals; comply with source terms

⸻

22. FUTURE EXTENSIONS
	•	Cultural weather (nowcasting heatmaps)
	•	Genealogy editor (manual lineage curation)
	•	Diffusion paths (who-influenced-whom)
	•	Forecasting attention & crossovers
	•	Personal workspaces and alerts

⸻

Appendix A — Example SQL & Endpoints

Attention (7d EMA vs 21d EMA):

SELECT entity_id,
       day,
       ema_7,
       ema_21,
       (ema_7 - ema_21) / NULLIF(ema_21,0) AS momentum
FROM computed_signals;

Adjacency score:

UPDATE entity_adjacency a
SET score = 0.5*a.pmi + 0.5*a.embed_sim;

Search result payload (example):

{
  "entity_id": "...",
  "name": "Seed oils",
  "type": "topic",
  "score": 0.87,
  "metrics": {"attention": 0.76, "momentum": 0.32, "controversy": 0.61},
  "sparkline": [12,19,33,28,44,51,49],
  "receipts": [{"snippet": "...", "url": "...", "source": "reddit", "date": "2025-06-12"}],
  "related": [{"entity_id":"...","name":"Carnivore diet"}]
}


⸻

End of Document

# Cultura — Search Lens Prototype

This repository hosts the very first slice of Cultura: a meaning-first search lens for exploring cultural entities, momentum, and discourse receipts. The current build focuses on UX polish and interaction loops so we can validate the look + feel before wiring live data.

## What ships in this cut
- **Search Lens screen** (`/lens`) with query input, keyboard navigation, and quick filter chips.
- **Entity cards** that surface attention/momentum/controversy metrics, adjacency tags, sparklines, and sample receipts.
- **Entity insight panel** (desktop) plus a mobile drawer that expands receipts, communities, and related clusters.
- **Static mock dataset** (`src/data/entities.ts`) mirroring the structures defined in the design spec so we can swap in a real API later without touching the UI.
- **Search-focused homepage** with quick query preview, responsive bubble map, and rising discourse board (all mocked).
- **Bubble map module** centered on the landing page with responsive sizing, filter counts, entity-type legend, and a richer spotlight panel (sparklines + receipts).
- **Light/dark theme toggle** shared by the header navigation for Home ↔ Lens.

## Local development
```bash
npm install    # already run once, but safe to repeat
npm run dev    # start Next.js on http://localhost:3000
npm run lint   # lint with ESLint / Next.js rules
npm run build  # production build check (Turbopack)
```
Tailwind CSS v4 is imported globally via `src/app/globals.css`. Components live in `src/components/search-lens` and use the `@/*` import alias configured in `tsconfig.json`.

## Project structure snapshot
```
src/
  app/
    layout.tsx      # Root layout + nav + theme provider
    page.tsx        # Search-focused landing page + bubble map
    lens/page.tsx   # Full Search Lens experience
    globals.css     # Tailwind + theme tokens
  components/
    bubble-map.tsx      # Responsive, filterable bubble visualization
    search-preview.tsx  # Homepage search teaser
    search-lens/        # Cards, drawer, sparkline, source metadata
    site-header.tsx & theme-toggle.tsx
  data/
    entities.ts         # Mock entities/receipts dataset
    bubble-map.ts       # Mock adjacency weights for the map
```
Additional product context lives in `docs/design document.md` (the original v1 spec).

## Deploying to Vercel
1. Push main to GitHub (this repo: https://github.com/0xmaritime/cultura).
2. In Vercel, import the repo and keep the defaults (`npm install`, `npm run build`, `next start`).
3. Set any future API keys with the Vercel dashboard once we add backend hookups.

## Next steps after deployment
1. Hook the UI to a stub API route so entities come from the backend pipeline instead of the local mock file.
2. Layer in real sparkline/metrics data once the ingestion jobs land and store them in Postgres/vector store.
3. Connect the bubble map + homepage previews to that API and expose historical interactions (timeline, receipts drill-in).

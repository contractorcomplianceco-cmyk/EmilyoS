# Regulatory Communications Command Center

An internal operations app for a Director of Compliance & Regulatory Communications to track regulatory matters, agency communications, deficiencies, escalations, follow-ups, and institutional knowledge — all persisted in the browser.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- App lives in `artifacts/command-center` (React + Vite, slug/route `command-center`).
- Data layer (source of truth): `src/lib/` — `types.ts` (entity types + `Database`/`Collection`), `store.ts` (localStorage persistence), `seed.ts` (demo data), `fields.ts` (form field configs), `format.ts` (date/badge helpers).
- Shared CRUD building blocks (all **named** exports): `src/components/shared/` — `RecordFormDialog`, `DetailSheet`, `ConfirmDelete`, `Toolbar`, `PageHeader`, `EmptyState`, `Badges`.
- Layout/shell: `src/components/layout/AppLayout.tsx` (sidebar + header). Routes: `src/App.tsx` (wouter). Theme tokens: `src/index.css`.
- `Agencies.tsx` is the canonical reference for the page CRUD pattern.

## Architecture decisions

- **No backend / no API for app data.** Everything persists in the browser via `useDatabase()` / `saveRecord(collection, record)` / `deleteRecord(collection, id)` / `resetData()` (localStorage, `useSyncExternalStore`). Do not wire React Query hooks for these entities.
- **Config-driven forms.** Add/edit forms are generated from `fields.ts` definitions rendered by `RecordFormDialog` (`open`/`onOpenChange`/`title`/`fields`/`initial`/`onSubmit`). Adding a field = edit `fields.ts`, not the dialog.
- **Dashboard panels are data-derived**, not hardcoded — KPI counts, compliance ring, Upcoming Calendar, and Alerts & Risk Panel all compute from the live store so they stay truthful after edits.
- **Brand:** CCA EmilyOS — navy/indigo glassmorphism with electric-purple accents (palette in `index.css`). Strictly no emojis in the UI.

## Product

CCA EmilyOS is an internal compliance command center for Emily Jones (Director of Compliance & Regulatory Communications at Contractor Compliance Authority). Capabilities: a KPI + agency-engagement + compliance-ring dashboard with priorities/calendar/alerts rail; full CRUD over agencies, regulatory matters, communications, deficiencies, escalations, tasks & approvals, alerts (change monitor), knowledge entries, and SOPs/policies; plus Reports/Analytics, Intelligence insights, Team Directory, and Settings (with demo-data reset). Role boundary is surfaced throughout: Emily tracks communication, follow-up, documentation, and routing — not legal/compliance/tax advice or final decisions.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Never write explicit JSX generic type args** like `<RecordFormDialog<Agency>` — the cartographer babel plugin can't parse them and Vite dev breaks (tsc still passes). Let generics infer; cast at the call site.
- Shared components in `src/components/shared/` are **named** exports — import with `{ }`, not default.
- Run `pnpm --filter @workspace/command-center run typecheck` to verify; `build` needs workflow-provided env vars and can fail from bash.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

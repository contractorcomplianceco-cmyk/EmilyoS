---
name: Executive design pattern (command-center)
description: The "executive upgrade" visual system used across all command-center pages — gradient heroes, gradient KPI cards, glassmorphism tables, accent bars.
---

The command-center app uses a consistent "executive" visual system. When restyling or adding a page, match this so the app stays cohesive.

**Why:** The user asked for a bold, colorful, non-flat, dynamic look applied app-wide. Dashboard.tsx and Agencies.tsx are the canonical references; every other page was upgraded to match.

**How to apply:**
- **Gradient hero header** (replaces the plain `PageHeader`): a rounded-2xl banner `bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800` with white text, a frosted icon chip (`bg-white/10`), title + description, and a white/high-contrast action button on the right. A blurred glow circle adds depth.
- **Gradient KPI stat cards** (derived live from the store, never hardcoded): `relative overflow-hidden rounded-2xl border-0 p-5 text-white shadow-lg bg-gradient-to-br {gradient} hover:-translate-y-1 transition`; big number top-left, frosted icon chip top-right, label full-width below; blurred glow `absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl`. Rotating gradients: indigo→violet, sky→blue, amber→orange, emerald→teal.
- **Section accent bar** on headers: `h-5 w-1.5 rounded-full bg-gradient-to-b from-{x} to-{y}` before the heading text.
- **Glassmorphism content card**: white/frosted surface, rounded-2xl, soft shadow, accent-bar header with a filtered-count badge.
- The global top header (AppLayout.tsx) is itself a navy→indigo→violet gradient band that flows into the mission strip.

**Hard constraints (see replit.md + cartographer-jsx-generics.md):** frontend-only/localStorage (no API hooks/React Query — use `useDatabase()`, `saveRecord`, `deleteRecord`), config-driven forms via `fields.ts` + `RecordFormDialog`, shared components are NAMED exports, NEVER write explicit JSX generic args, NO emojis, all new sections must compute from the live store (truthful, not faked). Verify with `pnpm --filter @workspace/command-center run typecheck`.

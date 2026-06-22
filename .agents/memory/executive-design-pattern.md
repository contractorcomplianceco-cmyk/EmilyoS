---
name: Coastal design pattern (command-center)
description: The "Soft Coastal Compliance Studio" visual system used across all command-center pages — light gradient heroes, white KPI cards, accent bars, glassmorphism tables.
---

The command-center app (brand: EmilyOS Regulatory Studio) uses a consistent "Soft Coastal Compliance Studio" visual system. When restyling or adding a page, match this so the app stays cohesive.

**Why:** The user approved a soft-coastal mockup — baby-blue primary, blush-pink accents, white/pearl/soft-gray surfaces; girly-but-professional. Replaced the prior dark navy/indigo/violet "executive" theme entirely. Dashboard.tsx and Agencies.tsx are the canonical references.

**How to apply:**
- **Light gradient hero header** (replaces plain `PageHeader`): rounded-2xl banner `bg-gradient-to-br from-white via-primary/5 to-accent/5 ... border border-white shadow-sm`; heading `text-slate-800`, subtitle `text-slate-500`; white icon chip `bg-white ring-1 ring-slate-100 shadow-sm text-primary`; primary action button `bg-primary text-white hover:bg-primary/90`. Blurred glow circles `bg-primary/10` / `bg-accent/10`.
- **White KPI stat cards** (derived live from the store, never hardcoded): `border border-slate-100 p-5 text-slate-700 shadow-sm bg-white hover:-translate-y-1 hover:shadow-md`; big number `text-slate-800` top-left, icon chip `bg-primary/10 text-primary` top-right, uppercase label below.
- **Section accent bar** on headers: `h-5 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent` before heading text.
- **Glassmorphism content card**: white/frosted surface, rounded-2xl, soft shadow, accent-bar header with filtered-count badge.
- **Semantic status colors:** keep soft amber chips (`bg-amber-50 text-amber-700`) for warning/caution/medium; red/rose for critical/overdue; emerald/teal for done. Chart "High" risk uses rose `#fb7185` (not orange).

**Hard color guardrails:** baby-blue primary + blush-pink accent + white/pearl/soft-gray only. NO dark-navy/indigo/violet/purple/fuchsia, NO orange/gold/beige/tan, NO purple SaaS gradients. Cute accents only via lucide icons (Sparkles/Flower2/Cherry/Gem/Shell/Heart) — never literal emoji.

**Hard constraints (see replit.md + cartographer-jsx-generics.md):** frontend-only/localStorage (no API hooks/React Query — use `useDatabase()`, `saveRecord`, `deleteRecord`), config-driven forms via `fields.ts` + `RecordFormDialog`, shared components are NAMED exports, NEVER write explicit JSX generic args, NO emojis, all new sections must compute from the live store. Verify with `pnpm --filter @workspace/command-center run typecheck`.

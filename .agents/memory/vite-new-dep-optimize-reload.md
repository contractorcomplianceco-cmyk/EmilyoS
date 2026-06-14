---
name: Vite new-dependency re-optimize transient error
description: Adding a new client dependency can throw a one-off "Invalid hook call / more than one copy of React" runtime error until the workflow is restarted.
---

When a client-side artifact (e.g. command-center, React + Vite) imports a dependency
that Vite hasn't pre-bundled yet (first use of `framer-motion`, etc.), the dev server
logs `✨ new dependencies optimized: <dep>` then `optimized dependencies changed. reloading`
and during that reload the browser can throw a transient runtime error:
`Cannot read properties of null (reading 'useContext')` / `Invalid hook call ... more than
one copy of React`.

**Why:** It is the mid-flight dep-optimization reload, not a real duplicate-React bug —
`dedupe: ["react","react-dom"]` is already set in vite.config. The error fires once during
the reload window and resolves itself.

**How to apply:** Don't chase it as a duplicate-React problem. After adding a new client
dependency, restart the artifact's workflow (`restart_workflow <slug>`) to clear the
optimized-deps state, then re-screenshot to confirm it's clean before concluding anything
is broken.

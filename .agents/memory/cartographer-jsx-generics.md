---
name: Cartographer breaks JSX generic type args
description: Why explicit JSX generic type arguments fail to parse in this repo's Vite dev setup
---

The Replit cartographer Vite/babel plugin injects `data-replit-metadata` / `data-component-name`
attributes into JSX opening tags. It cannot parse explicit JSX generic type arguments such as
`<MyComponent<SomeType> ... >` — babel throws "Unexpected token" at the `<SomeType>`, even though
the syntax is valid TSX and `tsc` typechecks it fine.

**Why:** the plugin rewrites the opening element before babel finishes, and the injected attributes
collide with the generic angle brackets.

**How to apply:** never write `<Component<T>` in TSX in this repo. Drop the explicit type arg and
let `T` infer from props (e.g. from `initial`/`onSubmit`). Cast at the call site if needed. Typecheck
passing is NOT sufficient to catch this — it only surfaces at Vite dev/transform time.

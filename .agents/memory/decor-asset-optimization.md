---
name: Decor asset optimization
description: How to keep generated decorative PNGs in command-center small; tooling and pitfalls.
---

AI-generated decorative PNGs (cherries, perfume, shells, beach scenes, etc.) come out ~0.5–1.3 MB each at 1024px. When they live in the global layout / app-wide backdrop they load on every route, so compress before shipping.

**Rule:** downscale to actual display size and recompress decor PNGs after generating them.

**Why:** unoptimized, the `public/decor/` folder hit ~8.6 MB and the architect flagged it as a real first-render/page-weight cost. Optimizing brought it to ~1.8 MB with no visible quality loss.

**How to apply:**
- `sharp` is NOT installed; use ImageMagick (`magick`), which IS available.
- Small charms displayed ≤120px → resize to ~400px. Sidebar/cluster art → ~520–640px. Wide banners → ~1000px. Avatars → ~200px. Keep alpha (PNG) for `removeBackground` cutouts.
- Use the `>` flag so you never upscale: `magick in.png -resize 1000x\> -strip -define png:compression-level=9 out.png`.
- **Pitfall:** resizing a PNG to a width LARGER than its source upscales it and the file gets BIGGER (a 16:9 banner ballooned from 1.25 MB to 1.9 MB when resized to 1400px from a ~1024px source). Always cap at/below the source width.
- The PNG `-quality` flag is not JPEG-like; rely on `-resize`, `-strip`, and `png:compression-level=9` for PNGs.
- Add `loading="lazy"` + `decoding="async"` to decorative `<img>` tags, especially app-wide backdrop ones.

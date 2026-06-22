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

## Extracting individual stickers from a sticker SHEET

When the user hands over one combined sticker-sheet image and asks to "sprinkle them around," cut out individual stickers rather than using the whole sheet:
- Crop regions with `magick SRC -crop WxH+X+Y +repage out.png` (get sheet dims via `magick identify` first; tighten boxes to avoid neighbor fragments + any UI watermark like a Google-Lens icon).
- To make the white background transparent, flood-fill **from the corners** so interior whites survive: `-alpha set -bordercolor white -border 2 -fuzz 16% -fill none -draw "alpha 0,0 floodfill" -shave 2x2 -trim +repage` (IM7 uses `alpha ... floodfill`, not `matte`).
- **Pitfall:** flood-fill destroys subjects that are themselves white/cream/light (a white candle body, pale gift box, clear glass) because they read as background — they come out mostly gone. For those, use the `remove_image_background_tool` on the raw color crop instead; it isolates the subject and keeps light areas.
- `montage` fails in this env ("unable to read font"); preview a contact sheet with `+append` instead (flatten each onto an opaque bg first, since `-flatten` on a multi-image list composites them all into one).
- Sprinkle as an `aria-hidden pointer-events-none z-0` absolute backdrop layer; they read clearly on sparse list pages but are mostly hidden behind cards on dense pages like the dashboard.

# Build Prompt — "Welcome / Onboarding" Section

A reusable, parameterized prompt for recreating the "Welcome to {{APP_NAME}}" onboarding
section (narrated tour + no-audio guided tour + downloadable PDF user guide) in any app.
Fill in the `{{PLACEHOLDERS}}` and paste it into your coding agent.

---

Build a **"Welcome to {{APP_NAME}}"** onboarding page that teaches a new user the product
three ways: a narrated animated tour, a no-audio self-paced guided tour, and a downloadable
PDF user guide. Add it as the top item in the main navigation (above the dashboard/home link).

**Context for you to use:**

- App name: `{{APP_NAME}}`
- Primary user & role: `{{USER_PERSONA}}` (e.g. "Director of Compliance")
- Brand/accent color: `{{ACCENT_COLOR}}` (use it for buttons, active states, progress fill,
  and the start-overlay glow)
- The 5–8 areas of the app to feature, in order, each with a short title and a one-sentence
  description: `{{LIST_OF_SECTIONS}}`

**1. Page layout (top to bottom):**

- **Hero banner**: gradient background using the brand palette, an icon chip, an `<h2>`
  "Welcome to {{APP_NAME}}", a one-line subtitle explaining the three ways to get oriented,
  and a prominent **"User Guide (PDF)"** download button on the right.
- **Mode toggle**: a pill-style segmented control with two options — **"Narrated Video"** and
  **"Guided Tour"** — plus a small helper caption that changes per mode. Use `aria-pressed` on
  the buttons.
- **Player card**: a 16:9 stage that renders one animated "scene" per featured section.
- **Chapter/Step list**: a responsive grid of all sections; clicking one jumps the player to
  it. Label them "Chapter N" in video mode and "Step N" in guided mode.
- **User-guide card**: a footer card describing the written guide with a "Download PDF" button.

**2. Animated scenes:** Create one motion scene per featured section (use a motion library,
e.g. Framer Motion). Each scene is keyed so it re-mounts and replays its animation when
revisited. Keep them on-brand, text-light, and no emojis.

**3. Narrated Video mode:**

- Generate short TTS narration (one audio clip per section) plus a soft looping instrumental
  music bed. Use an **{{ACCENT_VOICE: e.g. American}} professional narrator** voice. Store
  audio in the app's public/static folder.
- Orchestrate playback: a start/replay overlay, play/pause, mute, and a **segmented progress
  bar** (one segment per section) that fills with the current clip's real playback time.
  Auto-advance to the next scene when a clip ends; show a "complete" state at the end.
- Be strict about the audio lifecycle: a single helper must stop/cleanup all audio (clear
  handlers, pause, null refs) on unmount, on errors, and **whenever the user switches modes**,
  so audio never leaks. Guard interrupted `play()` promises. Show a toast if playback fails.

**4. Guided Tour mode (no audio):**

- Reuse the exact same scenes, but never play sound. Switching into this mode must call the
  stop-all-audio helper first.
- Replace the audio controls with **Back / Next** stepping (and **Restart** on the last step).
  Re-trigger each scene's animation on every step. Progress segments fill by step index.

**5. PDF user guide:**

- Generate a real multi-page PDF (e.g. with `pdfkit`) containing a branded cover page and one
  section per featured area, written as a clear written reference, with page-number footers.
  Save it into the public/static folder and link the download buttons to it (respect the app's
  base path).
- Keep the generator as a runnable script so the guide can be regenerated when content changes.
  Don't add the PDF library to the shipped app's runtime dependencies — keep it in a
  build/scripts package.

**Quality bar:** typecheck must pass; verify both modes render; confirm no audio plays in
Guided mode and no audio leaks when toggling. Match the existing app's design system and
navigation patterns.

---

## Implementation notes (from the reference build)

- The narration script was 7 short sentences (one per section) at TTS settings
  `stability 0.5, similarity_boost 0.75, speed 1.0`; the music bed was a ~70s calm corporate
  ambient instrumental loop.
- A narrator voice with an explicit `accent` label (e.g. "american") keeps the tone
  consistent; pick one whose use case is `narrative_story`.
- For Vite apps, build asset URLs with `import.meta.env.BASE_URL` so the audio and PDF resolve
  correctly under the app's base path.
- Re-trigger scene animations by bumping a `cycle` counter and including it in the scene's
  React `key` (e.g. `` key={`${mode}-${scene}-${cycle}`} ``).

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

JWServices is a single-page static marketing site (Dutch/NL content) for a freelance Business & Functional Analyst / Product Owner. There is no build system, package manager, or framework — just three hand-written files:

- `index.html` — all page markup and content (hero, services, experience, about, contact, modal)
- `style.css` — all styling, including CSS custom properties (`:root`) for colors, fonts, and a mobile breakpoint media query at the bottom
- `script.js` — all behavior, split into independent, unguarded top-level blocks (see Architecture below)

## Running locally

There's no dev server dependency to install — a `.claude/launch.json` config (`jwservices`) starts a plain Python `http.server` on port 5500 (auto-falls back to another port if 5500 is taken):

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`. There is no build, lint, or test step — changes to the three files are reflected on page reload.

## Architecture

`script.js` runs top-to-bottom as separate, sequential features with no module system or bundler:

1. **Mobile nav toggle** — `.menu-toggle` / `.site-nav`, toggles `aria-expanded` and `.is-open`.
2. **Footer year** — sets `#year` text content.
3. **Hero canvas animation** (`#hero-network`, guarded by `if (heroCanvas)`) — a particle/network animation on `<canvas>`. Key details:
   - `points` array holds two kinds of entities distinguished by `type`: `'orbit'` (exactly 2 fixed points that circle at constant radius/speed, one clockwise one counter-clockwise) and `'random'` (the remainder of `POINT_COUNT`, drifting with periodic direction changes and bouncing off the circular boundary at `maxRadius`).
   - `createPoints()` builds the `orbitPoints` + `randomPoints` arrays and concatenates them into `points`.
   - `step()` runs the `requestAnimationFrame` loop: moves points (orbit points via angle increment, random points via velocity + boundary reflection), draws connecting lines between nearby points, then draws each point (using `p.fixedRadius` directly when set — currently both orbit points — otherwise deriving radius from `p.maroon`/`p.size`).
   - Respects `prefers-reduced-motion` by not scheduling further animation frames.
   - Re-runs `createPoints()`/`resize()` on window resize.
4. **"Plan een kennismaking" modal** (guarded by `if (modalOverlay && modalOpenBtn)`) — a contact popup opened via `[data-open-modal]`, closed via the close button, overlay click, or Escape. On submit, it POSTs the form via `fetch` to Formspree (`form action="https://formspree.io/f/meajewkw"`) with a silently-swallowed error (no visible confirmation/error UI by design), then immediately resets the form and re-hides the modal.

When editing `script.js`, preserve this pattern: each feature block guards itself independently (`if (elementExists) { ... }`) rather than relying on a shared init/DOMContentLoaded wrapper, and blocks are appended sequentially rather than reorganized into modules.

Note the `<script src="script.js">` tag in `index.html` is placed **after** the modal markup, right before `</body>` — this ordering matters because `script.js` queries the modal elements (`#kennismaking-modal`, `[data-open-modal]`, `.modal-close`, `#kennismaking-form`) synchronously at load time with no deferred/DOMContentLoaded wrapper. Moving the script tag before the modal markup will silently break the modal (elements won't exist yet when queried).

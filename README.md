# 🌸 Amp's little gallery

A sakura-themed portfolio for **Gorrawit Puttabarramee**, matching the pink palette,
rounded typography, and original anime companion on [my GitHub profile](https://github.com/Ampsoria).

[Explore the live gallery](https://ampsoria.github.io/Ampsoria_ActivitiesandCertificates_ArchiveWebpage/)

## The collection

All 18 original images and their descriptions are preserved: 4 competition/award
entries, 5 learning certificates, and 9 activity entries. Some competition entries
also contain certificates; categories count gallery entries, not document types.

## Features

- Spotlight for TESA Top Gun Rally 2025 and a responsive photo collection.
- Search across titles, hosts, and stories; category filters and alphabetical sorting.
- Heart/save memories in this browser, with a dedicated Saved filter.
- Keyboard-accessible image dialog with previous/next, zoom, original image links,
  and copyable links to individual memories.
- Light mode by default, with a saved light/dark choice taking precedence; gentle
  sakura petals and a switch to pause decorative motion.
- A tiny anime companion with rotating encouraging notes and a reading-progress bar.
- System reduced-motion support, labeled controls, visible keyboard focus, a skip
  link, and usable images/stories even when JavaScript is disabled.

## Run locally

No dependencies or build step. From this directory:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766`. GitHub Pages serves the same static files.

## Maintain

- `index.html`: original collection content, featured story, and semantic structure.
- `styles.css`: responsive layout, theme colors, and motion.
- `app.js`: progressive enhancements; no backend, analytics, or third-party scripts.
- `image/`: original photos and certificates, unchanged.
- `assets/`: local Nunito variable font (SIL OFL; see `assets/OFL.txt`), sakura icon,
  and the original AI-generated male mascot reused from the profile repository.
- `Demo/`: screenshots of the previous design, kept as historical assets.

To add an entry, duplicate a `.memory-card`, give it a unique `memory-*` ID, and
set `data-category` to `competitions`, `certificates`, or `activities`. Update the
static count labels for the no-JavaScript fallback; JavaScript recalculates them
from the actual cards. Keep descriptions in `.story p` and hosts in `.host`.

Saved items and appearance preferences use local storage only. They do not sync
between devices; if storage is unavailable, saving works for the current visit.
The image viewer supports `←`, `→`, and `Esc`; `/` focuses search outside the viewer.
Share links use `#memory-...` and reopen that entry on load.

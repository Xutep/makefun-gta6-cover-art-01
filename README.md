# makefun-gta6-cover-art-01

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?ref=ws5xj46w)
[![rank](https://make.fun/badge/gta6-cover-art-01/Xutep/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01?ref=ws5xj46w)
[![reward](https://make.fun/badge/gta6-cover-art-01/Xutep/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?ref=ws5xj46w)

**Vice Nights** — a GTA-style cover art maker. Upload your own photos (or try the
two free sample photos), crop and position each one inside a multi-panel poster
layout, write a bold caption, pick a Vice sunset, neon nights or noir colour
grade, and export the cover as a PNG in the common post sizes: 1080 × 1080,
1080 × 1350 and 1920 × 1080.

Everything runs offline in the browser: the app is plain static files under
`app/`, vanilla JavaScript with no libraries and no network requests, and your
photos are read on your own machine and never uploaded. All artwork, lettering
and gradients are original — no Rockstar logo, artwork or font is used.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

1. Upload up to 4 photos (or load a sample).
2. Pick a layout — hero + two below, three vertical strips, or a four-panel grid.
3. Choose a panel, assign it a photo, and tune its zoom and position.
4. Edit the caption and sub-caption, pick a colour grade.
5. Choose a post size and hit **Export PNG**.

## How it is built

- `app/index.html` — the editor: photo tray, panel controls, caption and grade
  pickers, and the live preview canvas.
- `app/src/cover.js` — the cover engine: panel layouts, cover-fit photo drawing
  with zoom/pan, colour grades, sun emblem and bold poster lettering.
- `app/src/main.js` — wires the editor controls, uploads and PNG export.
- `app/src/shots.js` — fixed scenes for screenshots (`?shot=editor`, `?shot=cover`).
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output`
  and writes `/output/dossier.json` (Node 22, standard library only).

Entered on make.fun

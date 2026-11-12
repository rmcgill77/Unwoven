# Unwoven: A Tale of Talvora

A mobile-first, landscape pixel RPG in the spirit of classic Zelda, with Final Fantasy-style ATB battles and a magic system built from Old Tongue words (Root + Suffix, e.g. `Pyr-or`, a thrown flame). You play Corin or Elowyn Quill-mark, the orphaned Clerk's apprentice of Oakhaven, in the realm of Etharis on the continent of Talvora.

**This repository holds Act One**, released as a test build (`0.1.0-act1`).

The whole game is one React component, built from the files in `src/parts/` into a single HTML page plus a React bundle and the music. There is no server: progress saves to the browser's localStorage.

## Quick start

```bash
npm install          # react 18 + esbuild
npm run build        # -> dist/ (release), build/test.html (tests), build/artifact.html (claude.ai)
npm run serve        # play dist/ at http://localhost:8080
```

Open it on a phone on the same network, or deploy (below). It is played in landscape on phones, the Galaxy Z Fold (closed and open), tablets and desktop monitors. On a desktop: arrow keys or WASD to move, E to interact, I for the Pack, Esc for the menu.

## Releasing a test build

`.github/workflows/release.yml` builds the game on every push to `main` and deploys `dist/` to **GitHub Pages**. Turn Pages on under *Settings → Pages → Source: GitHub Actions*.

To cut a numbered test build, tag it:

```bash
git tag v0.1.0-act1 && git push origin v0.1.0-act1
```

The tag also creates a pre-release on GitHub with the playable build attached as a zip. Testers can unzip it and serve the folder from any static host (opening `index.html` straight from disk also works, but some browsers block the music there).

## Tests

The Playwright suite drives the real game in Chromium: the whole Act One story, the character creator, battles, the tome and magic, mini-games, every map's reachability, and a device matrix.

```bash
pip install -r test/requirements.txt && python -m playwright install chromium
npm run build
npm test                    # story / UI / battle regression (about 15 minutes)
npm run test:reach          # every door, chest and inspectable thing is reachable on every map
npm run test:devices        # screenshots + layout checks on 10 screen sizes -> test/dev/
node -e "const s=require('./test/sim/sim.cjs'); console.log(s.stat([{key:'wren',lv:5,eq:{weapon:'oldsword'}}],['thornmother'],{}))"   # battle balance sim
```

Run all tests from the repository root. "ERR_TUNNEL_CONNECTION_FAILED" console lines come from blocked font requests and are harmless.

## Layout

| Path | What |
|---|---|
| `src/parts/` | The game, in build order (see `scripts/build.cjs`). `0x_*_data.js` files are baked sprite atlases (base64 PNG). |
| `public/music/` | The 10 music tracks |
| `scripts/build.cjs` | The build |
| `test/` | Playwright tests (Python) and the battle simulator |
| `tools/bake/` | Python scripts that drew or baked the sprites. They need the raw asset packs in `assets/`, which are not committed. |
| `docs/DESIGN.md` | The game design document (exported 12 Nov 2026) |
| `docs/CREDITS.md` | Credits and asset licences |
| `CLAUDE.md` | Working notes and the project's standing rules for Claude Code |

## Licence

All rights reserved, Ryan / Burnt Pixel Studios. Third-party music and art are used under their own licences; see `docs/CREDITS.md`.


## Installing as an app

The release build (`dist/`, served from GitHub Pages or any https host) is an installable web app: `public/manifest.webmanifest`, the icon set in `public/icons/`, and a service worker (`public/sw.template.js`, written to `dist/sw.js` with the version filled in) that caches the game so it plays offline after the first visit.

- The title screen shows an **Install Unwoven as an app** button on Chrome, Edge and Android. On iPhone and iPad it shows the Share > Add to Home Screen steps. It hides itself once the game is installed, inside the claude.ai artifact, and on browsers that cannot install.
- The icon master is `docs/icon-master.png` (made by Ryan). Regenerate the sizes in `public/icons/` from it; the maskable versions need the art inside the central 76%.
- Local testing: `npm run build && npm run serve`, then open http://localhost:8080 (localhost counts as a secure context, so the service worker and install prompt work).

# Terrorschiki's Personal Blog

[English](README.md) | [中文](README_zh.md)

**Live site: <https://terrorschiki.github.io/>**

A fully static personal homepage — plain HTML, CSS and vanilla JavaScript. No framework, no build step, no backend: GitHub Pages serves the repository exactly as it is.

- Chinese / English toggle, light / dark theme, responsive on phone and desktop
- Six sections: **Projects · Articles · Videos · Timeline · Tech Stack · Contact**
- Lightweight motion (background blobs, avatar glow, logo typewriter, card reveal) that automatically respects `prefers-reduced-motion`

---

## Repository facts

| | |
| --- | --- |
| Remote | [`Terrorschiki/Terrorschiki.github.io`](https://github.com/Terrorschiki/Terrorschiki.github.io) |
| Live URL | <https://terrorschiki.github.io/> |
| Served from | `main` branch, `/ (root)` — *Deploy from a branch* |
| Other branches | `variant-b`, `variant-c` — alternative visual styles, never served |

> The repository name must stay exactly `Terrorschiki.github.io`. GitHub only serves a personal site at the root domain `https://<owner>.github.io/` when the repository is named `<owner>.github.io`. Renaming it moves the site to a `/repo-name/` subpath and breaks every relative asset path in the project.

## What the site contains right now

| Section | Count | Notes |
| --- | --- | --- |
| Projects | 6 cards | 5 with cover images, 1 text-only; 2 cards link out to GitHub (3 links total) |
| Articles | 0 | Shows the empty state: *Articles are being organized. Stay tuned.* |
| Videos | 4 cards | 3 Bilibili + 1 Xiaohongshu; 2 still carry an empty `href`, so their Watch button is not rendered |
| Timeline | 12 entries | Newest first; the 2023.09–2027.06 degree entry is pinned at the top as the long-running thread |
| Tech Stack | 4 groups / 18 items | Robotics 5, Simulation & Training 4, Host Computer 5, Toolchain 4 |
| Contact | 5 links | Email, GitHub, Bilibili, Xiaohongshu, Zhihu |

Everything is bilingual: each card has a matching `zh` / `en` pair, and project tags switch language too (the `{ zh: [...], en: [...] }` form in `PROJECTS`).

## Layout

```text
.
├── index.html                       # single-page shell; the sections are filled in by JS
├── assets/
│   ├── css/
│   │   └── style.css                # all styling: design tokens, layout, components, responsive
│   ├── js/
│   │   ├── i18n.js                  # loads lang/*.json, drives the language toggle
│   │   └── main.js                  # ★ the content config: six arrays at the top
│   └── images/                      # avatar, Xiaohongshu icon, project cover images
├── lang/
│   ├── zh.json                      # ★ Chinese copy
│   └── en.json                      # ★ English copy
├── tools/                           # local scripts — not part of the served site
│   ├── serve.js                     # preview server with caching disabled
│   ├── check_site.js                # pre-push validation: keys, paths, leftovers
│   ├── verify_render.js             # runs the real JS against a minimal DOM
│   ├── sync_content.py              # copies content from main to the style branches
│   ├── verify_branches.py           # asserts content is identical across branches
│   └── variant_converter.py         # bakes a style variant in as the site default
├── README.md                        # this file (English)
└── README_zh.md                     # 中文说明
```

Day to day you only touch three files: [`assets/js/main.js`](assets/js/main.js), [`lang/zh.json`](lang/zh.json), [`lang/en.json`](lang/en.json).

## Local preview

The language packs are loaded with `fetch`, so **opening `index.html` from the filesystem renders an empty page** — use an HTTP server:

```bash
node tools/serve.js          # http://127.0.0.1:8080, sends no-cache headers
node tools/serve.js 9000     # or pick another port
```

`python -m http.server 8080` and the VS Code *Live Server* extension work as well; `tools/serve.js` simply spares you cache-busting while editing.

## Editing content

Two halves must stay in sync — this is the one rule that matters:

| What you are changing | Where it lives |
| --- | --- |
| Which items exist, their order, images, tags, links | the arrays at the top of [`assets/js/main.js`](assets/js/main.js) |
| The words on each card | [`lang/zh.json`](lang/zh.json) + [`lang/en.json`](lang/en.json) |

A card's `titleKey` / `descKey` is literally the key path inside both language packs. Change one side only and the page prints the key itself (for example `documents.item0.title`).

The six arrays:

| Array | Shape |
| --- | --- |
| `PROJECTS` | `img?` · `titleKey` · `descKey` · `tags` (plain array, or `{ zh, en }`) · `links[]` |
| `DOCUMENTS` | `titleKey` · `descKey` · `links[]` |
| `VIDEOS` | `titleKey` · `descKey` · `platformKey` · `categoryKey?` · `links[]` |
| `TIMELINE_EVENTS` | key prefixes — `'timeline.event0'` needs `.date` / `.title` / `.desc` in both packs |
| `TECH_STACK` | `category` (a language key) · `items[{ name \| nameKey, icon }]` |
| `CONTACT_LINKS` | `icon` or `img` · `key` · `link` |

Worth knowing:

- A `links[]` entry with an empty `href` is skipped, so you can park a card whose link is not published yet.
- `{ href, labelKey }` reuses a shared label such as `projects.links.code`; `{ href, label }` writes literal text.
- Icons come from [Font Awesome 6](https://fontawesome.com/search?o=r&m=free) (`fab fa-github`). Brands it lacks can use `img:` pointing at an SVG — that is how the Xiaohongshu icon works.
- Emptying an array brings that section's `empty` message back automatically.
- `skills.hardware` exists in both packs but no `TECH_STACK` group uses it yet — ready for a hardware category.

## Before pushing

```bash
node tools/check_site.js       # exits 1 on any problem
node tools/verify_render.js    # 33 assertions, exits 1 on failure
```

`check_site.js` validates that both packs are legal JSON, that their key sets match exactly, that every key referenced from `main.js` exists, that cover images and `index.html` assets resolve, that the six content arrays are still present, and that no template-author leftovers remain.

`verify_render.js` builds a minimal DOM in Node, executes the real `i18n.js` and `main.js` against it, and asserts that empty states, card rendering and language switching all behave.

## Style branches

The same site ships in three looks, one per branch. Each branch carries its own `assets/css/style.css` with its own light and dark palette.

| Branch | Look | Light | Dark |
| --- | --- | --- | --- |
| `main` | Terminal / code editor (**live**) | `#f6f8fa` ground, `#0969da` accent | `#0b0e14` ground, `#58a6ff` accent |
| `variant-b` | Warm print journal | `#f7f3ec` paper, `#9a5b33` ochre | `#1a1714` warm black, `#d39a67` accent |
| `variant-c` | Neon toy | `#fdf6e8` cream poster, `#e0114b` pink | `#131313` neon, `#ff4d7e` accent |

The contract that keeps them mergeable: **content belongs to `main`, styling belongs to each branch.** Everything except `assets/css/style.css` is byte-identical across the three branches, so syncing can overwrite whole files without producing conflicts.

```bash
# after committing content changes on main
python tools/sync_content.py                  # dry run: show what would change
python tools/sync_content.py --apply          # write and commit
python tools/sync_content.py --apply --push   # write, commit and push
python tools/verify_branches.py               # confirms only style.css differs
```

To put a different look online, merge its branch into `main` — the merge carries only `style.css`.

## Deploying

```bash
git add .
git commit -m "Update videos"
git push
```

GitHub Pages rebuilds `main` automatically, usually live within a minute or two; progress shows on the repository's **Actions** tab. If a change does not appear, hard-refresh (<kbd>Ctrl</kbd>+<kbd>F5</kbd>) before assuming the build failed.

## Open items

- `videos.item1` and `videos.item2` still carry `href: ''`; the Bilibili links are marked `TODO` in [`assets/js/main.js`](assets/js/main.js).
- The Articles section has no entries yet.
- `projects.item1` (the SkylandX C01 driver) is not public yet — planned for release after October stability testing.
- `assets/images/avatar.svg` is still the neutral placeholder; replacing it also means updating the `<link rel="icon">` line in [`index.html`](index.html).

## Credits

Thanks to [**Lain-Ego**](https://github.com/Lain-Ego0) — the blog template this site is built on
originated from Lain-Ego's personal homepage project. The visual redesigns and the content
configuration described above were built on top of it.


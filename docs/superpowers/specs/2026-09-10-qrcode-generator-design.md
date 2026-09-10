# QR Code Generator — Design Spec

**Date:** 2026-09-10
**Status:** Approved (pending implementation plan)
**Author:** Design brainstormed with Claude Code, approved by kdasmodak

## 1. Summary

A static, client-only web app that generates QR codes in the browser
with support for URL/text, Wi-Fi, vCard/MeCard, and WhatsApp payloads.
Users can embed a center logo chosen from a searchable library
(Twilio Paste + Simple Icons) or uploaded from disk. Generated QR
codes are persisted to a per-device history. The app ships with light
and dark themes, is mobile-first, and deploys as static assets to
GitHub Pages via GitHub Actions.

**No backend.** All computation, storage, and rendering happens in
the browser. No WebAssembly (see §3 for rationale).

## 2. Goals & non-goals

**Goals**

- Generate QR codes for URL/text, Wi-Fi, vCard/MeCard, and WhatsApp
  (`wa.me`) payloads.
- Allow a center logo, either from a bundled icon library or uploaded
  by the user.
- Automatically raise error-correction level to `H` when a logo is
  present.
- Persist a per-device history of generated codes.
- Provide light/dark themes; respect `prefers-color-scheme` and allow
  manual override.
- Be usable on a phone (mobile-first layout, touch targets ≥ 44 px).
- Deploy as a static site to `gh-pages` on the `qrcode` repo via
  GitHub Actions.
- Ship with unit, component, and end-to-end tests.

**Non-goals**

- Server-side rendering, SSG, or SvelteKit routing conventions. The
  app is a plain Vite + Svelte SPA.
- Any backend, account system, or cloud sync.
- WebAssembly. QR encoding is small enough that pure JS is
  materially faster to build and ship (see §3).
- Bulk / batch generation.
- QR *scanning* / decoding (only generation).
- Advanced styling: gradient dots, custom module shapes beyond
  square/rounded/dots. Can be revisited later.
- Cross-device history sync.

## 3. Technology decisions

| Concern | Choice | Alternatives considered |
|---|---|---|
| UI framework | Svelte 5 (runes) | React, Vue, Solid |
| Build tool | Vite (uses Rollup internally for prod build) | Rollup direct, Webpack |
| Language | TypeScript (strict) | JavaScript |
| QR encoder | `qr-code-styling` (MIT) | `qrcode` (soldair), Rust `fast_qr` via WASM |
| Storage | IndexedDB via `idb-keyval` | localStorage, IndexedDB direct |
| Icon libraries | `@twilio-paste/icons` (raw SVG source) + `simple-icons` | Lucide, Heroicons, Tabler |
| Router | `svelte-spa-router` (hash routing) | SvelteKit, page.js |
| Package manager | npm | pnpm, bun |
| Unit tests | Vitest | Jest |
| Component tests | `@testing-library/svelte` | Svelte Testing Library only |
| E2E tests | Playwright | Cypress |
| License | MIT | — |
| Hosting | GitHub Pages via `peaceiris/actions-gh-pages@v4` | Netlify, Vercel, GitHub Pages via built-in `actions/deploy-pages` |

**On WebAssembly.** The user's brief mentioned WASM. Rationale for
dropping it:

- A QR encode is a small combinatorial computation (Reed-Solomon over
  GF(256) on at most ~3 KB of input). Mature JS encoders complete a
  single encode in under 10 ms on a mid-range phone.
- A WASM module (`fast_qr` or similar) adds ~50–80 KB baseline (glue
  + module), asynchronous instantiation, and a Rust build step in CI.
  Nothing in this app's workload repays that cost.
- Confirmed with the user: WASM is out.

**On `qr-code-styling`.** It handles center-logo embedding
(error-correction padding around the logo footprint), SVG and Canvas
outputs, dots/rounded/square modules, and colored fills — the exact
feature set we need. MIT-licensed. ~30 KB minified + gzipped.

**On Simple Icons.** ~3200 CC0-licensed brand marks distributed as
plain SVG files. Loaded lazily per §7 to keep initial bundle small.

**On Twilio Paste icons.** MIT-licensed. The npm package ships React
components but also includes the raw SVG source under
`node_modules/@twilio-paste/icons/dist/svg/`. We use the raw SVGs, so
React is not pulled into the bundle.

## 4. Directory layout

```
qrcode/
├─ .github/workflows/
│  ├─ ci.yml
│  └─ deploy.yml
├─ docs/
│  └─ superpowers/specs/2026-09-10-qrcode-generator-design.md
├─ public/
│  └─ favicon.svg
├─ scripts/
│  └─ build-icon-manifest.ts        # runs at prebuild
├─ src/
│  ├─ lib/
│  │  ├─ qr/
│  │  │  ├─ encoders.ts             # payload → QR-spec string
│  │  │  ├─ encoders.test.ts
│  │  │  └─ render.ts               # wrapper over qr-code-styling
│  │  ├─ icons/
│  │  │  ├─ manifest.generated.json # emitted by build script
│  │  │  ├─ svg/                    # emitted per-icon SVGs
│  │  │  │  ├─ paste/*.svg
│  │  │  │  └─ simple-icons/*.svg
│  │  │  ├─ registry.ts             # search + lazy-load an SVG body
│  │  │  └─ registry.test.ts
│  │  ├─ storage/
│  │  │  ├─ history.ts              # idb-keyval facade
│  │  │  └─ history.test.ts
│  │  ├─ theme/
│  │  │  ├─ tokens.css
│  │  │  └─ theme.svelte.ts
│  │  └─ types.ts
│  ├─ routes/
│  │  ├─ Layout.svelte
│  │  ├─ Generator.svelte
│  │  └─ History.svelte
│  ├─ components/
│  │  ├─ ContentTypeTabs.svelte
│  │  ├─ forms/
│  │  │  ├─ UrlForm.svelte
│  │  │  ├─ WifiForm.svelte
│  │  │  ├─ VCardForm.svelte
│  │  │  └─ WhatsAppForm.svelte
│  │  ├─ LogoPicker.svelte
│  │  ├─ QrPreview.svelte
│  │  ├─ HistoryList.svelte
│  │  └─ IconBadge.svelte
│  ├─ App.svelte
│  └─ main.ts
├─ tests/
│  └─ e2e/
│     └─ generate-and-save.spec.ts
├─ .gitignore
├─ .nvmrc
├─ index.html
├─ LICENSE                          # MIT
├─ package.json
├─ playwright.config.ts
├─ README.md
├─ svelte.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ vitest.config.ts
```

## 5. Data model (`src/lib/types.ts`)

```ts
export type ContentKind = 'url' | 'wifi' | 'vcard' | 'whatsapp';

export type UrlPayload = { text: string };

export type WifiPayload = {
  ssid: string;
  password: string;
  auth: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
};

export type VCardPayload = {
  name: string;
  org?: string;
  phone?: string;
  email?: string;
  url?: string;
};

export type WhatsAppPayload = {
  phone: string;    // E.164, digits only (no '+' when embedded in wa.me)
  message?: string; // user-typed, URL-encoded at build time
};

export type Payload = UrlPayload | WifiPayload | VCardPayload | WhatsAppPayload;

export type LogoRef =
  | { kind: 'none' }
  | { kind: 'library'; setId: 'paste' | 'simple-icons'; iconId: string }
  | { kind: 'upload'; blobId: string };  // key into IDB blob store

export type QrOptions = {
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;                              // px, default 512
  fgColor: string;                           // default #111214, user-overridable
  bgColor: string;                           // default #ffffff, always white regardless of app theme (older scanners struggle with inverted codes)
  dotStyle: 'square' | 'rounded' | 'dots';
};

export type HistoryEntry = {
  id: string;             // ULID
  createdAt: number;      // ms since epoch
  kind: ContentKind;
  payload: Payload;
  logo: LogoRef;
  options: QrOptions;
};

export type IconManifestEntry = {
  id: string;             // slug, unique within setId
  setId: 'paste' | 'simple-icons';
  name: string;           // human-readable label
  keywords: string[];     // for search
  // Note: SVG body is NOT stored here — it is fetched lazily from
  // src/lib/icons/svg/<setId>/<id>.svg via import.meta.glob.
};
```

## 6. QR generation pipeline

1. The active form updates a Svelte 5 `$state` object describing the
   payload.
2. On any change, an `$effect` (debounced 150 ms) calls
   `encoders.ts` to produce a spec-compliant string:
   - **URL:** `payload.text` (validated non-empty).
   - **Wi-Fi:** `WIFI:T:<auth>;S:<ssid>;P:<pw>;H:<hidden>;;` with `\`, `;`, `,`, `:`, and `"` escaped per the spec.
   - **vCard:** MeCard format (`MECARD:N:<name>;TEL:<phone>;EMAIL:<email>;URL:<url>;ORG:<org>;;`). MeCard is chosen over vCard 3.0 because it scans natively on both iOS and Android and produces smaller QRs.
   - **WhatsApp:** `https://wa.me/<digits>?text=<encodeURIComponent(msg)>` (message optional).
3. `render.ts` calls `qr-code-styling` with `{ data, image, imageOptions, dotsOptions, backgroundOptions, qrOptions: { errorCorrectionLevel } }`.
   - If `LogoRef.kind !== 'none'`, `imageOptions.imageSize` = 0.25 and error correction is forced to `'H'`.
   - Library logos are drawn via `IconBadge`: SVG stroked/filled on a white or brand-tinted circular background at 512×512 offscreen, exported to a data URL.
   - Uploaded logos are read as Blob URLs.
4. The resulting SVG string is displayed in the preview. On download:
   - "Download PNG" → render to a `<canvas>` at chosen size, export via `canvas.toBlob('image/png')`.
   - "Download SVG" → download the SVG string.
5. On "Save", the `HistoryEntry` is persisted via §8.

## 7. Icon library ingestion

**Design goal:** ship all ~3200 Simple Icons + all Twilio Paste icons
without regressing page-load. Concretely, initial bundle must not
include SVG bodies.

**Build-time step (`scripts/build-icon-manifest.ts`, runs on
`prebuild` via package.json script):**

1. Read `@twilio-paste/icons/dist/svg/*.svg`.
2. Read `simple-icons/icons/*.svg`.
3. For each icon:
   - Normalize `viewBox` to `0 0 24 24` where possible; otherwise
     preserve original.
   - Strip `<title>`, comments, extraneous attributes.
   - Write cleaned SVG to `src/lib/icons/svg/<setId>/<id>.svg`.
   - Push an entry to the manifest array:
     `{ id, setId, name, keywords }`. Keywords are derived from the
     filename tokens + (for Simple Icons) the `title` slug variants.
4. Write the array to `src/lib/icons/manifest.generated.json`.

**Runtime (`registry.ts`):**

- On first use of the picker only (not on app startup), fetch the
  manifest JSON. Vite emits it as a static asset; we fetch via
  `import('./manifest.generated.json')` inside a dynamic import so
  the manifest is a separate chunk.
- Provide a search function that scores entries against a query
  (lowercased substring match on `name` and `keywords`, ranked by
  match position). This runs in ≤ ~10 ms for 3500 entries; if it
  becomes a bottleneck, we swap in `minisearch` (indexed offline).
- Provide `loadIconSvg(setId, id): Promise<string>` that dynamic-
  imports the individual SVG file. Vite's `import.meta.glob` with
  `{ query: '?raw', import: 'default' }` gives us a lazy map of
  every icon path to a loader function — icons are only fetched on
  demand.

**Bundle-size expectations:**

- Manifest JSON (~3500 entries × ~80 B) ≈ 280 KB raw, ~60–80 KB gzipped. Fetched lazily on picker open.
- Per-icon SVGs are 300 B–3 KB each and are individual HTTP fetches (kept alive by service worker cache if we add one later; browser HTTP cache is sufficient for now).
- Initial JS bundle: Svelte runtime + `qr-code-styling` + app code ≈ estimated 100–130 KB gzipped. Icons contribute **zero** bytes to it.

## 8. Storage (`src/lib/storage/history.ts`)

Two `idb-keyval` stores in the same IndexedDB database:

- `qr-history` — key: entry `id`, value: `HistoryEntry`.
- `qr-logos` — key: `blobId` (ULID), value: `Blob`.

Public API:

```ts
list(): Promise<HistoryEntry[]>            // sorted desc by createdAt
get(id: string): Promise<HistoryEntry | undefined>
save(entry: HistoryEntry, logoBlob?: Blob): Promise<void>
remove(id: string): Promise<void>
clear(): Promise<void>
getLogoBlob(blobId: string): Promise<Blob | undefined>
```

- Cap at 100 entries; on insert past the cap, evict oldest by
  `createdAt` (and remove orphaned logo blobs).
- Tests use `fake-indexeddb`.

## 9. Routing & pages

- Hash routing via `svelte-spa-router` — required because
  `gh-pages` serves each path as its own file and would 404 on
  `/history` refreshes. Hash routing (`/#/history`) sidesteps this.
- Two routes:
  - `#/` → `Generator.svelte`
  - `#/history` → `History.svelte`
- A minimal top nav with app title, route links, and theme toggle.

## 10. Theming and mobile design

**Tokens (`tokens.css`):**

```css
:root {
  --bg: #ffffff;
  --surface: #f6f6f7;
  --surface-elev: #ffffff;
  --fg: #111214;
  --muted: #61656b;
  --accent: #0f62fe;
  --border: #e3e5e8;
  --danger: #d94141;
  --radius: 10px;
  --shadow-1: 0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
[data-theme="dark"] {
  --bg: #0b0d10;
  --surface: #14171b;
  --surface-elev: #1a1e23;
  --fg: #f2f3f5;
  --muted: #9aa0a6;
  --accent: #6ea8ff;
  --border: #262a30;
  --danger: #ff6b6b;
  --shadow-1: 0 1px 2px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.3);
}
```

**Theme controller (`theme.svelte.ts`):** exposes a rune-backed store
with `mode: 'system' | 'light' | 'dark'`; on change it writes
`data-theme` on `<html>` and persists in localStorage. Listens for
`matchMedia('(prefers-color-scheme: dark)')` changes when
`mode === 'system'`.

**Mobile-first layout:**

- Base: single column; form on top, live preview below, sticky
  primary action bar at the bottom (safe-area padded).
- `@media (min-width: 900px)`: two columns; form on the left, preview
  sticky on the right.
- All interactive elements ≥ 44 × 44 px. Focus rings visible in both
  themes. Reduced motion respected.

## 11. Testing plan

**Unit (Vitest) — must-cover cases:**

- `encoders.ts`:
  - Wi-Fi escaping of `\ ; , : "` in SSID and password.
  - Wi-Fi `hidden` toggles the `H:` field.
  - MeCard omits empty fields.
  - WhatsApp strips a leading `+` and non-digits from `phone`.
  - WhatsApp URL-encodes the message.
- `storage/history.ts` (with `fake-indexeddb`):
  - `save` + `list` round-trips a full entry with an upload logo.
  - Eviction at cap 100 removes oldest entry and its logo blob.
  - `remove(id)` deletes both entry and associated logo blob.
- `icons/registry.ts`:
  - `search('git')` ranks a Simple Icons `github` entry above
    `gitea` (position-based ranking).
  - `loadIconSvg` returns SVG text and does not preload others.

**Component (`@testing-library/svelte`):**

- `UrlForm`: emits an updated payload on typing; renders inline
  validation for empty input.
- `WifiForm`: password field toggles visibility; `auth = nopass`
  hides the password input.
- `LogoPicker`: typing in the search box filters the visible grid
  and calls `loadIconSvg` only for icons rendered into the viewport
  (intersection-observer lazy load).
- `QrPreview`: re-renders when `options.dotStyle` changes.
- Theme toggle: setting `mode='dark'` sets `data-theme="dark"` on
  `<html>`.

**E2E (Playwright, one spec):**

`tests/e2e/generate-and-save.spec.ts`:
1. Open `/`.
2. Enter a URL in the URL form.
3. Open the logo picker, search "github", pick the Simple Icons
   entry.
4. Click "Save".
5. Navigate to `#/history`; assert the entry is listed with the
   expected preview.
6. Reload; assert the entry still lists (proves IndexedDB
   persistence).

## 12. GitHub Actions

**`ci.yml`** — triggered on pull requests to `main`:

- Node 20 (from `.nvmrc`).
- `npm ci`.
- `npm run lint` (svelte-check + eslint).
- `npm run test` (Vitest).
- `npx playwright install --with-deps chromium`.
- `npm run test:e2e` (Playwright).

**`deploy.yml`** — triggered on push to `main`:

- Same setup as CI.
- `VITE_BASE=/qrcode/ npm run build`.
- Copy `dist/index.html` → `dist/404.html` (safety net for hash
  router deep links).
- `peaceiris/actions-gh-pages@v4` publishes `dist/` to the
  `gh-pages` branch.

`vite.config.ts` reads `base` from `process.env.VITE_BASE` and
defaults to `'/'` in dev.

## 13. Package manifest (excerpt, non-binding versions)

Runtime deps:

- `svelte@^5`
- `qr-code-styling@^1`
- `idb-keyval@^6`
- `svelte-spa-router@^4`
- `ulid` (or a 40-line inline implementation)
- `@twilio-paste/icons` (dev-only: SVG source read at build)
- `simple-icons` (dev-only: SVG source read at build)

Dev deps:

- `vite`, `@sveltejs/vite-plugin-svelte`
- `typescript`, `svelte-check`, `@tsconfig/svelte`
- `vitest`, `@testing-library/svelte`, `@testing-library/jest-dom`, `fake-indexeddb`, `jsdom`
- `@playwright/test`
- `eslint`, `eslint-plugin-svelte`, `prettier`, `prettier-plugin-svelte`

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| `qr-code-styling` internals produce a different DOM than tests assume | Test the public output (SVG string / PNG blob), not the DOM shape. |
| Simple Icons brand marks rendered directly on a QR background hurt scannability | `IconBadge` always draws the icon on a solid circular badge; error correction forced to `H`. |
| gh-pages 404 on deep-linked routes | Hash router + `404.html` copy of `index.html`. |
| Twilio Paste package publishes React-only in a future version | Pin the version in `package.json`; the build script reads raw SVGs from a stable subpath — if that path moves, the build script fails loudly with a clear message. |
| Icon manifest grows so large that fetching it becomes noticeable | If manifest exceeds ~150 KB gzipped, switch to per-set manifests fetched only when the corresponding tab is opened. |
| iOS Safari IndexedDB quirks | `idb-keyval` is battle-tested across Safari. CI runs Chromium only for speed; add a WebKit Playwright project locally before any release we care about. |

## 15. Definition of done

- Repo initialized with MIT LICENSE and README describing how to run,
  test, and deploy.
- All unit, component, and E2E tests pass locally and in CI.
- `main` builds and publishes to `gh-pages`; the site at
  `https://<user>.github.io/qrcode/` loads, generates a QR, saves it,
  and shows it in history across reload.
- Lighthouse mobile Performance ≥ 90, Accessibility ≥ 95 on the
  Generator page.
- No console errors on a clean load or on any documented flow.
- No `TODO`, `FIXME`, or placeholder comments remain in the shipped
  source.

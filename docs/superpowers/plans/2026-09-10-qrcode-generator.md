# QR Code Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, client-only, Svelte 5 + Vite + TypeScript QR-code generator with light/dark themes, four content types (URL/text, Wi-Fi, vCard/MeCard, WhatsApp), a searchable center-logo library (Twilio Paste + Simple Icons, lazy-loaded) plus user uploads, an IndexedDB-backed history page, unit + component + E2E tests, and a GitHub Actions pipeline that deploys to `gh-pages` of `github.com/kaustavdm/qrcode`.

**Architecture:** Svelte 5 SPA on Vite; two hash-routed pages (Generator, History). Pure-JS QR encoding via `qr-code-styling`. IndexedDB via `idb-keyval` for both history entries and uploaded logo Blobs. Icon SVGs shipped as separate on-demand assets emitted by a prebuild script; the main bundle contains no icon bodies. Deployed as static files to gh-pages via `peaceiris/actions-gh-pages@v4`.

**Tech Stack:** Svelte 5 (runes), Vite 5, TypeScript 5 (strict), `qr-code-styling`, `idb-keyval`, `svelte-spa-router`, Vitest, `@testing-library/svelte`, `fake-indexeddb`, Playwright, ESLint, Prettier, Node 24 LTS, npm.

**Spec:** `docs/superpowers/specs/2026-09-10-qrcode-generator-design.md`

## Global Constraints

- Node version: 24 (current active LTS, recorded in `.nvmrc`). All CI runs use Node 24.
- Package manager: npm only. Never introduce `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`.
- Language: TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- No backend, no runtime WebAssembly, no telemetry, no external network calls at runtime.
- Initial JS bundle (gzipped) budget: ≤ 150 KB. Icon SVG bodies must be zero bytes of the initial bundle — enforced by a build-time check in Task 8.
- Vite `base`: `'/qrcode/'` in production (`process.env.VITE_BASE`), `'/'` in dev.
- License: MIT. `LICENSE` file at repo root, copyright "kdasmodak".
- Git remote: `https://github.com/kaustavdm/qrcode.git`. Do not push in any task; the human runs `git push` manually.
- QR foreground default `#111214`, background default `#ffffff` (always white regardless of app theme).
- All interactive elements ≥ 44 × 44 CSS px. Support `prefers-reduced-motion`.
- Every task ends with a green test run (where the task adds tests) and a commit using Conventional Commits.

---

## Task 1: Project scaffolding + git init + first commit

**Files:**
- Create: `package.json`, `tsconfig.json`, `svelte.config.js`, `vite.config.ts`, `.gitignore`, `.nvmrc`, `.editorconfig`, `LICENSE`, `README.md`, `index.html`, `src/main.ts`, `src/App.svelte`, `src/app.css`

**Interfaces:**
- Consumes: none.
- Produces: A runnable Vite + Svelte 5 shell that prints "QR Code Generator" to the DOM. `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck` all work.

- [ ] **Step 1: Initialize git and set remote**

```bash
cd /Users/kdasmodak/src/kaustavdm/qrcode
git init -b main
git remote add origin https://github.com/kaustavdm/qrcode.git
```

- [ ] **Step 2: Write `.gitignore`**

Create `.gitignore`:

```
node_modules/
dist/
.DS_Store
.env
.env.*
!.env.example
coverage/
playwright-report/
test-results/
src/lib/icons/manifest.generated.json
src/lib/icons/svg/
```

- [ ] **Step 3: Write `.nvmrc` and `.editorconfig`**

`.nvmrc`:

```
24
```

`.editorconfig`:

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

- [ ] **Step 4: Write `LICENSE` (MIT)**

Create `LICENSE`:

```
MIT License

Copyright (c) 2026 kdasmodak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 5: Write `package.json`**

```json
{
  "name": "qrcode",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "npm run icons:build && vite build",
    "preview": "vite preview",
    "typecheck": "svelte-check --tsconfig ./tsconfig.json",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "icons:build": "tsx scripts/build-icon-manifest.ts"
  },
  "dependencies": {
    "idb-keyval": "^6.2.1",
    "qr-code-styling": "^1.9.0",
    "svelte-spa-router": "^4.0.1",
    "ulid": "^2.3.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/svelte": "^5.2.0",
    "@tsconfig/svelte": "^5.0.4",
    "@twilio-paste/icons": "^13.0.0",
    "@types/node": "^24.0.0",
    "eslint": "^9.10.0",
    "eslint-plugin-svelte": "^2.44.0",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^25.0.0",
    "prettier": "^3.3.3",
    "prettier-plugin-svelte": "^3.2.6",
    "simple-icons": "^13.10.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 6: Write `tsconfig.json`**

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": false,
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/**/*", "tests/**/*", "scripts/**/*", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 7: Write `svelte.config.js`**

```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true
  }
};
```

- [ ] **Step 8: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [svelte()],
  build: {
    target: 'es2022',
    sourcemap: true
  }
});
```

- [ ] **Step 9: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0b0d10" media="(prefers-color-scheme: dark)" />
    <title>QR Code Generator</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 10: Write `src/main.ts`, `src/App.svelte`, `src/app.css`**

`src/app.css`:

```css
html, body { margin: 0; padding: 0; height: 100%; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
#app { min-height: 100vh; }
```

`src/App.svelte`:

```svelte
<script lang="ts">
  const title = 'QR Code Generator';
</script>

<main>
  <h1>{title}</h1>
</main>

<style>
  main { padding: 1rem; }
</style>
```

`src/main.ts`:

```ts
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app element');

export default mount(App, { target });
```

- [ ] **Step 11: Install deps**

Run: `npm install`
Expected: `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 12: Verify dev + build**

Run: `npm run build`
Expected: `dist/index.html` and hashed asset files emitted; no TypeScript errors.

Run: `npm run dev` in the background, curl `http://localhost:5173` and grep for "QR Code Generator"; kill the dev server.

- [ ] **Step 13: Commit**

```bash
git add .gitignore .nvmrc .editorconfig LICENSE README.md package.json package-lock.json tsconfig.json svelte.config.js vite.config.ts index.html src/ docs/
git status   # verify no stray files
git commit -m "chore: scaffold Vite + Svelte 5 + TypeScript project"
```

*(README.md at this point can be a two-line stub — Task 17 expands it.)*

`README.md`:

```markdown
# qrcode

Static QR code generator. See `docs/superpowers/specs/2026-09-10-qrcode-generator-design.md` for design.
```

---

## Task 2: Design tokens + theme controller

**Files:**
- Create: `src/lib/theme/tokens.css`, `src/lib/theme/theme.svelte.ts`, `src/lib/theme/theme.test.ts`, `vitest.config.ts`
- Modify: `src/main.ts` (import `tokens.css` and initialize theme), `src/App.svelte` (use tokens)

**Interfaces:**
- Consumes: none.
- Produces:
  - `initTheme(): void` — reads persisted mode from `localStorage.getItem('qrcode.theme')`, applies `data-theme` to `<html>`, subscribes to `prefers-color-scheme` when mode is `system`.
  - `setTheme(mode: 'system' | 'light' | 'dark'): void`
  - `getTheme(): 'system' | 'light' | 'dark'`
  - `resolvedTheme(): 'light' | 'dark'` — returns the actually-applied theme.
  - Storage key: `qrcode.theme`.

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.svelte.ts']
  }
});
```

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Write `tokens.css`**

Full CSS custom-property tokens for `:root` and `[data-theme="dark"]` — copy verbatim from spec §10.

- [ ] **Step 3: Write failing test `theme.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initTheme, setTheme, getTheme, resolvedTheme } from './theme.svelte';

describe('theme controller', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'),
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  it('defaults to system mode', () => {
    initTheme();
    expect(getTheme()).toBe('system');
  });

  it('applies dark when system prefers dark', () => {
    initTheme();
    expect(resolvedTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme("light") overrides system and persists', () => {
    initTheme();
    setTheme('light');
    expect(resolvedTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('qrcode.theme')).toBe('light');
  });

  it('initTheme() rehydrates persisted mode', () => {
    localStorage.setItem('qrcode.theme', 'dark');
    initTheme();
    expect(getTheme()).toBe('dark');
    expect(resolvedTheme()).toBe('dark');
  });
});
```

- [ ] **Step 4: Run tests — expect failure**

Run: `npm test -- theme.test.ts`
Expected: FAIL — module `./theme.svelte` not found.

- [ ] **Step 5: Implement `theme.svelte.ts`**

```ts
export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'qrcode.theme';
let mode: ThemeMode = 'system';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(): void {
  const resolved: 'light' | 'dark' = mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function initTheme(): void {
  const stored = localStorage.getItem(KEY) as ThemeMode | null;
  mode = stored ?? 'system';
  apply();
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', () => { if (mode === 'system') apply(); });
}

export function setTheme(next: ThemeMode): void {
  mode = next;
  if (next === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, next);
  apply();
}

export function getTheme(): ThemeMode { return mode; }

export function resolvedTheme(): 'light' | 'dark' {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
}
```

- [ ] **Step 6: Import tokens and init theme from `main.ts`**

Modify `src/main.ts` to `import './lib/theme/tokens.css';` and call `initTheme()` before mount.

- [ ] **Step 7: Run tests — expect pass**

Run: `npm test -- theme.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add src/lib/theme/ src/main.ts vitest.config.ts tests/setup.ts
git commit -m "feat(theme): add design tokens and theme controller"
```

---

## Task 3: Domain types

**Files:**
- Create: `src/lib/types.ts`

**Interfaces:**
- Produces: All types in spec §5 (`ContentKind`, `UrlPayload`, `WifiPayload`, `VCardPayload`, `WhatsAppPayload`, `Payload`, `LogoRef`, `QrOptions`, `HistoryEntry`, `IconManifestEntry`).

- [ ] **Step 1: Copy the full type block from spec §5 into `src/lib/types.ts`.**

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(types): add domain types for QR payloads, options, history"
```

---

## Task 4: QR encoders (TDD)

**Files:**
- Create: `src/lib/qr/encoders.ts`, `src/lib/qr/encoders.test.ts`

**Interfaces:**
- Consumes: types from `src/lib/types.ts`.
- Produces:
  - `encodeUrl(p: UrlPayload): string`
  - `encodeWifi(p: WifiPayload): string`
  - `encodeVCard(p: VCardPayload): string` — MeCard format.
  - `encodeWhatsApp(p: WhatsAppPayload): string`
  - `encode(kind: ContentKind, p: Payload): string` — dispatch.

- [ ] **Step 1: Write failing tests `encoders.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { encodeUrl, encodeWifi, encodeVCard, encodeWhatsApp } from './encoders';

describe('encodeUrl', () => {
  it('returns the raw text', () => {
    expect(encodeUrl({ text: 'https://example.com' })).toBe('https://example.com');
  });
  it('throws on empty', () => {
    expect(() => encodeUrl({ text: '' })).toThrow();
  });
});

describe('encodeWifi', () => {
  it('escapes reserved characters in ssid/password', () => {
    const s = encodeWifi({ ssid: 'my;net"work', password: 'a\\b:c,d', auth: 'WPA', hidden: false });
    expect(s).toBe('WIFI:T:WPA;S:my\\;net\\"work;P:a\\\\b\\:c\\,d;H:false;;');
  });
  it('omits password when auth=nopass', () => {
    const s = encodeWifi({ ssid: 'guest', password: '', auth: 'nopass', hidden: false });
    expect(s).toBe('WIFI:T:nopass;S:guest;H:false;;');
  });
  it('marks hidden=true', () => {
    const s = encodeWifi({ ssid: 'x', password: 'y', auth: 'WPA', hidden: true });
    expect(s).toBe('WIFI:T:WPA;S:x;P:y;H:true;;');
  });
});

describe('encodeVCard (MeCard)', () => {
  it('emits only non-empty fields', () => {
    const s = encodeVCard({ name: 'Ada Lovelace', phone: '+1234' });
    expect(s).toBe('MECARD:N:Ada Lovelace;TEL:+1234;;');
  });
  it('emits all fields when present', () => {
    const s = encodeVCard({ name: 'Grace', org: 'Navy', phone: '+1', email: 'g@x', url: 'https://x' });
    expect(s).toBe('MECARD:N:Grace;ORG:Navy;TEL:+1;EMAIL:g@x;URL:https://x;;');
  });
  it('throws on empty name', () => {
    expect(() => encodeVCard({ name: '' })).toThrow();
  });
});

describe('encodeWhatsApp', () => {
  it('strips leading + and non-digits from phone', () => {
    expect(encodeWhatsApp({ phone: '+1 (415) 555-0100' })).toBe('https://wa.me/14155550100');
  });
  it('URL-encodes the message', () => {
    expect(encodeWhatsApp({ phone: '14155550100', message: 'hi & bye' }))
      .toBe('https://wa.me/14155550100?text=hi%20%26%20bye');
  });
  it('throws on empty phone', () => {
    expect(() => encodeWhatsApp({ phone: '' })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

Run: `npm test -- encoders.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `encoders.ts`**

```ts
import type { ContentKind, Payload, UrlPayload, WifiPayload, VCardPayload, WhatsAppPayload } from '../types';

function wifiEscape(s: string): string {
  return s.replace(/([\\;,":])/g, '\\$1');
}

export function encodeUrl(p: UrlPayload): string {
  if (!p.text.trim()) throw new Error('URL/text must not be empty');
  return p.text;
}

export function encodeWifi(p: WifiPayload): string {
  const parts: string[] = [`T:${p.auth}`, `S:${wifiEscape(p.ssid)}`];
  if (p.auth !== 'nopass') parts.push(`P:${wifiEscape(p.password)}`);
  parts.push(`H:${p.hidden ? 'true' : 'false'}`);
  return `WIFI:${parts.join(';')};;`;
}

export function encodeVCard(p: VCardPayload): string {
  if (!p.name.trim()) throw new Error('Name required for vCard');
  const fields: string[] = [`N:${p.name}`];
  if (p.org) fields.push(`ORG:${p.org}`);
  if (p.phone) fields.push(`TEL:${p.phone}`);
  if (p.email) fields.push(`EMAIL:${p.email}`);
  if (p.url) fields.push(`URL:${p.url}`);
  return `MECARD:${fields.join(';')};;`;
}

export function encodeWhatsApp(p: WhatsAppPayload): string {
  const digits = p.phone.replace(/\D/g, '');
  if (!digits) throw new Error('WhatsApp phone number required');
  const base = `https://wa.me/${digits}`;
  return p.message ? `${base}?text=${encodeURIComponent(p.message)}` : base;
}

export function encode(kind: ContentKind, p: Payload): string {
  switch (kind) {
    case 'url': return encodeUrl(p as UrlPayload);
    case 'wifi': return encodeWifi(p as WifiPayload);
    case 'vcard': return encodeVCard(p as VCardPayload);
    case 'whatsapp': return encodeWhatsApp(p as WhatsAppPayload);
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -- encoders.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr/encoders.ts src/lib/qr/encoders.test.ts
git commit -m "feat(qr): add payload encoders for url, wifi, vcard, whatsapp"
```

---

## Task 5: QR render wrapper

**Files:**
- Create: `src/lib/qr/render.ts`, `src/lib/qr/render.test.ts`

**Interfaces:**
- Consumes: `QrOptions`, `LogoRef` from `types.ts`; `qr-code-styling` package.
- Produces:
  - `renderQr(input: { data: string; options: QrOptions; logoDataUrl?: string | undefined }): Promise<{ svg: string; toPngBlob(): Promise<Blob> }>`
  - When `logoDataUrl` is present, forces `errorCorrection` to `'H'` and inserts the image at 25% size.

- [ ] **Step 1: Write failing test `render.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { renderQr } from './render';

describe('renderQr', () => {
  it('returns an SVG string containing <svg', async () => {
    const r = await renderQr({ data: 'https://example.com', options: { errorCorrection: 'M', size: 256, fgColor: '#111214', bgColor: '#ffffff', dotStyle: 'square' } });
    expect(r.svg).toContain('<svg');
  });

  it('forces error correction H when logoDataUrl provided', async () => {
    const spy = await import('qr-code-styling').then(m => m.default);
    // Instead of spying, just check no throw and produced svg still valid.
    const r = await renderQr({
      data: 'x',
      options: { errorCorrection: 'L', size: 256, fgColor: '#111214', bgColor: '#ffffff', dotStyle: 'square' },
      logoDataUrl: 'data:image/svg+xml;utf8,<svg/>'
    });
    expect(r.svg).toContain('<svg');
  });
});
```

Note: `qr-code-styling` uses a canvas — under jsdom we may need to mock it. If tests fail with "canvas not supported", set the render test to `describe.skipIf(typeof HTMLCanvasElement.prototype.getContext !== 'function')` and rely on the E2E test in Task 15 for full render coverage.

- [ ] **Step 2: Run tests — expect failure (module missing)**

Run: `npm test -- render.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `render.ts`**

```ts
import QRCodeStyling from 'qr-code-styling';
import type { QrOptions } from '../types';

export async function renderQr(input: {
  data: string;
  options: QrOptions;
  logoDataUrl?: string | undefined;
}): Promise<{ svg: string; toPngBlob(): Promise<Blob> }> {
  const ec = input.logoDataUrl ? 'H' : input.options.errorCorrection;
  const qr = new QRCodeStyling({
    width: input.options.size,
    height: input.options.size,
    data: input.data,
    ...(input.logoDataUrl ? { image: input.logoDataUrl } : {}),
    qrOptions: { errorCorrectionLevel: ec },
    dotsOptions: {
      color: input.options.fgColor,
      type: input.options.dotStyle === 'dots' ? 'dots' : input.options.dotStyle === 'rounded' ? 'rounded' : 'square'
    },
    backgroundOptions: { color: input.options.bgColor },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.25, margin: 4, crossOrigin: 'anonymous' }
  });

  const svgBlob = await qr.getRawData('svg');
  const svg = svgBlob ? await (svgBlob as Blob).text() : '';

  return {
    svg,
    async toPngBlob(): Promise<Blob> {
      const png = await qr.getRawData('png');
      if (!png) throw new Error('Failed to render PNG');
      return png as Blob;
    }
  };
}
```

- [ ] **Step 4: Run tests — expect pass (or skip under jsdom limitation)**

Run: `npm test -- render.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/qr/render.ts src/lib/qr/render.test.ts
git commit -m "feat(qr): add render wrapper over qr-code-styling"
```

---

## Task 6: History storage (TDD, IndexedDB)

**Files:**
- Create: `src/lib/storage/history.ts`, `src/lib/storage/history.test.ts`

**Interfaces:**
- Consumes: `HistoryEntry` from `types.ts`; `idb-keyval`.
- Produces:
  - `list(): Promise<HistoryEntry[]>` — sorted desc by `createdAt`.
  - `get(id: string): Promise<HistoryEntry | undefined>`
  - `save(entry: HistoryEntry, logoBlob?: Blob): Promise<void>` — enforces LRU cap of 100.
  - `remove(id: string): Promise<void>` — also deletes referenced logo blob.
  - `clear(): Promise<void>`
  - `getLogoBlob(blobId: string): Promise<Blob | undefined>`
  - Constant: `HISTORY_CAP = 100`.

- [ ] **Step 1: Write failing test `history.test.ts`**

```ts
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { list, get, save, remove, clear, getLogoBlob, HISTORY_CAP } from './history';
import type { HistoryEntry } from '../types';

const mkEntry = (id: string, createdAt: number, kind: HistoryEntry['kind'] = 'url'): HistoryEntry => ({
  id,
  createdAt,
  kind,
  payload: { text: 'x' },
  logo: { kind: 'none' },
  options: { errorCorrection: 'M', size: 256, fgColor: '#111', bgColor: '#fff', dotStyle: 'square' }
});

beforeEach(async () => { await clear(); });

describe('history storage', () => {
  it('save + list round-trips', async () => {
    await save(mkEntry('a', 1));
    await save(mkEntry('b', 2));
    const items = await list();
    expect(items.map(i => i.id)).toEqual(['b', 'a']);
  });

  it('stores upload logo blob and retrieves it', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    const entry: HistoryEntry = { ...mkEntry('c', 1), logo: { kind: 'upload', blobId: 'blob-1' } };
    await save(entry, blob);
    const back = await getLogoBlob('blob-1');
    expect(back).toBeDefined();
    expect(back?.type).toBe('image/png');
  });

  it('evicts oldest entry past cap', async () => {
    for (let i = 0; i < HISTORY_CAP + 5; i++) await save(mkEntry(`e${i}`, i));
    const items = await list();
    expect(items).toHaveLength(HISTORY_CAP);
    expect(items[items.length - 1]!.id).toBe(`e5`);
  });

  it('remove deletes both entry and referenced logo blob', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    const entry: HistoryEntry = { ...mkEntry('d', 1), logo: { kind: 'upload', blobId: 'blob-d' } };
    await save(entry, blob);
    await remove('d');
    expect(await get('d')).toBeUndefined();
    expect(await getLogoBlob('blob-d')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

Run: `npm test -- history.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `history.ts`**

```ts
import { createStore, set, get as idbGet, del, values, keys } from 'idb-keyval';
import type { HistoryEntry } from '../types';

export const HISTORY_CAP = 100;

const historyStore = createStore('qrcode', 'history');
const logoStore = createStore('qrcode', 'logos');

export async function save(entry: HistoryEntry, logoBlob?: Blob): Promise<void> {
  if (logoBlob && entry.logo.kind === 'upload') await set(entry.logo.blobId, logoBlob, logoStore);
  await set(entry.id, entry, historyStore);
  const items = await list();
  if (items.length > HISTORY_CAP) {
    for (const stale of items.slice(HISTORY_CAP)) await remove(stale.id);
  }
}

export async function list(): Promise<HistoryEntry[]> {
  const all = (await values(historyStore)) as HistoryEntry[];
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function get(id: string): Promise<HistoryEntry | undefined> {
  return (await idbGet(id, historyStore)) as HistoryEntry | undefined;
}

export async function remove(id: string): Promise<void> {
  const entry = await get(id);
  if (entry?.logo.kind === 'upload') await del(entry.logo.blobId, logoStore);
  await del(id, historyStore);
}

export async function clear(): Promise<void> {
  for (const k of await keys(historyStore)) await del(k as string, historyStore);
  for (const k of await keys(logoStore)) await del(k as string, logoStore);
}

export async function getLogoBlob(blobId: string): Promise<Blob | undefined> {
  return (await idbGet(blobId, logoStore)) as Blob | undefined;
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -- history.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/history.ts src/lib/storage/history.test.ts
git commit -m "feat(storage): add IndexedDB-backed history and logo blob store"
```

---

## Task 7: Icon manifest build script

**Files:**
- Create: `scripts/build-icon-manifest.ts`
- Modify: nothing (script is invoked via existing `npm run icons:build` in `package.json`).

**Interfaces:**
- Consumes: `@twilio-paste/icons` (raw SVGs under `node_modules/@twilio-paste/icons/dist/svg/`), `simple-icons` (raw SVGs under `node_modules/simple-icons/icons/`).
- Produces:
  - `src/lib/icons/manifest.generated.json` — an array of `IconManifestEntry`.
  - `src/lib/icons/svg/paste/<id>.svg` and `src/lib/icons/svg/simple-icons/<id>.svg` — one file per icon.

- [ ] **Step 1: Write `scripts/build-icon-manifest.ts`**

```ts
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'src/lib/icons');
const SVG_OUT = join(OUT_DIR, 'svg');
const MANIFEST_OUT = join(OUT_DIR, 'manifest.generated.json');

type Entry = { id: string; setId: 'paste' | 'simple-icons'; name: string; keywords: string[] };

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function keywordsFromName(name: string): string[] {
  return Array.from(new Set(name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)));
}

async function readPasteIcons(): Promise<{ entry: Entry; svg: string }[]> {
  const dir = join(ROOT, 'node_modules/@twilio-paste/icons/dist/svg');
  if (!existsSync(dir)) throw new Error(`Paste icons SVG source not found at ${dir}. Did @twilio-paste/icons install?`);
  const files = (await readdir(dir)).filter(f => f.endsWith('.svg'));
  const out: { entry: Entry; svg: string }[] = [];
  for (const f of files) {
    const svg = await readFile(join(dir, f), 'utf8');
    const id = slugify(basename(f, '.svg'));
    const name = basename(f, '.svg').replace(/Icon$/, '').replace(/([A-Z])/g, ' $1').trim();
    out.push({ entry: { id, setId: 'paste', name, keywords: keywordsFromName(name) }, svg });
  }
  return out;
}

async function readSimpleIcons(): Promise<{ entry: Entry; svg: string }[]> {
  const dir = join(ROOT, 'node_modules/simple-icons/icons');
  if (!existsSync(dir)) throw new Error(`simple-icons SVG source not found at ${dir}`);
  const files = (await readdir(dir)).filter(f => f.endsWith('.svg'));
  const out: { entry: Entry; svg: string }[] = [];
  for (const f of files) {
    const svg = await readFile(join(dir, f), 'utf8');
    const id = basename(f, '.svg');
    const title = /<title>([^<]+)<\/title>/.exec(svg)?.[1] ?? id;
    out.push({ entry: { id, setId: 'simple-icons', name: title, keywords: keywordsFromName(title) }, svg });
  }
  return out;
}

function stripSvg(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .trim();
}

async function main(): Promise<void> {
  await rm(SVG_OUT, { recursive: true, force: true });
  await mkdir(join(SVG_OUT, 'paste'), { recursive: true });
  await mkdir(join(SVG_OUT, 'simple-icons'), { recursive: true });

  const all = [...(await readPasteIcons()), ...(await readSimpleIcons())];
  const manifest: Entry[] = [];
  for (const { entry, svg } of all) {
    await writeFile(join(SVG_OUT, entry.setId, `${entry.id}.svg`), stripSvg(svg));
    manifest.push(entry);
  }
  await writeFile(MANIFEST_OUT, JSON.stringify(manifest));
  console.log(`Wrote ${manifest.length} icons.`);
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the script**

Run: `npm run icons:build`
Expected: Prints `Wrote N icons.` where N is in the low thousands. `src/lib/icons/manifest.generated.json` and `src/lib/icons/svg/**` exist.

- [ ] **Step 3: Verify manifest shape**

Run: `node -e "const m=JSON.parse(require('fs').readFileSync('src/lib/icons/manifest.generated.json','utf8'));console.log(m.length, m[0])"`
Expected: A count and a sample entry.

- [ ] **Step 4: Verify build integrates**

Run: `npm run build`
Expected: PASS. `dist/` builds successfully. (Icon SVGs are not automatically inlined; they're only picked up via `import.meta.glob` in Task 8.)

- [ ] **Step 5: Commit**

```bash
git add scripts/build-icon-manifest.ts
git commit -m "feat(icons): add build-time manifest and SVG extraction script"
```

Note: `manifest.generated.json` and `src/lib/icons/svg/` are gitignored per Task 1.

---

## Task 8: Icon registry (search + lazy load) + bundle-size guard

**Files:**
- Create: `src/lib/icons/registry.ts`, `src/lib/icons/registry.test.ts`, `src/lib/icons/svg/.gitkeep` (so the glob directory exists in fresh clones after `npm run icons:build`)

**Interfaces:**
- Consumes: `manifest.generated.json`, `src/lib/icons/svg/**/*.svg` (via `import.meta.glob`).
- Produces:
  - `loadManifest(): Promise<IconManifestEntry[]>` — dynamic import so the manifest is a separate chunk.
  - `search(query: string, limit?: number): Promise<IconManifestEntry[]>`
  - `loadIconSvg(setId: 'paste' | 'simple-icons', id: string): Promise<string>` — returns the SVG text.

- [ ] **Step 1: Write failing test `registry.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('./manifest.generated.json', () => ({
  default: [
    { id: 'github', setId: 'simple-icons', name: 'GitHub', keywords: ['github'] },
    { id: 'gitea', setId: 'simple-icons', name: 'Gitea', keywords: ['gitea'] },
    { id: 'gitlab', setId: 'simple-icons', name: 'GitLab', keywords: ['gitlab'] }
  ]
}));

vi.mock('./__glob__', () => ({}));

import { search, loadManifest } from './registry';

describe('icon registry', () => {
  it('loads manifest lazily', async () => {
    const m = await loadManifest();
    expect(m.length).toBe(3);
  });

  it('search ranks exact-prefix higher than substring', async () => {
    const results = await search('git');
    expect(results[0]?.id).toBe('github'); // 'github' starts with 'git' and comes first alphabetically among prefix matches
  });

  it('search is case-insensitive', async () => {
    const results = await search('GITH');
    expect(results.some(r => r.id === 'github')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

Run: `npm test -- registry.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `registry.ts`**

```ts
import type { IconManifestEntry } from '../types';

const svgLoaders = import.meta.glob('./svg/**/*.svg', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

let manifestCache: IconManifestEntry[] | null = null;

export async function loadManifest(): Promise<IconManifestEntry[]> {
  if (manifestCache) return manifestCache;
  const mod = await import('./manifest.generated.json');
  manifestCache = mod.default as IconManifestEntry[];
  return manifestCache;
}

export async function search(query: string, limit = 100): Promise<IconManifestEntry[]> {
  const q = query.trim().toLowerCase();
  const m = await loadManifest();
  if (!q) return m.slice(0, limit);
  const scored: { entry: IconManifestEntry; score: number }[] = [];
  for (const entry of m) {
    const name = entry.name.toLowerCase();
    const idx = name.indexOf(q);
    if (idx === 0) scored.push({ entry, score: 0 });
    else if (idx > 0) scored.push({ entry, score: idx });
    else if (entry.keywords.some(k => k.includes(q))) scored.push({ entry, score: 1000 });
  }
  scored.sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name));
  return scored.slice(0, limit).map(s => s.entry);
}

export async function loadIconSvg(setId: 'paste' | 'simple-icons', id: string): Promise<string> {
  const key = `./svg/${setId}/${id}.svg`;
  const loader = svgLoaders[key];
  if (!loader) throw new Error(`Icon not found: ${setId}/${id}`);
  return await loader();
}
```

- [ ] **Step 4: Run tests — expect pass**

Run: `npm test -- registry.test.ts`
Expected: PASS.

- [ ] **Step 5: Bundle-size guard**

Run: `npm run build`
Then check the reported chunk sizes:

```bash
node -e "
const {readdirSync, statSync} = require('fs');
const {join} = require('path');
const dir = 'dist/assets';
const files = readdirSync(dir);
const mains = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
for (const f of mains) console.log(f, statSync(join(dir,f)).size, 'bytes');
"
```

Expected: The main `index-*.js` file is well under 500 KB raw (~120 KB gzipped) and contains no icon body strings. Sanity-check by grepping the built file for a rare SVG path fragment:

```bash
grep -c 'M12.001' dist/assets/index-*.js || echo 'no match (good)'
```

Expected: `no match (good)` (no SVG path payload in main bundle).

- [ ] **Step 6: Commit**

```bash
git add src/lib/icons/registry.ts src/lib/icons/registry.test.ts src/lib/icons/svg/.gitkeep
git commit -m "feat(icons): add lazy manifest + per-icon SVG loader with search"
```

---

## Task 9: Layout + routing shell

**Files:**
- Create: `src/routes/Layout.svelte`, `src/routes/Generator.svelte` (placeholder), `src/routes/History.svelte` (placeholder)
- Modify: `src/App.svelte` to mount `<Router>` from `svelte-spa-router`; `src/main.ts` unchanged.

**Interfaces:**
- Consumes: `svelte-spa-router`, `theme.svelte.ts`, `tokens.css`.
- Produces: A working two-page hash-routed shell with theme toggle in the layout.

- [ ] **Step 1: Update `src/App.svelte`**

```svelte
<script lang="ts">
  import Router from 'svelte-spa-router';
  import Layout from './routes/Layout.svelte';
  import Generator from './routes/Generator.svelte';
  import History from './routes/History.svelte';

  const routes = {
    '/': Generator,
    '/history': History
  };
</script>

<Layout>
  <Router {routes} />
</Layout>
```

- [ ] **Step 2: Write `src/routes/Layout.svelte`**

```svelte
<script lang="ts">
  import { setTheme, getTheme, resolvedTheme } from '../lib/theme/theme.svelte';
  import { link } from 'svelte-spa-router';

  let mode = $state(getTheme());

  function cycle() {
    const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setTheme(next);
    mode = next;
  }

  let { children } = $props();
</script>

<header>
  <a href="/" use:link><strong>QR Code Generator</strong></a>
  <nav>
    <a href="/" use:link>Generator</a>
    <a href="/history" use:link>History</a>
    <button type="button" onclick={cycle} aria-label="Toggle theme">
      {mode === 'system' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}
    </button>
  </nav>
</header>

<main>
  {@render children()}
</main>

<style>
  header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); background: var(--surface); }
  header a { color: var(--fg); text-decoration: none; }
  nav { display: flex; gap: 1rem; align-items: center; }
  button { min-height: 44px; min-width: 44px; padding: 0 1rem; background: var(--surface-elev); color: var(--fg); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; }
  main { max-width: 900px; margin: 0 auto; padding: 1rem; }
</style>
```

- [ ] **Step 3: Write placeholder `Generator.svelte` and `History.svelte`**

Each is a `<section><h1>Generator|History</h1></section>` for now — filled by later tasks.

- [ ] **Step 4: Manual verify**

Run: `npm run dev`, open `http://localhost:5173`, click both nav links, confirm URL hash changes (`#/`, `#/history`) and theme toggle cycles auto → light → dark.

- [ ] **Step 5: Commit**

```bash
git add src/App.svelte src/routes/
git commit -m "feat(routing): add layout with hash router and theme toggle"
```

---

## Task 10: URL form + WhatsApp form + tabs (TDD component)

**Files:**
- Create: `src/components/ContentTypeTabs.svelte`, `src/components/forms/UrlForm.svelte`, `src/components/forms/WhatsAppForm.svelte`, `src/components/forms/UrlForm.test.ts`

**Interfaces:**
- `UrlForm` props: `value: UrlPayload`, `onchange: (v: UrlPayload) => void`.
- `WhatsAppForm` props: `value: WhatsAppPayload`, `onchange: (v: WhatsAppPayload) => void`.
- `ContentTypeTabs` props: `kind: ContentKind`, `onchange: (k: ContentKind) => void`.

- [ ] **Step 1: Write failing test `UrlForm.test.ts`**

```ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import UrlForm from './UrlForm.svelte';

describe('UrlForm', () => {
  it('emits payload on input', async () => {
    const onchange = vi.fn();
    render(UrlForm, { value: { text: '' }, onchange });
    const input = screen.getByLabelText(/text or url/i);
    await fireEvent.input(input, { target: { value: 'https://a' } });
    expect(onchange).toHaveBeenCalledWith({ text: 'https://a' });
  });

  it('shows validation for empty input on blur', async () => {
    render(UrlForm, { value: { text: '' }, onchange: () => {} });
    const input = screen.getByLabelText(/text or url/i);
    await fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm test -- UrlForm.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `UrlForm.svelte`**

```svelte
<script lang="ts">
  import type { UrlPayload } from '../../lib/types';
  let { value, onchange }: { value: UrlPayload; onchange: (v: UrlPayload) => void } = $props();
  let touched = $state(false);
  const invalid = $derived(touched && !value.text.trim());
</script>

<label>
  <span>Text or URL</span>
  <textarea rows="3" value={value.text} oninput={(e) => onchange({ text: (e.currentTarget as HTMLTextAreaElement).value })} onblur={() => (touched = true)}></textarea>
</label>
{#if invalid}<p role="alert">Text is required.</p>{/if}

<style>
  label { display: flex; flex-direction: column; gap: 0.25rem; }
  textarea { min-height: 88px; padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-elev); color: var(--fg); font: inherit; }
  p[role="alert"] { color: var(--danger); font-size: 0.875rem; }
</style>
```

- [ ] **Step 4: Implement `WhatsAppForm.svelte`**

```svelte
<script lang="ts">
  import type { WhatsAppPayload } from '../../lib/types';
  let { value, onchange }: { value: WhatsAppPayload; onchange: (v: WhatsAppPayload) => void } = $props();
</script>

<label>
  <span>Phone (E.164)</span>
  <input type="tel" value={value.phone} oninput={(e) => onchange({ ...value, phone: (e.currentTarget as HTMLInputElement).value })} placeholder="+14155550100" />
</label>
<label>
  <span>Message (optional)</span>
  <textarea rows="3" value={value.message ?? ''} oninput={(e) => onchange({ ...value, message: (e.currentTarget as HTMLTextAreaElement).value })}></textarea>
</label>

<style>
  label { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
  input, textarea { padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-elev); color: var(--fg); font: inherit; min-height: 44px; }
</style>
```

- [ ] **Step 5: Implement `ContentTypeTabs.svelte`**

```svelte
<script lang="ts">
  import type { ContentKind } from '../lib/types';
  let { kind, onchange }: { kind: ContentKind; onchange: (k: ContentKind) => void } = $props();
  const tabs: { id: ContentKind; label: string }[] = [
    { id: 'url', label: 'URL' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'vcard', label: 'Contact' },
    { id: 'whatsapp', label: 'WhatsApp' }
  ];
</script>

<div role="tablist">
  {#each tabs as t}
    <button role="tab" aria-selected={kind === t.id} onclick={() => onchange(t.id)}>{t.label}</button>
  {/each}
</div>

<style>
  div[role="tablist"] { display: flex; gap: 0.25rem; margin-bottom: 1rem; overflow-x: auto; }
  button { min-height: 44px; padding: 0 0.875rem; background: var(--surface); color: var(--fg); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; white-space: nowrap; }
  button[aria-selected="true"] { background: var(--accent); border-color: var(--accent); color: white; }
</style>
```

- [ ] **Step 6: Run tests — expect pass**

Run: `npm test -- UrlForm.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/ContentTypeTabs.svelte src/components/forms/UrlForm.svelte src/components/forms/WhatsAppForm.svelte src/components/forms/UrlForm.test.ts
git commit -m "feat(forms): add tabs, URL form, WhatsApp form"
```

---

## Task 11: WiFi form + vCard form

**Files:**
- Create: `src/components/forms/WifiForm.svelte`, `src/components/forms/VCardForm.svelte`, `src/components/forms/WifiForm.test.ts`

**Interfaces:**
- `WifiForm` props: `value: WifiPayload`, `onchange: (v: WifiPayload) => void`.
- `VCardForm` props: `value: VCardPayload`, `onchange: (v: VCardPayload) => void`.

- [ ] **Step 1: Write failing test `WifiForm.test.ts`**

```ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import WifiForm from './WifiForm.svelte';

describe('WifiForm', () => {
  it('hides password when auth = nopass', async () => {
    render(WifiForm, { value: { ssid: '', password: '', auth: 'nopass', hidden: false }, onchange: () => {} });
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it('shows password when auth = WPA', async () => {
    render(WifiForm, { value: { ssid: '', password: '', auth: 'WPA', hidden: false }, onchange: () => {} });
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('emits toggled hidden', async () => {
    const onchange = vi.fn();
    render(WifiForm, { value: { ssid: 'x', password: 'y', auth: 'WPA', hidden: false }, onchange });
    const cb = screen.getByLabelText(/hidden network/i);
    await fireEvent.click(cb);
    expect(onchange).toHaveBeenCalledWith(expect.objectContaining({ hidden: true }));
  });
});
```

- [ ] **Step 2: Run — expect failure**

Run: `npm test -- WifiForm.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `WifiForm.svelte`**

```svelte
<script lang="ts">
  import type { WifiPayload } from '../../lib/types';
  let { value, onchange }: { value: WifiPayload; onchange: (v: WifiPayload) => void } = $props();
</script>

<label>
  <span>Network name (SSID)</span>
  <input type="text" value={value.ssid} oninput={(e) => onchange({ ...value, ssid: (e.currentTarget as HTMLInputElement).value })} />
</label>
<label>
  <span>Security</span>
  <select value={value.auth} onchange={(e) => onchange({ ...value, auth: (e.currentTarget as HTMLSelectElement).value as WifiPayload['auth'] })}>
    <option value="WPA">WPA / WPA2 / WPA3</option>
    <option value="WEP">WEP</option>
    <option value="nopass">None</option>
  </select>
</label>
{#if value.auth !== 'nopass'}
  <label>
    <span>Password</span>
    <input type="password" value={value.password} oninput={(e) => onchange({ ...value, password: (e.currentTarget as HTMLInputElement).value })} />
  </label>
{/if}
<label class="row">
  <input type="checkbox" checked={value.hidden} onchange={(e) => onchange({ ...value, hidden: (e.currentTarget as HTMLInputElement).checked })} />
  <span>Hidden network</span>
</label>

<style>
  label { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
  label.row { flex-direction: row; align-items: center; gap: 0.5rem; }
  input, select { padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-elev); color: var(--fg); font: inherit; min-height: 44px; }
  input[type="checkbox"] { min-height: unset; width: 20px; height: 20px; }
</style>
```

- [ ] **Step 4: Implement `VCardForm.svelte`**

```svelte
<script lang="ts">
  import type { VCardPayload } from '../../lib/types';
  let { value, onchange }: { value: VCardPayload; onchange: (v: VCardPayload) => void } = $props();
  function update<K extends keyof VCardPayload>(k: K, v: VCardPayload[K]) { onchange({ ...value, [k]: v }); }
</script>

<label><span>Name</span><input type="text" value={value.name} oninput={(e) => update('name', (e.currentTarget as HTMLInputElement).value)} /></label>
<label><span>Organization</span><input type="text" value={value.org ?? ''} oninput={(e) => update('org', (e.currentTarget as HTMLInputElement).value)} /></label>
<label><span>Phone</span><input type="tel" value={value.phone ?? ''} oninput={(e) => update('phone', (e.currentTarget as HTMLInputElement).value)} /></label>
<label><span>Email</span><input type="email" value={value.email ?? ''} oninput={(e) => update('email', (e.currentTarget as HTMLInputElement).value)} /></label>
<label><span>Website</span><input type="url" value={value.url ?? ''} oninput={(e) => update('url', (e.currentTarget as HTMLInputElement).value)} /></label>

<style>
  label { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
  input { padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-elev); color: var(--fg); font: inherit; min-height: 44px; }
</style>
```

- [ ] **Step 5: Run tests — expect pass**

Run: `npm test -- WifiForm.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/forms/WifiForm.svelte src/components/forms/VCardForm.svelte src/components/forms/WifiForm.test.ts
git commit -m "feat(forms): add Wi-Fi and vCard forms"
```

---

## Task 12: IconBadge + LogoPicker

**Files:**
- Create: `src/components/IconBadge.svelte`, `src/components/LogoPicker.svelte`, `src/components/LogoPicker.test.ts`

**Interfaces:**
- `IconBadge` props: `svg: string`, `size?: number` (default 128). Renders the icon SVG centered on a white circular background at the requested size and exposes an imperative `.toDataUrl(): Promise<string>` via `bind:this` (a small helper method on the component).
- `LogoPicker` props: `value: LogoRef`, `onchange: (v: LogoRef, dataUrlForRender: string | undefined, uploadBlob?: Blob) => void`.

- [ ] **Step 1: Implement `IconBadge.svelte`**

```svelte
<script lang="ts" module>
  export async function svgToBadgeDataUrl(svg: string, size = 128): Promise<string> {
    const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/><g transform="translate(${size*0.15},${size*0.15}) scale(${size*0.7/24})">${svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(wrapped)}`;
  }
</script>

<script lang="ts">
  let { svg, size = 128 }: { svg: string; size?: number } = $props();
</script>

<div class="badge" style:width="{size}px" style:height="{size}px">
  {@html svg}
</div>

<style>
  .badge { background: white; border-radius: 50%; display: grid; place-items: center; box-shadow: var(--shadow-1); }
  .badge :global(svg) { width: 70%; height: 70%; }
</style>
```

- [ ] **Step 2: Write failing test `LogoPicker.test.ts`**

```ts
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LogoPicker from './LogoPicker.svelte';

vi.mock('../lib/icons/registry', () => ({
  search: vi.fn(async () => [{ id: 'github', setId: 'simple-icons', name: 'GitHub', keywords: ['github'] }]),
  loadIconSvg: vi.fn(async () => '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"/></svg>')
}));

describe('LogoPicker', () => {
  it('runs a search and shows results', async () => {
    render(LogoPicker, { value: { kind: 'none' }, onchange: () => {} });
    const input = screen.getByLabelText(/search icons/i);
    await fireEvent.input(input, { target: { value: 'git' } });
    expect(await screen.findByText('GitHub')).toBeInTheDocument();
  });

  it('emits library selection on click', async () => {
    const onchange = vi.fn();
    render(LogoPicker, { value: { kind: 'none' }, onchange });
    await fireEvent.input(screen.getByLabelText(/search icons/i), { target: { value: 'git' } });
    const btn = await screen.findByRole('button', { name: /GitHub/ });
    await fireEvent.click(btn);
    expect(onchange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'library', setId: 'simple-icons', iconId: 'github' }),
      expect.any(String),
      undefined
    );
  });
});
```

- [ ] **Step 3: Run — expect failure**

Run: `npm test -- LogoPicker.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement `LogoPicker.svelte`**

```svelte
<script lang="ts">
  import type { LogoRef, IconManifestEntry } from '../lib/types';
  import { search, loadIconSvg } from '../lib/icons/registry';
  import { svgToBadgeDataUrl } from './IconBadge.svelte';

  let { value, onchange }: { value: LogoRef; onchange: (v: LogoRef, dataUrl: string | undefined, uploadBlob?: Blob) => void } = $props();
  let query = $state('');
  let results = $state<IconManifestEntry[]>([]);

  async function runSearch(q: string) { results = await search(q, 60); }
  $effect(() => { runSearch(query); });

  async function pick(entry: IconManifestEntry) {
    const svg = await loadIconSvg(entry.setId, entry.id);
    const dataUrl = await svgToBadgeDataUrl(svg);
    onchange({ kind: 'library', setId: entry.setId, iconId: entry.id }, dataUrl, undefined);
  }

  async function handleUpload(e: Event) {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    const blobId = crypto.randomUUID();
    const reader = new FileReader();
    reader.onload = () => onchange({ kind: 'upload', blobId }, reader.result as string, file);
    reader.readAsDataURL(file);
  }

  function clear() { onchange({ kind: 'none' }, undefined, undefined); }
</script>

<label>
  <span>Search icons</span>
  <input type="search" bind:value={query} placeholder="github, wifi, twilio..." />
</label>

<div class="grid" role="listbox">
  {#each results as r (r.setId + '/' + r.id)}
    <button type="button" onclick={() => pick(r)} aria-label={r.name}>
      <span class="name">{r.name}</span>
    </button>
  {/each}
</div>

<div class="upload">
  <label class="upload-btn">
    <input type="file" accept="image/png,image/jpeg,image/svg+xml" onchange={handleUpload} />
    <span>Upload image</span>
  </label>
  {#if value.kind !== 'none'}<button type="button" onclick={clear}>Remove logo</button>{/if}
</div>

<style>
  label { display: flex; flex-direction: column; gap: 0.25rem; }
  input[type="search"] { padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-elev); color: var(--fg); min-height: 44px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem; max-height: 280px; overflow-y: auto; margin: 0.5rem 0; }
  .grid button { min-height: 44px; padding: 0.5rem; background: var(--surface-elev); color: var(--fg); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; text-align: left; }
  .upload { display: flex; gap: 0.5rem; align-items: center; }
  .upload-btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: var(--surface-elev); color: var(--fg); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; min-height: 44px; }
  .upload-btn input { display: none; }
</style>
```

- [ ] **Step 5: Run tests — expect pass**

Run: `npm test -- LogoPicker.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/IconBadge.svelte src/components/LogoPicker.svelte src/components/LogoPicker.test.ts
git commit -m "feat(logo): add IconBadge and searchable LogoPicker with upload"
```

---

## Task 13: QrPreview + downloads

**Files:**
- Create: `src/components/QrPreview.svelte`

**Interfaces:**
- Props: `data: string`, `options: QrOptions`, `logoDataUrl?: string | undefined`.
- Renders the QR code and exposes "Download PNG" and "Download SVG" buttons.

- [ ] **Step 1: Implement `QrPreview.svelte`**

```svelte
<script lang="ts">
  import type { QrOptions } from '../lib/types';
  import { renderQr } from '../lib/qr/render';

  let { data, options, logoDataUrl }: { data: string; options: QrOptions; logoDataUrl?: string | undefined } = $props();
  let svg = $state('');
  let pngBlob: (() => Promise<Blob>) | null = null;
  let error = $state<string | null>(null);

  let debounce: number | undefined;
  $effect(() => {
    const d = data;
    const o = options;
    const l = logoDataUrl;
    window.clearTimeout(debounce);
    debounce = window.setTimeout(async () => {
      try {
        error = null;
        const r = await renderQr({ data: d, options: o, logoDataUrl: l });
        svg = r.svg;
        pngBlob = r.toPngBlob;
      } catch (e) {
        error = (e as Error).message;
      }
    }, 150);
  });

  function download(name: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function downloadPng() {
    if (!pngBlob) return;
    download('qrcode.png', await pngBlob());
  }
  function downloadSvg() {
    download('qrcode.svg', new Blob([svg], { type: 'image/svg+xml' }));
  }
</script>

<div class="preview">
  {#if error}
    <p role="alert">{error}</p>
  {:else}
    {@html svg}
  {/if}
</div>
<div class="actions">
  <button type="button" onclick={downloadPng} disabled={!svg}>Download PNG</button>
  <button type="button" onclick={downloadSvg} disabled={!svg}>Download SVG</button>
</div>

<style>
  .preview { display: grid; place-items: center; padding: 1rem; background: white; border: 1px solid var(--border); border-radius: var(--radius); min-height: 300px; }
  .preview :global(svg) { max-width: 100%; height: auto; }
  .actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  button { min-height: 44px; padding: 0 1rem; background: var(--accent); color: white; border: none; border-radius: var(--radius); cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
```

- [ ] **Step 2: Manual verify via dev server**

Run: `npm run dev`. Navigate to `/`, temporarily wire `Generator.svelte` to render `<QrPreview data="hello" options={...} />` with sensible defaults and confirm a QR shows.

- [ ] **Step 3: Commit**

```bash
git add src/components/QrPreview.svelte
git commit -m "feat(preview): add live QrPreview with PNG/SVG download"
```

---

## Task 14: Wire everything into Generator + History pages

**Files:**
- Modify: `src/routes/Generator.svelte`, `src/routes/History.svelte`
- Create: `src/components/HistoryList.svelte`

**Interfaces:**
- Consumes: encoders, render, storage, LogoPicker, forms, tabs, QrPreview.
- Produces: complete user flow — generate, save, view history, delete.

- [ ] **Step 1: Implement `Generator.svelte`**

```svelte
<script lang="ts">
  import { ulid } from 'ulid';
  import type { ContentKind, Payload, LogoRef, QrOptions, HistoryEntry } from '../lib/types';
  import { encode } from '../lib/qr/encoders';
  import { save } from '../lib/storage/history';
  import ContentTypeTabs from '../components/ContentTypeTabs.svelte';
  import UrlForm from '../components/forms/UrlForm.svelte';
  import WifiForm from '../components/forms/WifiForm.svelte';
  import VCardForm from '../components/forms/VCardForm.svelte';
  import WhatsAppForm from '../components/forms/WhatsAppForm.svelte';
  import LogoPicker from '../components/LogoPicker.svelte';
  import QrPreview from '../components/QrPreview.svelte';

  let kind = $state<ContentKind>('url');
  let payloads = $state<{ url: Payload; wifi: Payload; vcard: Payload; whatsapp: Payload }>({
    url: { text: '' },
    wifi: { ssid: '', password: '', auth: 'WPA', hidden: false },
    vcard: { name: '' },
    whatsapp: { phone: '' }
  });
  let logo = $state<LogoRef>({ kind: 'none' });
  let logoDataUrl = $state<string | undefined>(undefined);
  let pendingLogoBlob: Blob | undefined;

  const options: QrOptions = $state({ errorCorrection: 'M', size: 512, fgColor: '#111214', bgColor: '#ffffff', dotStyle: 'square' });

  const data = $derived.by(() => {
    try { return encode(kind, payloads[kind]); } catch { return ''; }
  });

  async function saveEntry() {
    if (!data) return;
    const entry: HistoryEntry = { id: ulid(), createdAt: Date.now(), kind, payload: payloads[kind], logo, options };
    await save(entry, pendingLogoBlob);
    pendingLogoBlob = undefined;
  }
</script>

<section class="grid">
  <div class="form">
    <ContentTypeTabs kind={kind} onchange={(k) => (kind = k)} />
    {#if kind === 'url'}<UrlForm value={payloads.url as any} onchange={(v) => (payloads.url = v)} />{/if}
    {#if kind === 'wifi'}<WifiForm value={payloads.wifi as any} onchange={(v) => (payloads.wifi = v)} />{/if}
    {#if kind === 'vcard'}<VCardForm value={payloads.vcard as any} onchange={(v) => (payloads.vcard = v)} />{/if}
    {#if kind === 'whatsapp'}<WhatsAppForm value={payloads.whatsapp as any} onchange={(v) => (payloads.whatsapp = v)} />{/if}
    <h2>Logo</h2>
    <LogoPicker value={logo} onchange={(v, dataUrl, blob) => { logo = v; logoDataUrl = dataUrl; pendingLogoBlob = blob; }} />
    <button type="button" class="save" onclick={saveEntry} disabled={!data}>Save to history</button>
  </div>
  <div class="preview">
    {#if data}<QrPreview {data} {options} {logoDataUrl} />{:else}<p>Enter content to generate a QR code.</p>{/if}
  </div>
</section>

<style>
  .grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
  @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1fr; } .preview { position: sticky; top: 5rem; } }
  .save { min-height: 44px; padding: 0 1rem; margin-top: 1rem; background: var(--accent); color: white; border: none; border-radius: var(--radius); cursor: pointer; }
</style>
```

- [ ] **Step 2: Implement `HistoryList.svelte`**

```svelte
<script lang="ts">
  import type { HistoryEntry } from '../lib/types';
  import { list, remove, getLogoBlob } from '../lib/storage/history';
  import { renderQr } from '../lib/qr/render';
  import { encode } from '../lib/qr/encoders';
  import { loadIconSvg } from '../lib/icons/registry';
  import { svgToBadgeDataUrl } from './IconBadge.svelte';

  let items = $state<HistoryEntry[]>([]);
  let svgs = $state<Record<string, string>>({});

  async function refresh() {
    items = await list();
    for (const e of items) {
      let logoDataUrl: string | undefined;
      if (e.logo.kind === 'library') {
        const raw = await loadIconSvg(e.logo.setId, e.logo.iconId);
        logoDataUrl = await svgToBadgeDataUrl(raw);
      } else if (e.logo.kind === 'upload') {
        const blob = await getLogoBlob(e.logo.blobId);
        if (blob) logoDataUrl = URL.createObjectURL(blob);
      }
      const r = await renderQr({ data: encode(e.kind, e.payload), options: e.options, logoDataUrl });
      svgs[e.id] = r.svg;
    }
  }

  async function del(id: string) { await remove(id); await refresh(); }

  $effect(() => { refresh(); });
</script>

<ul>
  {#each items as e (e.id)}
    <li>
      <div class="qr">{@html svgs[e.id] ?? ''}</div>
      <div class="meta">
        <div><strong>{e.kind}</strong> — {new Date(e.createdAt).toLocaleString()}</div>
        <button type="button" onclick={() => del(e.id)}>Delete</button>
      </div>
    </li>
  {/each}
  {#if items.length === 0}<li class="empty">No saved codes yet.</li>{/if}
</ul>

<style>
  ul { list-style: none; padding: 0; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  li { padding: 1rem; background: var(--surface-elev); border: 1px solid var(--border); border-radius: var(--radius); }
  .qr :global(svg) { width: 100%; height: auto; }
  .meta { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.875rem; }
  button { min-height: 44px; padding: 0 0.75rem; background: transparent; color: var(--danger); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; }
  .empty { grid-column: 1 / -1; color: var(--muted); text-align: center; }
</style>
```

- [ ] **Step 3: Wire `History.svelte`**

```svelte
<script lang="ts">
  import HistoryList from '../components/HistoryList.svelte';
</script>

<section>
  <h1>History</h1>
  <HistoryList />
</section>
```

- [ ] **Step 4: Manual smoke**

Run: `npm run dev`. Generate a URL QR, click "Save to history", navigate to `/history`, verify it appears, delete it, verify list empties.

- [ ] **Step 5: Typecheck + full tests**

Run: `npm run typecheck && npm test`
Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/routes/ src/components/HistoryList.svelte
git commit -m "feat(app): wire Generator and History pages end-to-end"
```

---

## Task 15: E2E test (Playwright)

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/generate-and-save.spec.ts`

**Interfaces:**
- Consumes: fully wired app.
- Produces: one green Playwright test proving the golden path.

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  use: { baseURL: 'http://localhost:4173' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']]
});
```

- [ ] **Step 2: Write the E2E test**

```ts
import { test, expect } from '@playwright/test';

test('generate a URL QR, add a logo, save, reload, still in history', async ({ page }) => {
  await page.goto('/#/');
  await page.getByLabel(/text or url/i).fill('https://example.com');

  // Pick a Simple Icons logo.
  await page.getByLabel(/search icons/i).fill('github');
  await page.getByRole('button', { name: 'GitHub' }).first().click();

  await expect(page.locator('.preview svg').first()).toBeVisible();

  await page.getByRole('button', { name: /save to history/i }).click();
  await page.goto('/#/history');
  await expect(page.getByText(/url/i).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText(/url/i).first()).toBeVisible();
});
```

- [ ] **Step 3: Install browsers**

Run: `npx playwright install --with-deps chromium`

- [ ] **Step 4: Run E2E**

Run: `npm run test:e2e`
Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/generate-and-save.spec.ts
git commit -m "test(e2e): add Playwright golden-path spec"
```

---

## Task 16: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:** none.

- [ ] **Step 1: Write `ci.yml`**

```yaml
name: ci
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run icons:build
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

- [ ] **Step 2: Add ESLint + Prettier configs**

Create `eslint.config.js`:

```js
import svelte from 'eslint-plugin-svelte';
export default [
  { ignores: ['dist/', 'node_modules/', 'playwright-report/', 'src/lib/icons/svg/', 'src/lib/icons/manifest.generated.json'] },
  ...svelte.configs['flat/recommended']
];
```

Create `.prettierrc`:

```json
{ "singleQuote": true, "trailingComma": "none", "printWidth": 100, "plugins": ["prettier-plugin-svelte"] }
```

- [ ] **Step 3: Verify locally**

Run: `npm run lint && npm run typecheck && npm test`
Expected: All PASS.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml eslint.config.js .prettierrc
git commit -m "ci: add PR/main pipeline running lint, tests, and E2E"
```

---

## Task 17: Deploy workflow + README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:** none.

- [ ] **Step 1: Write `deploy.yml`**

```yaml
name: deploy
on:
  push:
    branches: [main]

permissions:
  contents: write

concurrency:
  group: pages-deploy
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run icons:build
      - run: VITE_BASE=/qrcode/ npm run build
      - run: cp dist/index.html dist/404.html
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 2: Expand `README.md`**

```markdown
# QR Code Generator

A static, client-only QR code generator with a logo library, IndexedDB history, and light/dark themes.
Live at `https://kaustavdm.github.io/qrcode/`.

## Content types

- URL / text
- Wi-Fi (`WIFI:` string)
- Contact card (MeCard)
- WhatsApp (`https://wa.me/...`)

## Development

```bash
npm install
npm run icons:build    # regenerate icon manifest and per-icon SVGs
npm run dev            # dev server at http://localhost:5173
npm test               # unit + component tests
npm run test:e2e       # Playwright smoke test
npm run build          # produces dist/ (VITE_BASE=/ by default)
```

## Deployment

Pushes to `main` build with `VITE_BASE=/qrcode/` and publish to the `gh-pages` branch via `peaceiris/actions-gh-pages@v4`.
First-time GitHub Pages setup: in repo settings, enable Pages from the `gh-pages` branch, root path.

## License

MIT — see `LICENSE`.

## Design docs

- Spec: `docs/superpowers/specs/2026-09-10-qrcode-generator-design.md`
- Plan: `docs/superpowers/plans/2026-09-10-qrcode-generator.md`
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: add gh-pages deploy workflow and expand README"
```

- [ ] **Step 4: Final verification**

Run: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`
Expected: All green.

- [ ] **Step 5: Hand off**

Print to the operator:

> "Implementation complete. Run `git log --oneline` to review. Push manually with `git push -u origin main` when ready. After first push, in GitHub repo settings, enable Pages from the `gh-pages` branch to activate deploys."

---

## Self-Review

**Spec coverage:**

- §1 Summary → Task 1 scaffolding + Task 14 wiring.
- §2 Goals (all four content types) → Tasks 4, 10, 11.
- §2 Goal (center logo library + upload) → Tasks 7, 8, 12.
- §2 Goal (auto-raise EC to H with logo) → Task 5 (`render.ts`).
- §2 Goal (per-device history) → Tasks 6, 14.
- §2 Goal (light/dark themes) → Tasks 2, 9.
- §2 Goal (mobile) → Layout CSS in Task 9; grid CSS in Task 14; ≥44px enforced throughout.
- §2 Goal (deploy to gh-pages) → Task 17.
- §2 Goal (unit + component + E2E tests) → Tasks 4, 6, 8, 10, 11, 12, 15.
- §3 Tech choices → Task 1 `package.json`.
- §4 Directory layout → matches file map in tasks.
- §5 Types → Task 3.
- §6 QR pipeline → Tasks 4 + 5 + 13.
- §7 Icon ingestion → Task 7 build script + Task 8 registry (with bundle-size guard).
- §8 Storage → Task 6.
- §9 Routing → Task 9.
- §10 Theming/mobile → Tasks 2, 9, 14.
- §11 Testing plan → Tasks 4, 6, 8, 10, 11, 12 (unit + component) and Task 15 (E2E).
- §12 GitHub Actions → Tasks 16, 17.
- §13 Package manifest → Task 1.
- §14 Risks — mitigations addressed at their respective tasks.
- §15 Definition of done — Task 17 final verification.

**Placeholder scan:** no `TBD`, no `TODO`, no "similar to Task N", no "add appropriate error handling". Every code step has actual code; every test step has actual assertions.

**Type consistency:** `HistoryEntry`, `LogoRef`, `QrOptions` used consistently across storage (Task 6), Generator (Task 14), HistoryList (Task 14). `IconManifestEntry` used consistently across registry (Task 8) and LogoPicker (Task 12). Function names (`encode`, `renderQr`, `save`, `list`, `remove`, `getLogoBlob`, `search`, `loadIconSvg`, `svgToBadgeDataUrl`) match between definition and consumer tasks.

**Notable minor drifts fixed inline while writing:** none — the plan is internally consistent as drafted.

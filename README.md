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

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
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function keywordsFromName(name: string): string[] {
  return Array.from(
    new Set(
      name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
    )
  );
}

function reactAttrToSvgAttr(k: string): string {
  const map: Record<string, string> = {
    fillRule: 'fill-rule',
    clipRule: 'clip-rule',
    strokeWidth: 'stroke-width',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeDasharray: 'stroke-dasharray',
    strokeMiterlimit: 'stroke-miterlimit'
  };
  return map[k] ?? k;
}

// Extract {viewBox, paths[]} from a Paste ESM Icon module.
// The module contains one createElement("svg", {..., viewBox:"..."}) and
// one or more createElement("path", { d:"...", fill:"...", ... }).
function extractPasteSvg(js: string): { viewBox: string; body: string } | null {
  const vb = /viewBox:"([^"]+)"/.exec(js);
  if (!vb) return null;
  const paths: string[] = [];
  const pathRe = /createElement\("path",\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = pathRe.exec(js)) !== null) {
    const attrBlock = m[1] ?? '';
    const attrs: Record<string, string> = {};
    for (const pair of attrBlock.matchAll(/([a-zA-Z]+):"([^"]*)"/g)) {
      attrs[pair[1] ?? ''] = pair[2] ?? '';
    }
    if (!attrs['d']) continue;
    const rendered = Object.entries(attrs)
      .map(([k, v]) => `${reactAttrToSvgAttr(k)}="${v}"`)
      .join(' ');
    paths.push(`<path ${rendered}/>`);
  }
  if (paths.length === 0) return null;
  return { viewBox: vb[1] ?? '0 0 24 24', body: paths.join('') };
}

async function readPasteIcons(): Promise<{ entry: Entry; svg: string }[]> {
  const dir = join(ROOT, 'node_modules/@twilio-paste/icons/esm');
  if (!existsSync(dir))
    throw new Error(`Paste icons ESM source not found at ${dir}. Did @twilio-paste/icons install?`);
  const files = (await readdir(dir)).filter((f) => f.endsWith('Icon.js'));
  const out: { entry: Entry; svg: string }[] = [];
  for (const f of files) {
    const js = await readFile(join(dir, f), 'utf8');
    const parsed = extractPasteSvg(js);
    if (!parsed) {
      console.warn(`[icons:build] skipped ${f} — no matching path elements`);
      continue;
    }
    const base = basename(f, 'Icon.js');
    const id = slugify(base);
    const name = base.replace(/([A-Z])/g, ' $1').trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${parsed.viewBox}">${parsed.body}</svg>`;
    out.push({ entry: { id, setId: 'paste', name, keywords: keywordsFromName(name) }, svg });
  }
  return out;
}

async function readSimpleIcons(): Promise<{ entry: Entry; svg: string }[]> {
  const dir = join(ROOT, 'node_modules/simple-icons/icons');
  if (!existsSync(dir)) throw new Error(`simple-icons SVG source not found at ${dir}`);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.svg'));
  const out: { entry: Entry; svg: string }[] = [];
  for (const f of files) {
    const svg = await readFile(join(dir, f), 'utf8');
    const id = basename(f, '.svg');
    const title = /<title>([^<]+)<\/title>/.exec(svg)?.[1] ?? id;
    out.push({
      entry: { id, setId: 'simple-icons', name: title, keywords: keywordsFromName(title) },
      svg
    });
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

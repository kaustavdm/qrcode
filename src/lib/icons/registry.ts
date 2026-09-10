import type { IconManifestEntry } from '../types';

const svgLoaders = import.meta.glob('./svg/**/*.svg', {
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>;

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
    else if (entry.keywords.some((k) => k.includes(q))) scored.push({ entry, score: 1000 });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

export async function loadIconSvg(setId: 'paste' | 'simple-icons', id: string): Promise<string> {
  const key = `./svg/${setId}/${id}.svg`;
  const loader = svgLoaders[key];
  if (!loader) throw new Error(`Icon not found: ${setId}/${id}`);
  return await loader();
}

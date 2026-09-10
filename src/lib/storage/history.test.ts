// @vitest-environment node
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { list, get, save, remove, clear, getLogoBlob, HISTORY_CAP } from './history';
import type { HistoryEntry } from '../types';

const mkEntry = (
  id: string,
  createdAt: number,
  kind: HistoryEntry['kind'] = 'url'
): HistoryEntry => ({
  id,
  createdAt,
  kind,
  payload: { text: 'x' },
  logo: { kind: 'none' },
  options: { errorCorrection: 'M', size: 256, fgColor: '#111', bgColor: '#fff', dotStyle: 'square' }
});

beforeEach(async () => {
  await clear();
});

describe('history storage', () => {
  it('save + list round-trips', async () => {
    await save(mkEntry('a', 1));
    await save(mkEntry('b', 2));
    const items = await list();
    expect(items.map((i) => i.id)).toEqual(['b', 'a']);
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

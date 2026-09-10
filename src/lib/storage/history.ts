import { createStore, set, get as idbGet, del, values, keys } from 'idb-keyval';
import type { HistoryEntry } from '../types';

export const HISTORY_CAP = 100;

// Two SEPARATE databases (not one DB with two stores) — idb-keyval's createStore
// opens the DB at v1 with a single-store upgrade; a second createStore call
// against the same DB name would silently skip adding the second store, then
// throw NotFoundError on first access.
const historyStore = createStore('qrcode-history', 'history');
const logoStore = createStore('qrcode-logos', 'logos');

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

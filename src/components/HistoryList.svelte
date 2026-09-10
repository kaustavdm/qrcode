<script lang="ts">
  import type { HistoryEntry } from '../lib/types';
  import { list, remove, getLogoBlob } from '../lib/storage/history';
  import { renderQr } from '../lib/qr/render';
  import { encode } from '../lib/qr/encoders';
  import { loadIconSvg } from '../lib/icons/registry';
  import { svgToBadgeDataUrl } from './IconBadge.svelte';

  let items = $state<HistoryEntry[]>([]);
  let svgs = $state<Record<string, string>>({});

  const objectUrls = new Set<string>();

  function revokeAllObjectUrls() {
    for (const url of objectUrls) URL.revokeObjectURL(url);
    objectUrls.clear();
  }

  async function refresh() {
    revokeAllObjectUrls();
    items = await list();
    for (const e of items) {
      let logoDataUrl: string | undefined;
      if (e.logo.kind === 'library') {
        const raw = await loadIconSvg(e.logo.setId, e.logo.iconId);
        logoDataUrl = await svgToBadgeDataUrl(raw);
      } else if (e.logo.kind === 'upload') {
        const blob = await getLogoBlob(e.logo.blobId);
        if (blob) {
          logoDataUrl = URL.createObjectURL(blob);
          objectUrls.add(logoDataUrl);
        }
      }
      const r = await renderQr({
        data: encode(e.kind, e.payload),
        options: e.options,
        logoDataUrl
      });
      svgs[e.id] = r.svg;
    }
  }

  async function del(id: string) {
    await remove(id);
    await refresh();
  }

  $effect(() => {
    refresh();
    return () => revokeAllObjectUrls();
  });
</script>

<ul>
  {#each items as e (e.id)}
    <li>
      <div class="qr">{@html svgs[e.id] ?? ''}</div>
      <div class="meta">
        <div><strong>{e.kind}</strong> — {new Date(e.createdAt).toLocaleString()}</div>
        <button
          type="button"
          aria-label="Delete {e.kind} QR saved {new Date(e.createdAt).toLocaleString()}"
          onclick={() => del(e.id)}>Delete</button
        >
      </div>
    </li>
  {/each}
  {#if items.length === 0}<li class="empty">No saved codes yet.</li>{/if}
</ul>

<style>
  ul {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  li {
    padding: 1rem;
    background: var(--surface-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .qr :global(svg) {
    width: 100%;
    height: auto;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }
  button {
    min-height: 44px;
    padding: 0 0.75rem;
    background: transparent;
    color: var(--danger);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .empty {
    grid-column: 1 / -1;
    color: var(--muted);
    text-align: center;
  }
</style>

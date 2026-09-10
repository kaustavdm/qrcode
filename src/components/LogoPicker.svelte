<script lang="ts">
  import type { LogoRef, IconManifestEntry } from '../lib/types';
  import { search, loadIconSvg } from '../lib/icons/registry';
  import { svgToBadgeDataUrl } from './IconBadge.svelte';

  let {
    value,
    onchange
  }: {
    value: LogoRef;
    onchange: (v: LogoRef, dataUrl: string | undefined, uploadBlob?: Blob) => void;
  } = $props();
  let query = $state('');
  let results = $state<IconManifestEntry[]>([]);

  async function runSearch(q: string) {
    results = await search(q, 60);
  }
  $effect(() => {
    runSearch(query);
  });

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

  function clear() {
    onchange({ kind: 'none' }, undefined, undefined);
  }
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
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  input[type='search'] {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-elev);
    color: var(--fg);
    min-height: 44px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
    max-height: 280px;
    overflow-y: auto;
    margin: 0.5rem 0;
  }
  .grid button {
    min-height: 44px;
    padding: 0.5rem;
    background: var(--surface-elev);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    text-align: left;
  }
  .upload {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .upload-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--surface-elev);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    min-height: 44px;
  }
  .upload-btn input {
    display: none;
  }
</style>

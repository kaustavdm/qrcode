<script lang="ts">
  import type { QrOptions } from '../lib/types';
  import { renderQr } from '../lib/qr/render';

  let {
    data,
    options,
    logoDataUrl
  }: { data: string; options: QrOptions; logoDataUrl?: string | undefined } = $props();
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
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
  .preview {
    display: grid;
    place-items: center;
    padding: 1rem;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    min-height: 300px;
  }
  .preview :global(svg) {
    max-width: 100%;
    height: auto;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  button {
    min-height: 44px;
    padding: 0 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

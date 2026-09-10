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
    <button role="tab" aria-selected={kind === t.id} onclick={() => onchange(t.id)}
      >{t.label}</button
    >
  {/each}
</div>

<style>
  div[role='tablist'] {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    overflow-x: auto;
  }
  button {
    min-height: 44px;
    padding: 0 0.875rem;
    background: var(--surface);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    white-space: nowrap;
  }
  button[aria-selected='true'] {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }
</style>

<script lang="ts">
  import type { UrlPayload } from '../../lib/types';
  let { value, onchange }: { value: UrlPayload; onchange: (v: UrlPayload) => void } = $props();
  let touched = $state(false);
  const invalid = $derived(touched && !value.text.trim());
</script>

<label>
  <span>Text or URL</span>
  <textarea
    rows="3"
    value={value.text}
    oninput={(e) => onchange({ text: (e.currentTarget as HTMLTextAreaElement).value })}
    onblur={() => (touched = true)}
  ></textarea>
</label>
{#if invalid}<p role="alert">Text is required.</p>{/if}

<style>
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  textarea {
    min-height: 88px;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-elev);
    color: var(--fg);
    font: inherit;
  }
  p[role='alert'] {
    color: var(--danger);
    font-size: 0.875rem;
  }
</style>

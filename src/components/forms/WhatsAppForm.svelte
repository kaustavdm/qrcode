<script lang="ts">
  import type { WhatsAppPayload } from '../../lib/types';
  let { value, onchange }: { value: WhatsAppPayload; onchange: (v: WhatsAppPayload) => void } =
    $props();
</script>

<label>
  <span>Phone (E.164)</span>
  <input
    type="tel"
    value={value.phone}
    oninput={(e) => onchange({ ...value, phone: (e.currentTarget as HTMLInputElement).value })}
    placeholder="+14155550100"
  />
</label>
<label>
  <span>Message (optional)</span>
  <textarea
    rows="3"
    value={value.message ?? ''}
    oninput={(e) => onchange({ ...value, message: (e.currentTarget as HTMLTextAreaElement).value })}
  ></textarea>
</label>

<style>
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
  input,
  textarea {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-elev);
    color: var(--fg);
    font: inherit;
    min-height: 44px;
  }
</style>

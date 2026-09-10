<script lang="ts">
  import type { VCardPayload } from '../../lib/types';
  let { value, onchange }: { value: VCardPayload; onchange: (v: VCardPayload) => void } = $props();
  function update<K extends keyof VCardPayload>(k: K, v: VCardPayload[K]) {
    onchange({ ...value, [k]: v });
  }
</script>

<label
  ><span>Name</span><input
    type="text"
    value={value.name}
    oninput={(e) => update('name', (e.currentTarget as HTMLInputElement).value)}
  /></label
>
<label
  ><span>Organization</span><input
    type="text"
    value={value.org ?? ''}
    oninput={(e) => update('org', (e.currentTarget as HTMLInputElement).value)}
  /></label
>
<label
  ><span>Phone</span><input
    type="tel"
    value={value.phone ?? ''}
    oninput={(e) => update('phone', (e.currentTarget as HTMLInputElement).value)}
  /></label
>
<label
  ><span>Email</span><input
    type="email"
    value={value.email ?? ''}
    oninput={(e) => update('email', (e.currentTarget as HTMLInputElement).value)}
  /></label
>
<label
  ><span>Website</span><input
    type="url"
    value={value.url ?? ''}
    oninput={(e) => update('url', (e.currentTarget as HTMLInputElement).value)}
  /></label
>

<style>
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
  input {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-elev);
    color: var(--fg);
    font: inherit;
    min-height: 44px;
  }
</style>

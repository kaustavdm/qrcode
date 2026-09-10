<script lang="ts">
  import type { WifiPayload } from '../../lib/types';
  let { value, onchange }: { value: WifiPayload; onchange: (v: WifiPayload) => void } = $props();
</script>

<label>
  <span>Network name (SSID)</span>
  <input
    type="text"
    value={value.ssid}
    oninput={(e) => onchange({ ...value, ssid: (e.currentTarget as HTMLInputElement).value })}
  />
</label>
<label>
  <span>Security</span>
  <select
    value={value.auth}
    onchange={(e) =>
      onchange({
        ...value,
        auth: (e.currentTarget as HTMLSelectElement).value as WifiPayload['auth']
      })}
  >
    <option value="WPA">WPA / WPA2 / WPA3</option>
    <option value="WEP">WEP</option>
    <option value="nopass">None</option>
  </select>
</label>
{#if value.auth !== 'nopass'}
  <label>
    <span>Password</span>
    <input
      type="password"
      value={value.password}
      oninput={(e) => onchange({ ...value, password: (e.currentTarget as HTMLInputElement).value })}
    />
  </label>
{/if}
<label class="row">
  <input
    type="checkbox"
    checked={value.hidden}
    onchange={(e) => onchange({ ...value, hidden: (e.currentTarget as HTMLInputElement).checked })}
  />
  <span>Hidden network</span>
</label>

<style>
  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
  label.row {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
  }
  input,
  select {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-elev);
    color: var(--fg);
    font: inherit;
    min-height: 44px;
  }
  input[type='checkbox'] {
    min-height: unset;
    width: 20px;
    height: 20px;
  }
</style>

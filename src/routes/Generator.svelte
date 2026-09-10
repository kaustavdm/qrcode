<script lang="ts">
  import { ulid } from 'ulid';
  import type { ContentKind, Payload, LogoRef, QrOptions, HistoryEntry } from '../lib/types';
  import { encode } from '../lib/qr/encoders';
  import { save, getLogoBlob } from '../lib/storage/history';
  import ContentTypeTabs from '../components/ContentTypeTabs.svelte';
  import UrlForm from '../components/forms/UrlForm.svelte';
  import WifiForm from '../components/forms/WifiForm.svelte';
  import VCardForm from '../components/forms/VCardForm.svelte';
  import WhatsAppForm from '../components/forms/WhatsAppForm.svelte';
  import LogoPicker from '../components/LogoPicker.svelte';
  import QrPreview from '../components/QrPreview.svelte';

  let kind = $state<ContentKind>('url');
  let payloads = $state<{ url: Payload; wifi: Payload; vcard: Payload; whatsapp: Payload }>({
    url: { text: '' },
    wifi: { ssid: '', password: '', auth: 'WPA', hidden: false },
    vcard: { name: '' },
    whatsapp: { phone: '' }
  });
  let logo = $state<LogoRef>({ kind: 'none' });
  let logoDataUrl = $state<string | undefined>(undefined);
  let pendingLogoBlob: Blob | undefined;

  const options: QrOptions = $state({
    errorCorrection: 'M',
    size: 512,
    fgColor: '#111214',
    bgColor: '#ffffff',
    dotStyle: 'square'
  });

  const data = $derived.by(() => {
    try {
      return encode(kind, payloads[kind]);
    } catch {
      return '';
    }
  });

  async function saveEntry() {
    if (!data) return;
    // If the user previously saved an upload logo (pendingLogoBlob was cleared)
    // and the blob has since been deleted (e.g. history entry removed), reset
    // the logo state to avoid writing a dangling blobId reference.
    const currentLogo = $state.snapshot(logo) as LogoRef;
    if (currentLogo.kind === 'upload' && pendingLogoBlob === undefined) {
      const stillExists = await getLogoBlob(currentLogo.blobId);
      if (!stillExists) {
        logo = { kind: 'none' };
        logoDataUrl = undefined;
      }
    }
    // $state.snapshot() converts Svelte 5 reactive proxies to plain objects so
    // that the structured-clone algorithm used by IndexedDB can serialise them.
    const entry: HistoryEntry = {
      id: ulid(),
      createdAt: Date.now(),
      kind,
      payload: $state.snapshot(payloads[kind]) as Payload,
      logo: $state.snapshot(logo),
      options: $state.snapshot(options)
    };
    await save(entry, pendingLogoBlob);
    pendingLogoBlob = undefined;
  }
</script>

<section class="grid">
  <div class="form">
    <ContentTypeTabs {kind} onchange={(k) => (kind = k)} />
    {#if kind === 'url'}<UrlForm
        value={payloads.url as any}
        onchange={(v) => (payloads.url = v)}
      />{/if}
    {#if kind === 'wifi'}<WifiForm
        value={payloads.wifi as any}
        onchange={(v) => (payloads.wifi = v)}
      />{/if}
    {#if kind === 'vcard'}<VCardForm
        value={payloads.vcard as any}
        onchange={(v) => (payloads.vcard = v)}
      />{/if}
    {#if kind === 'whatsapp'}<WhatsAppForm
        value={payloads.whatsapp as any}
        onchange={(v) => (payloads.whatsapp = v)}
      />{/if}
    <h2>Logo</h2>
    <LogoPicker
      value={logo}
      onchange={(v, dataUrl, blob) => {
        logo = v;
        logoDataUrl = dataUrl;
        pendingLogoBlob = blob;
      }}
    />
    <button type="button" class="save" onclick={saveEntry} disabled={!data}>Save to history</button>
  </div>
  <div class="preview">
    {#if data}<QrPreview {data} {options} {logoDataUrl} />{:else}<p>
        Enter content to generate a QR code.
      </p>{/if}
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 900px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
    .preview {
      position: sticky;
      top: 5rem;
    }
  }
  .save {
    min-height: 44px;
    padding: 0 1rem;
    margin-top: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
  }
</style>

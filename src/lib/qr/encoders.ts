import type {
  ContentKind,
  Payload,
  UrlPayload,
  WifiPayload,
  VCardPayload,
  WhatsAppPayload
} from '../types';

function wifiEscape(s: string): string {
  return s.replace(/([\\;,":])/g, '\\$1');
}

function mecardEscape(s: string): string {
  return s.replace(/([\\;,":])/g, '\\$1');
}

export function encodeUrl(p: UrlPayload): string {
  if (!p.text.trim()) throw new Error('URL/text must not be empty');
  return p.text;
}

export function encodeWifi(p: WifiPayload): string {
  const parts: string[] = [`T:${p.auth}`, `S:${wifiEscape(p.ssid)}`];
  if (p.auth !== 'nopass') parts.push(`P:${wifiEscape(p.password)}`);
  parts.push(`H:${p.hidden ? 'true' : 'false'}`);
  return `WIFI:${parts.join(';')};;`;
}

export function encodeVCard(p: VCardPayload): string {
  if (!p.name.trim()) throw new Error('Name required for vCard');
  const fields: string[] = [`N:${mecardEscape(p.name)}`];
  if (p.org) fields.push(`ORG:${mecardEscape(p.org)}`);
  if (p.phone) fields.push(`TEL:${mecardEscape(p.phone)}`);
  if (p.email) fields.push(`EMAIL:${mecardEscape(p.email)}`);
  if (p.url) fields.push(`URL:${p.url}`);
  return `MECARD:${fields.join(';')};;`;
}

export function encodeWhatsApp(p: WhatsAppPayload): string {
  const digits = p.phone.replace(/\D/g, '');
  if (!digits) throw new Error('WhatsApp phone number required');
  const base = `https://wa.me/${digits}`;
  return p.message ? `${base}?text=${encodeURIComponent(p.message)}` : base;
}

export function encode(kind: ContentKind, p: Payload): string {
  switch (kind) {
    case 'url':
      return encodeUrl(p as UrlPayload);
    case 'wifi':
      return encodeWifi(p as WifiPayload);
    case 'vcard':
      return encodeVCard(p as VCardPayload);
    case 'whatsapp':
      return encodeWhatsApp(p as WhatsAppPayload);
  }
}

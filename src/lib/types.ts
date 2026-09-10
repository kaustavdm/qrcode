export type ContentKind = 'url' | 'wifi' | 'vcard' | 'whatsapp';

export type UrlPayload = { text: string };

export type WifiPayload = {
  ssid: string;
  password: string;
  auth: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
};

export type VCardPayload = {
  name: string;
  org?: string;
  phone?: string;
  email?: string;
  url?: string;
};

export type WhatsAppPayload = {
  phone: string; // E.164, digits only (no '+' when embedded in wa.me)
  message?: string; // user-typed, URL-encoded at build time
};

export type Payload = UrlPayload | WifiPayload | VCardPayload | WhatsAppPayload;

export type LogoRef =
  | { kind: 'none' }
  | { kind: 'library'; setId: 'paste' | 'simple-icons'; iconId: string }
  | { kind: 'upload'; blobId: string }; // key into IDB blob store

export type QrOptions = {
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number; // px, default 512
  fgColor: string; // default #111214, user-overridable
  bgColor: string; // default #ffffff, always white regardless of app theme (older scanners struggle with inverted codes)
  dotStyle: 'square' | 'rounded' | 'dots';
};

export type HistoryEntry = {
  id: string; // ULID
  createdAt: number; // ms since epoch
  kind: ContentKind;
  payload: Payload;
  logo: LogoRef;
  options: QrOptions;
};

export type IconManifestEntry = {
  id: string; // slug, unique within setId
  setId: 'paste' | 'simple-icons';
  name: string; // human-readable label
  keywords: string[]; // for search
  // Note: SVG body is NOT stored here — it is fetched lazily from
  // src/lib/icons/svg/<setId>/<id>.svg via import.meta.glob.
};

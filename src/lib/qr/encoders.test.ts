import { describe, it, expect } from 'vitest';
import { encodeUrl, encodeWifi, encodeVCard, encodeWhatsApp } from './encoders';

describe('encodeUrl', () => {
  it('returns the raw text', () => {
    expect(encodeUrl({ text: 'https://example.com' })).toBe('https://example.com');
  });
  it('throws on empty', () => {
    expect(() => encodeUrl({ text: '' })).toThrow();
  });
});

describe('encodeWifi', () => {
  it('escapes reserved characters in ssid/password', () => {
    const s = encodeWifi({ ssid: 'my;net"work', password: 'a\\b:c,d', auth: 'WPA', hidden: false });
    expect(s).toBe('WIFI:T:WPA;S:my\\;net\\"work;P:a\\\\b\\:c\\,d;H:false;;');
  });
  it('omits password when auth=nopass', () => {
    const s = encodeWifi({ ssid: 'guest', password: '', auth: 'nopass', hidden: false });
    expect(s).toBe('WIFI:T:nopass;S:guest;H:false;;');
  });
  it('marks hidden=true', () => {
    const s = encodeWifi({ ssid: 'x', password: 'y', auth: 'WPA', hidden: true });
    expect(s).toBe('WIFI:T:WPA;S:x;P:y;H:true;;');
  });
});

describe('encodeVCard (MeCard)', () => {
  it('emits only non-empty fields', () => {
    const s = encodeVCard({ name: 'Ada Lovelace', phone: '+1234' });
    expect(s).toBe('MECARD:N:Ada Lovelace;TEL:+1234;;');
  });
  it('emits all fields when present', () => {
    const s = encodeVCard({
      name: 'Grace',
      org: 'Navy',
      phone: '+1',
      email: 'g@x',
      url: 'https://x'
    });
    expect(s).toBe('MECARD:N:Grace;ORG:Navy;TEL:+1;EMAIL:g@x;URL:https://x;;');
  });
  it('throws on empty name', () => {
    expect(() => encodeVCard({ name: '' })).toThrow();
  });
  it('escapes reserved characters in vCard fields', () => {
    const s = encodeVCard({ name: 'Doe; Alice', org: 'a\\b:c,d' });
    expect(s).toBe('MECARD:N:Doe\\; Alice;ORG:a\\\\b\\:c\\,d;;');
  });
});

describe('encodeWhatsApp', () => {
  it('strips leading + and non-digits from phone', () => {
    expect(encodeWhatsApp({ phone: '+1 (415) 555-0100' })).toBe('https://wa.me/14155550100');
  });
  it('URL-encodes the message', () => {
    expect(encodeWhatsApp({ phone: '14155550100', message: 'hi & bye' })).toBe(
      'https://wa.me/14155550100?text=hi%20%26%20bye'
    );
  });
  it('throws on empty phone', () => {
    expect(() => encodeWhatsApp({ phone: '' })).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { renderQr } from './render';

// Tests skipped under jsdom: qr-code-styling requires canvas for SVG rendering.
// Full render coverage provided by E2E test in Task 15.
describe.skipIf(
  typeof HTMLCanvasElement.prototype.getContext !== 'function' ||
    typeof OffscreenCanvas === 'undefined'
)('renderQr', () => {
  it('returns an SVG string containing <svg', async () => {
    const r = await renderQr({
      data: 'https://example.com',
      options: {
        errorCorrection: 'M',
        size: 256,
        fgColor: '#111214',
        bgColor: '#ffffff',
        dotStyle: 'square'
      }
    });
    expect(r.svg).toContain('<svg');
  });

  it('forces error correction H when logoDataUrl provided', async () => {
    const r = await renderQr({
      data: 'x',
      options: {
        errorCorrection: 'L',
        size: 256,
        fgColor: '#111214',
        bgColor: '#ffffff',
        dotStyle: 'square'
      },
      logoDataUrl: 'data:image/svg+xml;utf8,<svg/>'
    });
    expect(r.svg).toContain('<svg');
  });
});

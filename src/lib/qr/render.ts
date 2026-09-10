import QRCodeStyling from 'qr-code-styling';
import type { QrOptions } from '../types';

export async function renderQr(input: {
  data: string;
  options: QrOptions;
  logoDataUrl?: string | undefined;
}): Promise<{ svg: string; toPngBlob(): Promise<Blob> }> {
  const ec = input.logoDataUrl ? 'H' : input.options.errorCorrection;
  const qr = new QRCodeStyling({
    width: input.options.size,
    height: input.options.size,
    data: input.data,
    ...(input.logoDataUrl ? { image: input.logoDataUrl } : {}),
    qrOptions: { errorCorrectionLevel: ec },
    dotsOptions: {
      color: input.options.fgColor,
      type:
        input.options.dotStyle === 'dots'
          ? 'dots'
          : input.options.dotStyle === 'rounded'
            ? 'rounded'
            : 'square'
    },
    backgroundOptions: { color: input.options.bgColor },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.25, margin: 4, crossOrigin: 'anonymous' }
  });

  const svgBlob = await qr.getRawData('svg');
  const svg = svgBlob ? await (svgBlob as Blob).text() : '';

  return {
    svg,
    async toPngBlob(): Promise<Blob> {
      const png = await qr.getRawData('png');
      if (!png) throw new Error('Failed to render PNG');
      return png as Blob;
    }
  };
}

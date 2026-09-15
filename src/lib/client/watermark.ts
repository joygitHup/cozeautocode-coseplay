/** 给生成图加水印「华裳纪」，返回 PNG data URL */
export async function watermarkImage(
  imageUrl: string,
  brand: string,
): Promise<string> {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const fontSize = Math.max(18, Math.round(canvas.width * 0.035));
  ctx.font = `${fontSize}px "Noto Serif SC", "Songti SC", serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';

  const padding = Math.round(fontSize * 0.8);
  const text = brand;
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + padding * 1.2;
  const boxH = fontSize + padding;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(
    canvas.width - boxW - padding * 0.4,
    canvas.height - boxH - padding * 0.4,
    boxW,
    boxH,
  );
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(text, canvas.width - padding, canvas.height - padding * 0.7);

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export function buildScenicShareUrl(spotId: string): string {
  if (typeof window === 'undefined') return `/s/${spotId}`;
  return `${window.location.origin}/s/${spotId}`;
}

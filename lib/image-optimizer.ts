/**
 * Optimizes an image by:
 *  1. Stripping all EXIF/metadata via Canvas re-encode
 *  2. Resizing: if height > 720px → scale down to 720px (keep aspect ratio)
 *  3. Exporting as WebP at 0.90 quality
 *
 * HEIC files are first decoded via heic2any before canvas processing.
 */

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
const MAX_HEIGHT = 720;

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

async function convertHeicToBlob(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 });
  return Array.isArray(result) ? result[0] : result;
}

export interface OptimizeResult {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  wasResized: boolean;
}

export async function optimizeImage(file: File): Promise<OptimizeResult> {
  let sourceBlob: Blob = file;

  // Step 1: HEIC → JPEG
  if (isHeic(file)) {
    sourceBlob = await convertHeicToBlob(file);
  }

  // Step 2: Decode to ImageBitmap (strips EXIF)
  const bitmap = await createImageBitmap(sourceBlob);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;

  // Step 3: Compute output dimensions (max 720px height)
  let outputWidth = originalWidth;
  let outputHeight = originalHeight;
  let wasResized = false;

  if (originalHeight > MAX_HEIGHT) {
    const scale = MAX_HEIGHT / originalHeight;
    outputWidth = Math.round(originalWidth * scale);
    outputHeight = MAX_HEIGHT;
    wasResized = true;
  }

  // Step 4: Draw onto OffscreenCanvas at output size
  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');
  ctx.drawImage(bitmap, 0, 0, outputWidth, outputHeight);
  bitmap.close();

  // Step 5: Export as WebP
  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
  return { blob, originalWidth, originalHeight, outputWidth, outputHeight, wasResized };
}

export function getOptimizeFilename(file: File): string {
  const name = file.name;
  const dotIdx = name.lastIndexOf('.');
  const base = dotIdx !== -1 ? name.slice(0, dotIdx) : name;
  return `${base}_opt.webp`;
}

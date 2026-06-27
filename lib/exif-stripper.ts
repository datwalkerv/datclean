/**
 * Strips ALL metadata from an image by re-encoding through the Canvas API.
 * The canvas only exports pixel data — EXIF, XMP, IPTC, ICC comments are discarded.
 * HEIC files are first converted via heic2any before canvas processing.
 */

const HEIC_TYPES = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

async function convertHeicToBlob(file: File): Promise<Blob> {
  // Dynamic import so heic2any is not bundled unless needed
  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.95,
  });
  return Array.isArray(result) ? result[0] : result;
}

export async function stripExif(file: File): Promise<Blob> {
  let sourceBlob: Blob = file;
  let outputType = file.type || 'image/jpeg';

  // Step 1: Convert HEIC → JPEG before canvas
  if (isHeic(file)) {
    sourceBlob = await convertHeicToBlob(file);
    outputType = 'image/jpeg';
  }

  // Step 2: Decode to ImageBitmap (browser-native, no EXIF carried)
  const bitmap = await createImageBitmap(sourceBlob);

  // Step 3: Draw onto OffscreenCanvas (strips all metadata)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  // Step 4: Export as original format (HEIC always becomes JPEG)
  const quality = outputType === 'image/png' ? undefined : 0.95;
  const blob = await canvas.convertToBlob({ type: outputType, quality });
  return blob;
}

export function getOutputFilename(file: File): string {
  const name = file.name;
  const dotIdx = name.lastIndexOf('.');
  const base = dotIdx !== -1 ? name.slice(0, dotIdx) : name;
  const ext = isHeic(file) ? 'jpg' : dotIdx !== -1 ? name.slice(dotIdx + 1) : 'jpg';
  return `${base}_datclean.${ext}`;
}

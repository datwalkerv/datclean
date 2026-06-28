/**
 * POST /api/exif
 *
 * Strips ALL metadata (EXIF, XMP, IPTC, ICC profile comments) from an uploaded
 * image and returns the cleaned file. Processing is done server-side via sharp —
 * the original pixel data is preserved at full resolution in the original format
 * (HEIC/HEIF is converted to JPEG since browsers cannot render it natively).
 *
 * Accepts:  multipart/form-data  with a single file field named "image"
 * Returns:  The cleaned image binary with the appropriate Content-Type
 *
 * Max upload size: 50 MB
 */

import sharp from 'sharp';
import { NextRequest } from 'next/server';

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    // ── 1. Validate Content-Type ─────────────────────────────────────────────
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return Response.json(
        { error: 'Request must be multipart/form-data' },
        { status: 415, headers: CORS_HEADERS },
      );
    }

    // ── 2. Extract file from form data ───────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return Response.json(
        { error: 'Missing "image" field in form data' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // ── 3. Read buffer & enforce size limit ──────────────────────────────────
    const arrayBuffer = await (file as File).arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return Response.json(
        { error: `File too large. Maximum allowed size is ${MAX_BYTES / 1024 / 1024} MB.` },
        { status: 413, headers: CORS_HEADERS },
      );
    }

    const inputBuffer = Buffer.from(arrayBuffer);
    const originalSize = arrayBuffer.byteLength;

    // ── 4. Detect format ─────────────────────────────────────────────────────
    const metadata = await sharp(inputBuffer, { failOn: 'none' }).metadata();
    const format = metadata.format; // 'jpeg' | 'png' | 'webp' | 'avif' | 'heif' | 'tiff' | 'gif'

    // ── 5. Re-encode (sharp strips metadata by default on format conversion) ─
    // Map detected format → output settings
    type FormatConfig = {
      mime: string;
      ext: string;
      pipeline: (img: sharp.Sharp) => sharp.Sharp;
    };

    const FORMAT_MAP: Record<string, FormatConfig> = {
      png:  { mime: 'image/png',  ext: 'png',  pipeline: (img) => img.png() },
      webp: { mime: 'image/webp', ext: 'webp', pipeline: (img) => img.webp({ quality: 95 }) },
      avif: { mime: 'image/avif', ext: 'avif', pipeline: (img) => img.avif({ quality: 85 }) },
      tiff: { mime: 'image/tiff', ext: 'tiff', pipeline: (img) => img.tiff() },
      gif:  { mime: 'image/gif',  ext: 'gif',  pipeline: (img) => img.gif() },
    };

    // Default (jpeg) + heif/heic → jpeg
    const config: FormatConfig = FORMAT_MAP[format ?? ''] ?? {
      mime: 'image/jpeg',
      ext: 'jpg',
      pipeline: (img) => img.jpeg({ quality: 95, mozjpeg: true }),
    };

    const outputBuffer = await config.pipeline(
      sharp(inputBuffer, { failOn: 'none' }),
    ).toBuffer();

    // ── 6. Build filename ────────────────────────────────────────────────────
    const originalName = (file as File).name ?? `image.${config.ext}`;
    const baseName = originalName.replace(/\.[^.]+$/, '');
    const outputFilename = `${baseName}_datclean.${config.ext}`;

    // ── 7. Return cleaned image ──────────────────────────────────────────────
    return new Response(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': config.mime,
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': String(outputBuffer.byteLength),
        'X-Original-Format': format ?? 'unknown',
        'X-Original-Size': String(originalSize),
        'X-Output-Size': String(outputBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error('[/api/exif] Error:', err);
    return Response.json(
      { error: 'Failed to process image', detail: String(err) },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

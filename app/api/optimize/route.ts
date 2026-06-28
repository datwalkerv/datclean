/**
 * POST /api/optimize
 *
 * Full optimization pipeline:
 *  1. Strips ALL metadata (EXIF, XMP, IPTC) via sharp
 *  2. Resizes: if height > 720px → scales down to 720px (preserves aspect ratio)
 *  3. Exports as WebP at 90% quality
 *
 * HEIC/HEIF files are fully supported — sharp uses libheif under the hood.
 *
 * Accepts:  multipart/form-data  with a single file field named "image"
 * Returns:  The optimized WebP binary
 *
 * Response headers include:
 *   X-Original-Width, X-Original-Height — source dimensions
 *   X-Output-Width, X-Output-Height     — output dimensions
 *   X-Was-Resized                       — "true" | "false"
 *   X-Original-Size, X-Output-Size      — sizes in bytes
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
const MAX_HEIGHT = 720;             // px — resize threshold

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

    // ── 4. Read original dimensions ──────────────────────────────────────────
    const { width: originalWidth = 0, height: originalHeight = 0 } = await sharp(inputBuffer, {
      failOn: 'none',
    }).metadata();

    // ── 5. Compute output dimensions ─────────────────────────────────────────
    let outputWidth = originalWidth;
    let outputHeight = originalHeight;
    let wasResized = false;

    if (originalHeight > MAX_HEIGHT) {
      const scale = MAX_HEIGHT / originalHeight;
      outputWidth = Math.round(originalWidth * scale);
      outputHeight = MAX_HEIGHT;
      wasResized = true;
    }

    // ── 6. Build sharp pipeline ──────────────────────────────────────────────
    //    sharp strips metadata by default when converting formats.
    //    We resize (if needed) then export as WebP @ 90% quality.
    let pipeline = sharp(inputBuffer, { failOn: 'none' });

    if (wasResized) {
      pipeline = pipeline.resize(outputWidth, outputHeight, {
        fit: 'fill',     // exact target dimensions (we computed them ourselves)
        kernel: 'lanczos3',
      });
    }

    const outputBuffer = await pipeline
      .webp({ quality: 90 })
      .toBuffer();

    // ── 7. Build filename ────────────────────────────────────────────────────
    const originalName = (file as File).name ?? 'image';
    const baseName = originalName.replace(/\.[^.]+$/, '');
    const outputFilename = `${baseName}_opt.webp`;

    // ── 8. Return optimized image ────────────────────────────────────────────
    return new Response(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/webp',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
        'Content-Length': String(outputBuffer.byteLength),
        'X-Original-Width': String(originalWidth),
        'X-Original-Height': String(originalHeight),
        'X-Output-Width': String(outputWidth),
        'X-Output-Height': String(outputHeight),
        'X-Was-Resized': String(wasResized),
        'X-Original-Size': String(originalSize),
        'X-Output-Size': String(outputBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error('[/api/optimize] Error:', err);
    return Response.json(
      { error: 'Failed to process image', detail: String(err) },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

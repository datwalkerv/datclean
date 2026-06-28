<div align="center">

<img src="https://raw.githubusercontent.com/datwalkerv/datclean/refs/heads/main/public/icon.svg" width="10%" alt="datclean" style="border-radius: 18%;box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);" />

# datclean

**Clean your photos. Protect your privacy.**

Strip GPS coordinates, device info, timestamps, and all hidden EXIF metadata from your photos instantly, entirely in your browser. Zero uploads. Zero traces.

</div>

## 🗂️ Pages

### 🛡️ Clean Images (`/`)
Remove all EXIF metadata from your photos while keeping the original file format and full resolution. Inspect exactly what's hiding in your files before stripping.

### ⚡ Optimize Images (`/optimize`)
The full pipeline in one click — strips all EXIF metadata, resizes images taller than 720px down proportionally, and exports everything as WebP. Perfect for preparing photos for the web.


## ✨ Key Features

- **🔒 100% Client-Side Processing**: Every byte of browser-based processing happens inside your tab. Your images are never read by anyone but you.
- **🌐 Public REST API**: Two open endpoints — `/api/exif` and `/api/optimize` — let anyone integrate datclean into their own apps. No API key required, full CORS support.
- **📦 Batch Support**: Drop tens of files at once and clean or optimize them all with a single click, with per-file metadata inspection.
- **🗺️ GPS & EXIF Stripping**: Removes GPS coordinates, device model, timestamps, camera settings, and all hidden metadata fields.
- **⚡ Image Optimization**: Resize tall images to 720px height (proportional), convert to WebP at 90% quality.
- **📱 HEIC Support**: Full support for iPhone HEIC photos — converted and cleaned in-browser and via the API using libheif.
- **🔍 Metadata Preview**: Inspect exactly what metadata is hiding in your files before deciding to strip it.
- **💚 Always Free**: No subscriptions, no sign-ups, no paywalls. Open source and free forever.


## 🌐 Public API

datclean exposes two public REST endpoints that anyone can call — no API key required.

### `POST /api/exif`

Strips **all metadata** (EXIF, XMP, IPTC) from an image while keeping the original format and full resolution.

| Detail | Value |
|---|---|
| Method | `POST` |
| Content-Type | `multipart/form-data` |
| Field name | `image` |
| Max file size | 50 MB |
| Supported formats | JPEG, PNG, WebP, AVIF, TIFF, GIF, HEIC/HEIF |
| Output format | Same as input (HEIC → JPEG) |

**Response headers**

| Header | Description |
|---|---|
| `Content-Type` | MIME type of the output image |
| `Content-Disposition` | Suggested filename (e.g. `photo_datclean.jpg`) |
| `X-Original-Format` | Detected input format (e.g. `jpeg`, `heif`) |
| `X-Original-Size` | Input file size in bytes |
| `X-Output-Size` | Output file size in bytes |

---

### `POST /api/optimize`

Full optimization pipeline: strips metadata → resizes to max 720 px height (proportional) → exports as **WebP at 90% quality**.

| Detail | Value |
|---|---|
| Method | `POST` |
| Content-Type | `multipart/form-data` |
| Field name | `image` |
| Max file size | 50 MB |
| Supported formats | JPEG, PNG, WebP, AVIF, TIFF, GIF, HEIC/HEIF |
| Output format | `image/webp` |

**Response headers**

| Header | Description |
|---|---|
| `Content-Type` | Always `image/webp` |
| `Content-Disposition` | Suggested filename (e.g. `photo_opt.webp`) |
| `X-Original-Width` / `X-Original-Height` | Source dimensions in pixels |
| `X-Output-Width` / `X-Output-Height` | Output dimensions in pixels |
| `X-Was-Resized` | `"true"` if the image was scaled down, `"false"` otherwise |
| `X-Original-Size` | Input file size in bytes |
| `X-Output-Size` | Output file size in bytes |

---

### Error responses

All errors return JSON with an `error` field and an appropriate HTTP status code.

| Status | Meaning |
|---|---|
| `400` | Missing `image` field |
| `413` | File exceeds 50 MB limit |
| `415` | Wrong Content-Type (must be `multipart/form-data`) |
| `500` | Processing failed (invalid or corrupt image) |


## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime & View Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS-level custom theme variables
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **EXIF Reading**: [exifr](https://github.com/MikeKovarik/exifr)
- **HEIC Conversion**: [heic2any](https://github.com/alexcorvi/heic2any)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) (Body) & [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (Headings)


## ⚖️ Disclaimer & Privacy

### How It Works

**Clean Images pipeline:**
- Decodes your image into an `ImageBitmap` (browser-native, strips all metadata in memory)
- Redraws pixel data onto an `OffscreenCanvas` at original resolution
- Exports in the original format (JPEG, PNG, WebP, TIFF — HEIC becomes JPEG)

**Optimize Images pipeline:**
- Same EXIF stripping via `OffscreenCanvas`
- If image height exceeds 720px, scales down proportionally (e.g. 4000×3000 → 960×720)
- Exports as **WebP** at 90% quality for maximum browser compatibility and compression

Both pipelines run entirely in your browser tab. No data ever leaves your device.

### Privacy & Data Policy
- datclean is built privacy-first by design. There are no databases, no analytics, no tracking, and no servers receiving your data.
- We do not collect, store, or receive **any** information about you or your files.

<br>

**Made with love for love. 💚**  

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

- **🔒 100% Client-Side Processing**: Every byte of processing happens inside your browser. Your images are never read by anyone but you.
- **🚫 No Servers, No Uploads**: Zero servers receive your photos. No API calls, no third-party processing — it's architecturally impossible.
- **📦 Batch Support**: Drop tens of files at once and clean or optimize them all with a single click, with per-file metadata inspection.
- **🗺️ GPS & EXIF Stripping**: Removes GPS coordinates, device model, timestamps, camera settings, and all hidden metadata fields.
- **⚡ Image Optimization**: Resize tall images to 720px height (proportional), convert to WebP at 90% quality — all in-browser.
- **📱 HEIC Support**: Full support for iPhone HEIC photos — converted and cleaned entirely in-browser using heic2any.
- **🔍 Metadata Preview**: Inspect exactly what metadata is hiding in your files before deciding to strip it.
- **💚 Always Free**: No subscriptions, no sign-ups, no paywalls. Open source and free forever.


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

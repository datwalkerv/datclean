<div align="center">

<img src="https://raw.githubusercontent.com/datwalkerv/datclean/refs/heads/main/public/icon.svg" width="10%" alt="datclean" style="border-radius: 18%;box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);" />

# datclean

**Clean your photos. Protect your privacy.**

Strip GPS coordinates, device info, timestamps, and all hidden EXIF metadata from your photos instantly, entirely in your browser. Zero uploads. Zero traces.

</div>

## ✨ Key Features

- **🔒 100% Client-Side Processing**: Every byte of processing happens inside your browser. Your images are never read by anyone but you.
- **🚫 No Servers, No Uploads**: Zero servers receive your photos. No API calls, no third-party processing — it's architecturally impossible.
- **📦 Batch Support**: Drop tens of files at once and clean them all with a single click, with per-file metadata inspection before stripping.
- **🗺️ GPS & EXIF Stripping**: Removes GPS coordinates, device model, timestamps, camera settings, and all hidden metadata fields.
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
- datclean uses the browser's native **Canvas API** to redraw your image pixels onto a clean canvas, producing a new file with zero metadata attached.
- The process happens entirely within your browser tab, no data ever leaves your device.
- HEIC files from iPhones are first decoded in-browser via `heic2any`, then cleaned through the same pipeline.

### Privacy & Data Policy
- datclean is built privacy-first by design. There are no databases, no analytics, no tracking, and no servers receiving your data.
- We do not collect, store, or receive **any** information about you or your files.

<br>

**Made with love for love. 💚**  

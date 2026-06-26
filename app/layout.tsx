import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DatClean — Remove EXIF Metadata From Photos",
  description:
    "Strip GPS coordinates, device info, timestamps and all hidden metadata from your photos — 100% client-side, no uploads, completely free and private.",
  keywords: [
    "exif remover",
    "metadata cleaner",
    "photo privacy",
    "strip gps data",
    "remove exif",
    "image privacy",
    "heic exif remover",
  ],
  openGraph: {
    title: "DatClean — Remove EXIF Metadata From Photos",
    description:
      "Strip GPS, device info and all hidden metadata from your photos — 100% in your browser. No uploads ever.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="noise">{children}</body>
    </html>
  );
}

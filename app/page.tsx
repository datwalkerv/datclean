'use client';

import { useState, useCallback } from 'react';
import DropZone from '@/components/DropZone';
import FileQueue from '@/components/FileQueue';
import BeforeAfterSection from '@/components/BeforeAfterSection';
import AdvantagesSection from '@/components/AdvantagesSection';
import Footer from '@/components/Footer';
import { Shield, ChevronDown } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [queueKey, setQueueKey] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);

    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setQueueKey((k) => k + 1);
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section id="hero" className="section" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">

          {/* Nav bar */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black"
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  letterSpacing: '-0.04em',
                  boxShadow: '0 0 12px var(--accent-glow)',
                }}
              >
                dc
              </div>
              <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                datclean
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="#before-after"
                className="text-sm hidden sm:block transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                How it works
              </a>
              <a
                href="#advantages"
                className="text-sm hidden sm:block transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Features
              </a>
            </div>
          </nav>

          {/* Hero text */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(57,255,20,0.08)',
                border: '1px solid rgba(57,255,20,0.2)',
                color: 'var(--accent)',
              }}
            >
              <Shield className="w-3 h-3" />
              100% client-side · No uploads · Always free
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Clean your photos.
              <br />
              <span className="text-glow" style={{ color: 'var(--accent)' }}>
                Protect your privacy.
              </span>
            </h1>

            <p
              className="text-base sm:text-lg max-w-xl mx-auto mb-8"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              Strip GPS coordinates, device info, timestamps and all hidden EXIF metadata
              from your photos — instantly, entirely in your browser. Zero uploads. Zero traces.
            </p>
          </div>

          {/* Drop zone */}
          <div
            className="max-w-2xl mx-auto animate-fade-in animate-delay-200"
          >
            <DropZone onFiles={handleFiles} disabled={false} />
          </div>

          {/* Scroll hint */}
          {files.length === 0 && (
            <div className="flex justify-center mt-10 animate-fade-in animate-delay-400">
              <a
                href="#before-after"
                className="flex flex-col items-center gap-1 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                See what&apos;s hiding in your photos
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Results (batch queue) ──────────────────────────────────────── */}
      {files.length > 0 && (
        <section
          id="results"
          className="section-sm"
          style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}
        >
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Metadata Analysis
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Review detected metadata and strip it from your files
                </p>
              </div>
            </div>

            <FileQueue key={queueKey} files={files} onClear={handleClear} />
          </div>
        </section>
      )}

      {/* ── Before / After ────────────────────────────────────────────── */}
      <BeforeAfterSection />

      {/* ── Advantages ────────────────────────────────────────────────── */}
      <AdvantagesSection />

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}

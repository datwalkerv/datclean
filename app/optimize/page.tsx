'use client';

import { useState, useCallback } from 'react';
import DropZone from '@/components/DropZone';
import OptimizeQueue from '@/components/OptimizeQueue';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Zap, ChevronDown } from 'lucide-react';

export default function OptimizePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [queueKey, setQueueKey] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setQueueKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section id="hero" className="section" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">

          <Navbar activePage="optimize" />

          {/* Hero text */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(57,255,20,0.08)',
                border: '1px solid rgba(57,255,20,0.2)',
                color: 'var(--accent)',
              }}
            >
              <Zap className="w-3 h-3" />
              EXIF stripped · Resized to 720p · Exported as WebP
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Optimize your photos.
              <br />
              <span className="text-glow" style={{ color: 'var(--accent)' }}>
                Smaller. Faster. Cleaner.
              </span>
            </h1>

            <p
              className="text-base sm:text-lg max-w-xl mx-auto mb-8"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              Strip all hidden metadata, resize tall images to 720px, and convert to WebP —
              entirely in your browser. Zero uploads. Maximum performance.
            </p>
          </div>

          {/* Drop zone */}
          <div className="max-w-2xl mx-auto animate-fade-in animate-delay-200">
            <DropZone onFiles={handleFiles} disabled={false} />
          </div>

          {/* Scroll hint */}
          {files.length === 0 && (
            <div className="flex justify-center mt-10 animate-fade-in animate-delay-400">
              <div className="flex flex-col items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-6">
                  {[
                    { step: '01', label: 'Drop images' },
                    { step: '02', label: 'Review EXIF & dims' },
                    { step: '03', label: 'Download WebP' },
                  ].map(({ step, label }) => (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {step}
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <ChevronDown className="w-4 h-4 animate-bounce mt-1" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────────────── */}
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
                <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Optimization Queue
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Review metadata · strip EXIF · resize to 720p max · export WebP
                </p>
              </div>
            </div>

            <OptimizeQueue key={queueKey} files={files} onClear={handleClear} />
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}

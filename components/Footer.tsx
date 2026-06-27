'use client';

import { GitFork, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="section-sm"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="flex items-center gap-3">
              {/* dc monogram */}
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm tracking-tight"
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  boxShadow: '0 0 16px var(--accent-glow)',
                }}
              >
                dc
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  datclean
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Privacy-first metadata cleaner
                </p>
              </div>
            </div>

            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by{' '}
              <a href="https://github.com/datwalkerv" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                datwalkerv
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center sm:items-end gap-4">
            <div className="flex items-center gap-4">
              <a
                id="footer-github-link"
                href="https://github.com/datwalkerv/datclean"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <GitFork className="w-4 h-4" />
                GitHub
              </a>

              <span style={{ color: 'var(--border)' }}>·</span>

              <a
                id="footer-donate-link"
                href="https://revolut.me/balagbalint/pocket/4wmvhlFQAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Heart className="w-4 h-4" />
                Donate
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Disclaimer */}
            <p
              className="text-xs text-center sm:text-right max-w-xs leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              DatClean processes all images entirely in your browser. No data is ever
              collected, transmitted, or stored.
            </p>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} datclean · Open source · Free forever
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}

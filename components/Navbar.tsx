'use client';

import Link from 'next/link';

interface NavbarProps {
  activePage: 'clean' | 'optimize';
}

export default function Navbar({ activePage }: NavbarProps) {
  const navLinkBase = 'text-sm px-3 py-1.5 rounded-lg transition-all duration-200';

  return (
    <nav className="flex items-center justify-between mb-16">
      {/* Logo → home */}
      <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
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
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {/* Anchor links only shown on home page */}
        {activePage === 'clean' && (
          <>
            <a
              href="#before-after"
              className={`${navLinkBase} hidden sm:block`}
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              How it works
            </a>
            <a
              href="#advantages"
              className={`${navLinkBase} hidden sm:block`}
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Features
            </a>
          </>
        )}

        {/* Clean images link */}
        <Link
          href="/"
          className={`${navLinkBase} hidden sm:flex items-center gap-1.5`}
          style={{
            color: activePage === 'clean' ? 'var(--accent)' : 'var(--text-secondary)',
            background: activePage === 'clean' ? 'rgba(57,255,20,0.08)' : 'transparent',
            border: activePage === 'clean' ? '1px solid rgba(57,255,20,0.2)' : '1px solid transparent',
          }}
        >
          Clean images
        </Link>

        {/* Optimize images link */}
        <Link
          href="/optimize"
          className={`${navLinkBase} flex items-center gap-1.5`}
          style={{
            color: activePage === 'optimize' ? 'var(--accent)' : 'var(--text-secondary)',
            background: activePage === 'optimize' ? 'rgba(57,255,20,0.08)' : 'transparent',
            border: activePage === 'optimize' ? '1px solid rgba(57,255,20,0.2)' : '1px solid transparent',
          }}
        >
          Optimize images
        </Link>
      </div>
    </nav>
  );
}

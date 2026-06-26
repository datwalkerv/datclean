'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield, Server, DollarSign, Zap, Globe, Lock,
  Smartphone, FileCheck
} from 'lucide-react';

interface Advantage {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: boolean;
}

const ADVANTAGES: Advantage[] = [
  {
    icon: Lock,
    title: '100% Client-Side',
    description:
      'Every byte of processing happens inside your browser. Your images are never read by anyone but you.',
    accent: true,
  },
  {
    icon: Server,
    title: 'No Servers',
    description:
      'There are zero servers receiving your photos. No uploads. No API calls. No third-party processing.',
  },
  {
    icon: DollarSign,
    title: 'Always Free',
    description:
      'No subscriptions, no sign-ups, no paywalls. DatClean is open source and free forever.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description:
      'Using the native browser Canvas API, metadata is stripped in milliseconds — no waiting for uploads.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Built for journalists, activists, healthcare workers — anyone who needs true photo privacy.',
  },
  {
    icon: Globe,
    title: 'Works Offline',
    description:
      'Once loaded, DatClean requires no internet connection to process your images.',
  },
  {
    icon: Smartphone,
    title: 'HEIC Support',
    description:
      'Full support for iPhone HEIC photos — converted and cleaned entirely in-browser using heic2any.',
  },
  {
    icon: FileCheck,
    title: 'Batch Processing',
    description:
      'Drop tens of files at once. Clean them all with a single click — see per-file metadata before and after.',
  },
];

export default function AdvantagesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="advantages" className="section" ref={ref}>
      <div className="container">
        {/* Heading */}
        <div className={`text-center mb-12 reveal ${visible ? 'visible' : ''}`}>
          <span className="badge badge-success mb-4" style={{ fontSize: '0.8rem' }}>
            Why DatClean
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Built different, by design
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Most &ldquo;privacy tools&rdquo; upload your files to clean them. DatClean never touches your data —
            it can&apos;t, by design.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADVANTAGES.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.title}
                className={`card p-5 flex flex-col gap-3 reveal ${visible ? 'visible' : ''} ${adv.accent ? 'glow-accent-sm' : ''}`}
                style={{
                  transitionDelay: `${i * 0.06}s`,
                  borderColor: adv.accent ? 'rgba(57,255,20,0.3)' : undefined,
                  background: adv.accent ? 'rgba(57,255,20,0.04)' : 'var(--bg-surface)',
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background: adv.accent ? 'rgba(57,255,20,0.12)' : 'var(--bg-elevated)',
                    border: `1px solid ${adv.accent ? 'rgba(57,255,20,0.2)' : 'var(--border)'}`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: adv.accent ? 'var(--accent)' : 'var(--text-secondary)' }}
                  />
                </div>

                <div>
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{ color: adv.accent ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {adv.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {adv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

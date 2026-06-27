'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Smartphone, Clock, Camera, FileText, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface LeakedItem {
  icon: React.ElementType;
  label: string;
  value: string;
  type: 'danger' | 'warning';
}

const LEAKED_ITEMS: LeakedItem[] = [
  { icon: MapPin,     label: 'GPS Location',    value: '48.8566°N, 2.3522°E  (Paris, France)', type: 'danger' },
  { icon: Smartphone, label: 'Device Model',     value: 'Apple iPhone 15 Pro',                  type: 'danger' },
  { icon: Clock,      label: 'Date & Time',      value: 'March 14, 2024 at 09:32:07 AM',        type: 'warning' },
  { icon: Camera,     label: 'Camera Settings',  value: 'f/1.8 · ISO 800 · 1/60s · 23mm',     type: 'warning' },
  { icon: FileText,   label: 'Software Version', value: 'iOS 17.3.1 · Photo 5.0',              type: 'danger' },
  { icon: MapPin,     label: 'GPS Altitude',     value: '53.2 metres above sea level',          type: 'warning' },
];

export default function BeforeAfterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="before-after" className="section" ref={ref}>
      <div className="container">
        {/* Heading */}
        <div className={`text-center mb-12 reveal ${visible ? 'visible' : ''}`}>
          <span className="badge badge-danger mb-4" style={{ fontSize: '0.8rem' }}>
            <AlertTriangle className="w-3 h-3" />
            The hidden danger
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold mt-3 mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Every photo you share leaks{' '}
            <span style={{ color: 'var(--accent)' }}>more than you think</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Hidden inside every JPEG, PNG and HEIC is a data trail — your exact location, device,
            timestamp and more. Here&apos;s what anyone can extract from an unclean photo.
          </p>
        </div>

        {/* Before / After grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BEFORE */}
          <div
            className={`card p-6 reveal ${visible ? 'visible' : ''}`}
            style={{
              transitionDelay: '0.1s',
              borderColor: 'rgba(255,68,68,0.3)',
              background: 'rgba(255,68,68,0.04)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--danger)', boxShadow: '0 0 6px rgba(255,68,68,0.5)' }}
              />
              <span className="font-semibold" style={{ color: '#ff6b6b' }}>
                Without datclean
              </span>
              <span className="badge badge-danger ml-auto">Exposed</span>
            </div>

            {/* Fake filename */}
            <div
              className="rounded-lg px-3 py-2 mb-4 text-xs font-mono flex items-center gap-2"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <Camera className="w-3 h-3 shrink-0" />
              IMG_20240314_093207.jpg · 4.2 MB
            </div>

            <div className="flex flex-col gap-3">
              {LEAKED_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg reveal ${visible ? 'visible' : ''}`}
                    style={{
                      background: item.type === 'danger'
                        ? 'rgba(255,68,68,0.06)'
                        : 'rgba(245,158,11,0.06)',
                      border: `1px solid ${item.type === 'danger' ? 'rgba(255,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                      transitionDelay: `${0.1 + i * 0.08}s`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: item.type === 'danger' ? '#ff6b6b' : '#fbbf24' }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold" style={{ color: item.type === 'danger' ? '#ff6b6b' : '#fbbf24' }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-mono mt-0.5 break-all" style={{ color: 'var(--text-secondary)' }}>
                        {item.value}
                      </p>
                    </div>
                    <AlertTriangle className="w-3 h-3 ml-auto shrink-0 mt-0.5" style={{ color: item.type === 'danger' ? '#ff6b6b' : '#fbbf24' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* AFTER */}
          <div
            className={`card p-6 reveal ${visible ? 'visible' : ''}`}
            style={{
              transitionDelay: '0.2s',
              borderColor: 'rgba(57,255,20,0.25)',
              background: 'rgba(57,255,20,0.03)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)' }}
              />
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                After datclean
              </span>
              <span className="badge badge-success ml-auto">Protected</span>
            </div>

            {/* Fake filename */}
            <div
              className="rounded-lg px-3 py-2 mb-4 text-xs font-mono flex items-center gap-2"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--accent)' }} />
              IMG_20240314_093207_clean.jpg · 4.1 MB
            </div>

            <div className="flex flex-col gap-3">
              {LEAKED_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg reveal ${visible ? 'visible' : ''}`}
                    style={{
                      background: 'rgba(57,255,20,0.04)',
                      border: '1px solid rgba(57,255,20,0.1)',
                      transitionDelay: `${0.2 + i * 0.08}s`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-through" style={{ color: 'var(--text-muted)' }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        [REMOVED]
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <X className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                      <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy meter */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(57,255,20,0.1)' }}>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                <span>Privacy score</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>100% protected</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: visible ? '100%' : '0%', transition: 'width 1.2s ease 0.5s' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stat row */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 reveal ${visible ? 'visible' : ''}`}
          style={{ transitionDelay: '0.4s' }}
        >
          {[
            { value: '200+', label: 'EXIF fields removed' },
            { value: '0 bytes', label: 'sent to any server' },
            { value: '<1s', label: 'processing time' },
            { value: '100%', label: 'free, always' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card p-4 text-center"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <p className="text-2xl font-bold text-glow" style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent)' }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

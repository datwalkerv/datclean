'use client';

import { ParsedExif } from '@/lib/exif-reader';
import { MapPin, Clock, Camera, Settings, User, FolderOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ExifDisplayProps {
  exif: ParsedExif;
  filename: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Location':      MapPin,
  'Time':          Clock,
  'Camera & Device': Camera,
  'Technical':     Settings,
  'Identity':      User,
  'File Info':     FolderOpen,
};

export default function ExifDisplay({ exif, filename }: ExifDisplayProps) {
  if (!exif.categories.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--accent)' }} />
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No metadata found</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {filename} appears to have no EXIF data.
        </p>
      </div>
    );
  }

  const sensitiveCount = exif.categories
    .flatMap((c) => c.fields)
    .filter((f) => f.sensitive).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-danger flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {exif.rawCount} metadata fields
        </span>
        {exif.hasGps && (
          <span className="badge badge-danger flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            GPS location exposed
          </span>
        )}
        {sensitiveCount > 0 && (
          <span className="badge badge-warning">
            {sensitiveCount} sensitive fields
          </span>
        )}
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filename}
        </span>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {exif.categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.label] ?? FolderOpen;
          return (
            <div
              key={cat.label}
              className="card p-4 flex flex-col gap-3"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-md"
                  style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.15)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {cat.icon} {cat.label}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {cat.fields.map((field) => (
                  <div key={field.key} className="flex items-start justify-between gap-2">
                    <span
                      className="text-xs shrink-0"
                      style={{ color: 'var(--text-muted)', minWidth: 100 }}
                    >
                      {field.label}
                    </span>
                    <span
                      className={`text-xs text-right break-all font-mono ${field.sensitive ? '' : ''}`}
                      style={{
                        color: field.sensitive ? '#ff9b9b' : 'var(--text-secondary)',
                        maxWidth: 200,
                      }}
                    >
                      {field.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

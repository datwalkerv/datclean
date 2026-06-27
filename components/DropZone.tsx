'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/tiff', 'image/heic', 'image/heif',
  'image/heic-sequence', 'image/heif-sequence',
];
const ACCEPTED_EXT = /\.(jpe?g|png|webp|tiff?|heic|heif)$/i;

function filterImageFiles(rawFiles: FileList | File[]): { valid: File[]; rejectedCount: number } {
  const all = Array.from(rawFiles);
  const valid = all.filter(
    (f) => ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXT.test(f.name)
  );
  return { valid, rejectedCount: all.length - valid.length };
}

export default function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const { valid, rejectedCount } = filterImageFiles(e.dataTransfer.files);
      if (rejectedCount > 0) {
        toast.error(
          rejectedCount === 1
            ? '1 file was skipped — unsupported format.'
            : `${rejectedCount} files were skipped — unsupported format.`,
          { description: 'Accepted: JPEG, PNG, WebP, TIFF, HEIC' }
        );
      }
      if (valid.length) onFiles(valid);
    },
    [onFiles, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const { valid, rejectedCount } = filterImageFiles(e.target.files);
    if (rejectedCount > 0) {
      toast.error(
        rejectedCount === 1
          ? '1 file was skipped — unsupported format.'
          : `${rejectedCount} files were skipped — unsupported format.`,
        { description: 'Accepted: JPEG, PNG, WebP, TIFF, HEIC' }
      );
    }
    if (valid.length) onFiles(valid);
    e.target.value = '';
  };

  return (
    <div
      className={`dropzone flex flex-col items-center justify-center gap-5 p-10 cursor-pointer select-none transition-all ${
        dragOver ? 'drag-over' : ''
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={{ minHeight: 240 }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Drop images or click to select"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        className="hidden"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.heic,.heif"
        onChange={handleChange}
      />

      {/* Icon */}
      <div
        className={`relative flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 ${
          dragOver ? 'glow-accent bg-[rgba(57,255,20,0.08)]' : 'bg-[var(--bg-elevated)]'
        }`}
        style={{ border: `1px solid ${dragOver ? 'var(--accent)' : 'var(--border)'}` }}
      >
        {dragOver ? (
          <Upload className="w-8 h-8 text-accent animate-bounce" style={{ color: 'var(--accent)' }} />
        ) : (
          <ImageIcon className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {dragOver ? (
            <span style={{ color: 'var(--accent)' }}>Drop to clean</span>
          ) : (
            <>Drop your photos here</>
          )}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          or <span className="underline cursor-pointer" style={{ color: 'var(--accent)' }}>click to browse</span>
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          JPEG · PNG · WebP · TIFF · HEIC · batch supported
        </p>
      </div>
    </div>
  );
}

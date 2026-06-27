'use client';

import { useState, useEffect, useRef } from 'react';
import { readExif, ParsedExif } from '@/lib/exif-reader';
import { optimizeImage, getOptimizeFilename, OptimizeResult } from '@/lib/image-optimizer';
import ExifDisplay from './ExifDisplay';
import {
  Download, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, X, Zap, ArrowRight, Image as ImageIcon,
} from 'lucide-react';

type OptStatus = 'idle' | 'reading' | 'ready' | 'optimizing' | 'done' | 'error';

interface OptItem {
  id: string;
  file: File;
  status: OptStatus;
  exif: ParsedExif | null;
  result: OptimizeResult | null;
  cleanBlob: Blob | null;
  outputName: string;
  error: string | null;
  expanded: boolean;
  preview: string | null;
}

interface OptimizeQueueProps {
  files: File[];
  onClear: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function savingsPct(original: number, output: number): number {
  return Math.round((1 - output / original) * 100);
}

export default function OptimizeQueue({ files, onClear }: OptimizeQueueProps) {
  const [items, setItems] = useState<OptItem[]>([]);
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newItems: OptItem[] = [];

    for (const f of files) {
      const sig = `${f.name}-${f.size}-${f.lastModified}`;
      if (processedIds.current.has(sig)) continue;
      processedIds.current.add(sig);

      newItems.push({
        id: `${sig}-${Math.random()}`,
        file: f,
        status: 'idle',
        exif: null,
        result: null,
        cleanBlob: null,
        outputName: getOptimizeFilename(f),
        error: null,
        expanded: false,
        preview: null,
      });
    }

    if (newItems.length === 0) return;

    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => readFile(item.id, item.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function updateItem(id: string, patch: Partial<OptItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function readFile(id: string, file: File) {
    updateItem(id, { status: 'reading', preview: URL.createObjectURL(file) });
    try {
      const exif = await readExif(file);
      updateItem(id, { status: 'ready', exif });
    } catch {
      updateItem(id, { status: 'error', error: 'Failed to read file metadata.' });
    }
  }

  async function processFile(id: string, file: File) {
    updateItem(id, { status: 'optimizing' });
    try {
      const result = await optimizeImage(file);
      updateItem(id, { status: 'done', result, cleanBlob: result.blob });
    } catch (e) {
      updateItem(id, { status: 'error', error: String(e) });
    }
  }

  function downloadFile(item: OptItem) {
    if (!item.cleanBlob) return;
    const url = URL.createObjectURL(item.cleanBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.outputName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function processAll() {
    const readyItems = items.filter((it) => it.status === 'ready');
    await Promise.all(readyItems.map((it) => processFile(it.id, it.file)));
  }

  function downloadAll() {
    items.filter((it) => it.status === 'done').forEach(downloadFile);
  }

  const allSettled = items.every(
    (it) => it.status === 'ready' || it.status === 'done' || it.status === 'error'
  );
  const anyReady   = items.some((it) => it.status === 'ready');
  const doneCount  = items.filter((it) => it.status === 'done').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {items.length} file{items.length !== 1 ? 's' : ''}
          </span>
          {doneCount > 0 && (
            <span className="badge badge-success">
              <CheckCircle2 className="w-3 h-3" />
              {doneCount} optimized
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {doneCount > 1 && allSettled && !anyReady && (
            <button id="download-all-opt-btn" className="btn-primary" onClick={downloadAll}>
              <Download className="w-4 h-4" />
              Download all ({doneCount})
            </button>
          )}
          {anyReady && allSettled && (
            <button id="optimize-all-btn" className="btn-primary animate-pulse-glow" onClick={processAll}>
              <Zap className="w-4 h-4" />
              Optimize all &amp; download
            </button>
          )}
          <button id="clear-opt-queue-btn" className="btn-ghost" onClick={onClear}>
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <OptCard
            key={item.id}
            item={item}
            onProcess={() => processFile(item.id, item.file)}
            onDownload={() => downloadFile(item)}
            onToggleExpand={() => updateItem(item.id, { expanded: !item.expanded })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Individual Optimize Card ────────────────────────────────────────────────

interface OptCardProps {
  item: OptItem;
  onProcess: () => void;
  onDownload: () => void;
  onToggleExpand: () => void;
}

function OptCard({ item, onProcess, onDownload, onToggleExpand }: OptCardProps) {
  const { status, result, exif, file } = item;
  const hasExif = exif !== null && exif.categories.length > 0;

  const statusLabel = (() => {
    const map: Record<OptStatus, string> = {
      idle:       'Waiting…',
      reading:    'Reading metadata…',
      ready:      'Ready to optimize',
      optimizing: 'Optimizing…',
      done:       'Optimized ✓',
      error:      'Error',
    };
    return map[status];
  })();

  const statusColor = (() => {
    const map: Record<OptStatus, string> = {
      idle:       'var(--text-muted)',
      reading:    'var(--accent)',
      ready:      'var(--warning)',
      optimizing: 'var(--accent)',
      done:       'var(--accent)',
      error:      'var(--danger)',
    };
    return map[status];
  })();

  const savings = result ? savingsPct(file.size, result.blob.size) : 0;

  return (
    <div className="card overflow-hidden" id={`opt-card-${item.id}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail */}
        <div
          className="shrink-0 w-12 h-12 rounded-lg overflow-hidden"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {item.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full skeleton" />
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
            title={file.name}
          >
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {(status === 'reading' || status === 'optimizing') && (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: statusColor }} />
            )}
            {status === 'done' && (
              <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            )}
            {status === 'error' && (
              <AlertCircle className="w-3 h-3" style={{ color: 'var(--danger)' }} />
            )}
            <span className="text-xs" style={{ color: statusColor }}>
              {status === 'error' ? item.error : statusLabel}
            </span>

            {/* Before/after size metrics (after done) */}
            {status === 'done' && result && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatSize(file.size)}
                </span>
                <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                  {formatSize(result.blob.size)}
                </span>
                {savings > 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    -{savings}%
                  </span>
                )}
              </>
            )}

            {/* Original size (before optimizing) */}
            {(status === 'ready' || status === 'reading') && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatSize(file.size)}
                </span>
              </>
            )}

            {/* Dimension info (after done) */}
            {status === 'done' && result && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <ImageIcon className="w-3 h-3" />
                  {result.originalWidth}×{result.originalHeight}
                  {result.wasResized && (
                    <>
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span style={{ color: 'var(--accent)' }}>
                        {result.outputWidth}×{result.outputHeight}
                      </span>
                    </>
                  )}
                </span>
                {result.wasResized && (
                  <span className="badge" style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                    background: 'rgba(57,255,20,0.1)',
                    border: '1px solid rgba(57,255,20,0.2)',
                    color: 'var(--accent)',
                  }}>
                    resized
                  </span>
                )}
              </>
            )}

            {/* EXIF badge */}
            {status === 'ready' && hasExif && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {exif!.rawCount} EXIF fields
                </span>
                {exif!.hasGps && (
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    GPS
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {status === 'ready' && (
            <button
              id={`optimize-btn-${item.id}`}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={onProcess}
            >
              <Zap className="w-3.5 h-3.5" />
              Optimize
            </button>
          )}
          {status === 'done' && (
            <button
              id={`download-opt-btn-${item.id}`}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={onDownload}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
          {/* Expand EXIF toggle */}
          {(hasExif || status === 'done') && (
            <button
              className="btn-ghost"
              style={{ padding: '0.45rem 0.6rem' }}
              onClick={onToggleExpand}
              aria-label="Toggle details"
            >
              {item.expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded panel — EXIF + size/dimension info */}
      {item.expanded && (
        <div
          className="border-t p-4 animate-fade-in flex flex-col gap-4"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
        >
          {/* Dimensions & size info */}
          {status === 'done' && result && (
            <div
              className="rounded-xl p-4 flex flex-wrap gap-6"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  File size
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatSize(file.size)}</span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    {formatSize(result.blob.size)}
                  </span>
                  {savings > 0 && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                      ({savings}% smaller)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Dimensions
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {result.originalWidth}×{result.originalHeight}px
                  </span>
                  {result.wasResized && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        {result.outputWidth}×{result.outputHeight}px
                      </span>
                    </>
                  )}
                  {!result.wasResized && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(unchanged)</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Format
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>WebP</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  EXIF
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Stripped ✓</span>
              </div>
            </div>
          )}

          {/* EXIF detail */}
          {exif && (
            <ExifDisplay exif={exif} filename={file.name} />
          )}
        </div>
      )}
    </div>
  );
}

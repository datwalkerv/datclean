'use client';

import { useState, useEffect, useRef } from 'react';
import { readExif, ParsedExif } from '@/lib/exif-reader';
import { stripExif, getOutputFilename } from '@/lib/exif-stripper';
import ExifDisplay from './ExifDisplay';
import {
  Download, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, X, Shield
} from 'lucide-react';

type FileStatus = 'idle' | 'reading' | 'ready' | 'stripping' | 'done' | 'error';

interface FileItem {
  id: string;
  file: File;
  status: FileStatus;
  exif: ParsedExif | null;
  cleanBlob: Blob | null;
  outputName: string;
  error: string | null;
  expanded: boolean;
  preview: string | null;
}

interface FileQueueProps {
  files: File[];
  onClear: () => void;
}

export default function FileQueue({ files, onClear }: FileQueueProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  // Track which file signatures we've already enqueued (name+size+lastModified)
  const processedIds = useRef<Set<string>>(new Set());

  // React to new files being added to the prop
  useEffect(() => {
    const newItems: FileItem[] = [];

    for (const f of files) {
      const sig = `${f.name}-${f.size}-${f.lastModified}`;
      if (processedIds.current.has(sig)) continue;
      processedIds.current.add(sig);

      newItems.push({
        id: `${sig}-${Math.random()}`,
        file: f,
        status: 'idle',
        exif: null,
        cleanBlob: null,
        outputName: getOutputFilename(f),
        error: null,
        expanded: false,
        preview: null,
      });
    }

    if (newItems.length === 0) return;

    setItems((prev) => [...prev, ...newItems]);
    // Start reading EXIF for newly added files
    newItems.forEach((item) => readFile(item.id, item.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function updateItem(id: string, patch: Partial<FileItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function readFile(id: string, file: File) {
    updateItem(id, { status: 'reading' });

    // Generate preview
    const preview = URL.createObjectURL(file);
    updateItem(id, { preview });

    try {
      const exif = await readExif(file);
      updateItem(id, { status: 'ready', exif });
    } catch {
      updateItem(id, { status: 'error', error: 'Failed to read file metadata.' });
    }
  }

  async function stripFile(id: string, file: File) {
    updateItem(id, { status: 'stripping' });
    try {
      const blob = await stripExif(file);
      updateItem(id, { status: 'done', cleanBlob: blob });
    } catch (e) {
      updateItem(id, { status: 'error', error: String(e) });
    }
  }

  function downloadFile(item: FileItem) {
    if (!item.cleanBlob) return;
    const url = URL.createObjectURL(item.cleanBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.outputName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function stripAll() {
    // Only strip files that actually have metadata
    const readyItems = items.filter(itemNeedsStrip);
    await Promise.all(readyItems.map((it) => stripFile(it.id, it.file)));
  }

  function downloadAll() {
    items.filter((it) => it.status === 'done').forEach(downloadFile);
  }

  // A file needs stripping only if it is ready AND has actual metadata categories
  const itemNeedsStrip = (it: FileItem) =>
    it.status === 'ready' && it.exif !== null && it.exif.categories.length > 0;

  const allSettled = items.every(
    (it) => it.status === 'ready' || it.status === 'done' || it.status === 'error'
  );
  const anyReady   = items.some(itemNeedsStrip);
  const allDone    = items
    .filter((it) => it.status !== 'error' && itemNeedsStrip(it) === false ? false : true)
    .filter((it) => it.status !== 'error')
    .every((it) => it.status === 'done' || (it.status === 'ready' && !itemNeedsStrip(it)));
  const doneCount  = items.filter((it) => it.status === 'done').length;
  const cleanCount = items.filter(
    (it) => it.status === 'ready' && (it.exif === null || it.exif.categories.length === 0)
  ).length;

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
              {doneCount} cleaned
            </span>
          )}
          {cleanCount > 0 && (
            <span className="badge badge-success">
              <CheckCircle2 className="w-3 h-3" />
              {cleanCount} already clean
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {doneCount > 1 && allSettled && !anyReady && (
            <button id="download-all-btn" className="btn-primary" onClick={downloadAll}>
              <Download className="w-4 h-4" />
              Download all ({doneCount})
            </button>
          )}
          {anyReady && allSettled && (
            <button id="strip-all-btn" className="btn-primary animate-pulse-glow" onClick={stripAll}>
              <Shield className="w-4 h-4" />
              Strip all & download
            </button>
          )}
          <button id="clear-queue-btn" className="btn-ghost" onClick={onClear}>
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            onStrip={() => stripFile(item.id, item.file)}
            onDownload={() => downloadFile(item)}
            onToggleExpand={() => updateItem(item.id, { expanded: !item.expanded })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Individual File Card ────────────────────────────────────────────────────

interface FileCardProps {
  item: FileItem;
  onStrip: () => void;
  onDownload: () => void;
  onToggleExpand: () => void;
}

function FileCard({ item, onStrip, onDownload, onToggleExpand }: FileCardProps) {

  // A 'ready' file with no EXIF categories is already clean
  const hasMetadata = item.exif !== null && item.exif.categories.length > 0;

  const statusLabel = (() => {
    if (item.status === 'ready') return hasMetadata ? 'Metadata found' : 'Already clean ✓';
    const map: Record<FileStatus, string> = {
      idle:     'Waiting…',
      reading:  'Reading metadata…',
      ready:    'Already clean ✓',
      stripping:'Stripping…',
      done:     'Cleaned ✓',
      error:    'Error',
    };
    return map[item.status];
  })();

  const statusColor = (() => {
    if (item.status === 'ready') return hasMetadata ? 'var(--warning)' : 'var(--accent)';
    const map: Record<FileStatus, string> = {
      idle:     'var(--text-muted)',
      reading:  'var(--accent)',
      ready:    'var(--accent)',
      stripping:'var(--accent)',
      done:     'var(--accent)',
      error:    'var(--danger)',
    };
    return map[item.status];
  })();

  const totalFields = item.exif?.rawCount ?? 0;
  const hasGps      = item.exif?.hasGps ?? false;

  return (
    <div className="card overflow-hidden" id={`file-card-${item.id}`}>
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
            title={item.file.name}
          >
            {item.file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {(item.status === 'reading' || item.status === 'stripping') && (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: statusColor }} />
            )}
            {(item.status === 'done' || (item.status === 'ready' && !hasMetadata)) && (
              <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            )}
            {item.status === 'error' && (
              <AlertCircle className="w-3 h-3" style={{ color: 'var(--danger)' }} />
            )}
            <span className="text-xs" style={{ color: statusColor }}>
              {item.status === 'error' ? item.error : statusLabel}
            </span>
            {item.status === 'ready' && totalFields > 0 && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {totalFields} fields
                </span>
                {hasGps && (
                  <>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      GPS
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {item.status === 'ready' && hasMetadata && (
            <button
              id={`strip-btn-${item.id}`}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={onStrip}
            >
              <Shield className="w-3.5 h-3.5" />
              Strip
            </button>
          )}
          {item.status === 'done' && (
            <button
              id={`download-btn-${item.id}`}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              onClick={onDownload}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
          {item.exif && item.exif.categories.length > 0 && (
            <button
              className="btn-ghost"
              style={{ padding: '0.45rem 0.6rem' }}
              onClick={onToggleExpand}
              aria-label="Toggle EXIF details"
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

      {/* Expanded EXIF */}
      {item.expanded && item.exif && (
        <div
          className="border-t p-4 animate-fade-in"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
        >
          <ExifDisplay exif={item.exif} filename={item.file.name} />
        </div>
      )}
    </div>
  );
}

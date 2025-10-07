"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Download, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileMetadata } from '@/types/file-sharing.types';
import { canPreviewFile } from '@/utils/file-security';

export interface FilePreviewProps {
  files: FileMetadata[];
  activeFileId?: string;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDownload?: (file: FileMetadata) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files, activeFileId, isOpen, onClose, onPrev, onNext, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const file = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen) return null;

  const unsupported = file && !canPreviewFile(file.mimeType);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          ref={containerRef}
          className="relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <div className="flex items-center justify-between border-b border-neutral-400 px-4 py-3">
            <div className="min-w-0 pr-3">
              <p className="truncate text-sm font-semibold text-neutral-800">{file?.name ?? 'Preview'}</p>
              {file && (
                <p className="truncate text-xs text-neutral-600">{file.mimeType} • {Math.round(file.size / 1024)} KB</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-400 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300/50"
                onClick={() => file && onDownload?.(file)}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden /> Download
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-neutral-400 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300/50"
                onClick={() => setIsFullscreen(v => !v)}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                onClick={onClose}
              >
                <X className="mr-1.5 h-4 w-4" aria-hidden /> Close
              </button>
            </div>
          </div>

          <div className={[
            'relative flex-1 bg-neutral-300',
            isFullscreen ? 'fixed inset-0 z-50' : '',
          ].join(' ')}>
            <div className="absolute inset-0 overflow-auto p-4">
              {!file && (
                <div className="flex h-full items-center justify-center text-neutral-600">No file selected</div>
              )}

              {file && unsupported && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-neutral-800">Preview not available for this file type</p>
                  <p className="mt-1 text-xs text-neutral-600">You can download the file instead.</p>
                </div>
              )}

              {file && !unsupported && (
                <div className="flex h-full items-center justify-center">
                  {file.mimeType.startsWith('image/') && file.url && (
                    <img loading="lazy" src={file.url} alt={file.name} className="max-h-[80vh] max-w-full rounded-md shadow" />
                  )}

                  {file.mimeType === 'application/pdf' && file.url && (
                    <iframe
                      title={file.name}
                      src={file.url}
                      className="h-[80vh] w-full rounded-md bg-white shadow"
                    />
                  )}

                  {(file.mimeType.startsWith('text/') || file.mimeType === 'text/csv') && file.url && (
                    <iframe
                      title={file.name}
                      src={file.url}
                      className="h-[80vh] w-full rounded-md bg-white shadow"
                    />
                  )}

                  {file.mimeType.startsWith('video/') && file.url && (
                    <video controls preload="metadata" className="max-h-[80vh] max-w-full rounded-md bg-black shadow">
                      <source src={file.url} type={file.mimeType} />
                    </video>
                  )}

                  {file.mimeType.startsWith('audio/') && file.url && (
                    <audio controls preload="metadata" className="w-full rounded-md bg-white p-2 shadow">
                      <source src={file.url} type={file.mimeType} />
                    </audio>
                  )}
                </div>
              )}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center p-3">
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-full bg-white/90 p-2 text-neutral-800 shadow hover:bg-white"
                onClick={onPrev}
                aria-label="Previous file"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center p-3">
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-full bg-white/90 p-2 text-neutral-800 shadow hover:bg-white"
                onClick={onNext}
                aria-label="Next file"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreview;



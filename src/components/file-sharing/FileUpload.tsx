"use client";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FileText, Film, Music, Archive, FileWarning } from 'lucide-react';
import { useFileSharing } from '@/hooks/use-file-sharing';
import { FileCategory } from '@/types/file-sharing.types';

type DragState = 'idle' | 'over' | 'reject';

function categoryIcon(category: FileCategory) {
  switch (category) {
    case 'image':
      return <ImageIcon className="h-5 w-5 text-primary-600" aria-hidden />;
    case 'video':
      return <Film className="h-5 w-5 text-primary-600" aria-hidden />;
    case 'audio':
      return <Music className="h-5 w-5 text-primary-600" aria-hidden />;
    case 'archive':
      return <Archive className="h-5 w-5 text-primary-600" aria-hidden />;
    case 'document':
      return <FileText className="h-5 w-5 text-primary-600" aria-hidden />;
    default:
      return <FileWarning className="h-5 w-5 text-primary-600" aria-hidden />;
  }
}

export interface FileUploadProps {
  className?: string;
  accept?: string; // input accept pattern
  disabled?: boolean;
  onFilesAdded?: (count: number) => void;
  uploadFiles?: (files: FileList) => Promise<void>;
  uploadProgress?: ReturnType<typeof useFileSharing>['uploadProgress'];
  isUploading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ className, accept, disabled, onFilesAdded, uploadFiles: uploadFilesProp, uploadProgress: uploadProgressProp, isUploading: isUploadingProp }) => {
  const hook = useFileSharing();
  const uploadFiles = uploadFilesProp ?? hook.uploadFiles;
  const uploadProgress = uploadProgressProp ?? hook.uploadProgress;
  const isUploading = isUploadingProp ?? hook.isUploading;
  const [dragState, setDragState] = useState<DragState>('idle');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasActiveUploads = uploadProgress.length > 0;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await uploadFiles(files);
    if (onFilesAdded) onFilesAdded(files.length);
  }, [onFilesAdded, uploadFiles]);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState('idle');
    await handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState('over');
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState('idle');
  }, []);

  const borderClasses = useMemo(() => {
    if (dragState === 'over') return 'border-primary-500 bg-primary-50';
    if (dragState === 'reject') return 'border-destructive bg-destructive/5';
    return 'border-neutral-400 hover:border-primary-400';
  }, [dragState]);

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'group relative flex w-full flex-col items-center justify-center rounded-lg',
          'border-2 border-dashed transition-colors',
          'bg-neutral-300/50 p-6 md:p-8',
          borderClasses,
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <div className="pointer-events-none flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Upload className="h-8 w-8 text-primary-600 transition-transform group-hover:scale-105" aria-hidden />
            {dragState === 'over' && (
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary-500/10" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-800">Drag and drop files here</p>
            <p className="text-xs text-neutral-600">or click to browse</p>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1">{categoryIcon('document')} Documents</span>
            <span className="inline-flex items-center gap-1">{categoryIcon('image')} Images</span>
            <span className="inline-flex items-center gap-1">{categoryIcon('video')} Videos</span>
            <span className="hidden md:inline-flex items-center gap-1">{categoryIcon('audio')} Audio</span>
            <span className="hidden md:inline-flex items-center gap-1">{categoryIcon('archive')} Archives</span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={async (e) => {
            await handleFiles(e.target.files);
            // Reset input so same files can be selected again
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </div>

      {hasActiveUploads && (
        <div className="mt-4 space-y-2">
          {uploadProgress.map((p) => (
            <div key={p.fileId} className="rounded-md border border-neutral-400 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <p className="truncate text-sm font-medium text-neutral-800">{p.fileName}</p>
                  <p className="text-xs text-neutral-600">{p.status === 'uploading' ? 'Uploading…' : p.status === 'completed' ? 'Completed' : p.status === 'error' ? 'Error' : 'Pending'}</p>
                </div>
                <span className="text-xs font-semibold text-neutral-800">{Math.round(p.progress)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                <div
                  className="h-full bg-primary-500 transition-[width] duration-200 ease-in-out"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="mt-2 text-xs text-neutral-600">Please keep this tab open while uploads complete.</div>
      )}
    </div>
  );
};

export default FileUpload;



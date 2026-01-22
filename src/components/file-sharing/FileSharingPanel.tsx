"use client";
import React, { useMemo, useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileManager } from './FileManager';
import { FilePreview } from './FilePreview';
import { useFileSharing } from '@/hooks/use-file-sharing';
import { Progress } from '@radix-ui/react-progress';

export const FileSharingPanel: React.FC = () => {
  const {
    files,
    uploadProgress,
    folders,
    selectedFiles,
    isUploading,
    uploadFiles,
    deleteFile,
    selectFile,
    deselectFile,
    clearSelection,
    moveToFolder,
    incrementDownload,
  } = useFileSharing();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | undefined>(undefined);

  const totalStorage = 10 * 1024 * 1024 * 1024; // 10GB for demo
  const usedStorage = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const storagePct = Math.min(100, Math.round((usedStorage / totalStorage) * 100));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-400 bg-white p-4">
        <h2 className="text-base font-semibold text-neutral-800">Upload files</h2>
        <p className="mt-1 text-xs text-neutral-600">Drag and drop or click to select. Supported: images, PDFs, videos, audio, archives.</p>
        <div className="mt-3">
          <FileUpload
            uploadFiles={uploadFiles}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-400 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-800">Your files</h2>
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span>{files.length} files</span>
            <span>•</span>
            <span>{folders.length} folders</span>
          </div>
        </div>
        <div className="mt-3">
          <FileManager
            files={files}
            selectedIds={selectedFiles}
            onSelect={selectFile}
            onDeselect={deselectFile}
            onClearSelection={clearSelection}
            onDelete={async (ids) => {
              await Promise.all(ids.map(id => deleteFile(id)));
            }}
            onMove={(ids, folderId) => moveToFolder(ids, folderId)}
            onOpen={(id) => {
              setActiveFileId(id);
              setPreviewOpen(true);
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-400 bg-white p-4">
        <h2 className="text-base font-semibold text-neutral-800">Storage usage</h2>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>{storagePct}% used</span>
            <span>10 GB total</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-300">
            <div className="h-full bg-primary-500 transition-[width] duration-200 ease-in-out" style={{ width: `${storagePct}%` }} />
          </div>
        </div>
      </div>

      <FilePreview
        files={files}
        activeFileId={activeFileId}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onPrev={() => {
          if (!activeFileId || files.length === 0) return;
          const idx = files.findIndex(f => f.id === activeFileId);
          const prev = (idx - 1 + files.length) % files.length;
          setActiveFileId(files[prev].id);
        }}
        onNext={() => {
          if (!activeFileId || files.length === 0) return;
          const idx = files.findIndex(f => f.id === activeFileId);
          const next = (idx + 1) % files.length;
          setActiveFileId(files[next].id);
        }}
        onDownload={(file) => {
          if (!file.url) return;
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          incrementDownload(file.id);
        }}
      />
    </div>
  );
};

export default FileSharingPanel;



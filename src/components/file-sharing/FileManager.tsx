import React, { useMemo, useState, useDeferredValue } from 'react';
import { List, Grid2X2, Search, Trash2, FolderOpen, Download, MoveRight, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { FileCategory, FileMetadata } from '@/types/file-sharing.types';
import { formatFileSize } from '@/utils/file-security';

export interface FileManagerProps {
  files: FileMetadata[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
  onClearSelection: () => void;
  onDelete: (ids: string[]) => void;
  onMove: (ids: string[], folderId: string) => void;
  onOpen: (id: string) => void;
}

type ViewMode = 'grid' | 'list';

const categories: Array<{ key: FileCategory; label: string }> = [
  { key: 'document', label: 'Documents' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
  { key: 'audio', label: 'Audio' },
  { key: 'archive', label: 'Archives' },
  { key: 'other', label: 'Other' },
];

export const FileManager: React.FC<FileManagerProps> = ({ files, selectedIds, onSelect, onDeselect, onClearSelection, onDelete, onMove, onOpen }) => {
  const [view, setView] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FileCategory | 'all'>('all');
  type SortBy = 'date' | 'name' | 'size' | 'type';
  const SORT_OPTIONS = ['date', 'name', 'size', 'type'] as const;
  function isSortBy(v: string): v is SortBy {
    return (SORT_OPTIONS as readonly string[]).includes(v);
  }
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const deferredQuery = useDeferredValue(query);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filtered = useMemo(() => {
    let result = files;
    if (category !== 'all') result = result.filter(f => f.category === category);
    if (deferredQuery) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q)));
    }
    switch (sortBy) {
      case 'name':
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case 'size':
        return [...result].sort((a, b) => a.size - b.size);
      case 'type':
        return [...result].sort((a, b) => a.mimeType.localeCompare(b.mimeType));
      default:
        return [...result].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
  }, [files, category, deferredQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage]);
  const allSelected = paged.length > 0 && paged.every(f => selectedIds.includes(f.id));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-neutral-400 bg-white p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={['inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm', view === 'grid' ? 'border-primary-500 text-primary-600' : 'border-neutral-400 text-neutral-800'].join(' ')}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
          >
            <Grid2X2 className="mr-1.5 h-4 w-4" aria-hidden /> Grid
          </button>
          <button
            type="button"
            className={['inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm', view === 'list' ? 'border-primary-500 text-primary-600' : 'border-neutral-400 text-neutral-800'].join(' ')}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <List className="mr-1.5 h-4 w-4" aria-hidden /> List
          </button>
        </div>

        <div className="relative ml-auto max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            className="w-full rounded-md border border-neutral-400 bg-white pl-8 pr-3 py-1.5 text-sm text-neutral-800 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Search files"
          />
        </div>

        <select
          className="rounded-md border border-neutral-400 bg-white px-2.5 py-1.5 text-sm text-neutral-800"
          value={sortBy}
          onChange={(e) => {
            const val = e.target.value;
            if (isSortBy(val)) setSortBy(val);
          }}
          aria-label="Sort by"
        >
          <option value="date">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="size">Sort: Size</option>
          <option value="type">Sort: Type</option>
        </select>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-destructive px-2.5 py-1.5 text-sm font-medium text-white hover:opacity-90"
              onClick={() => onDelete(selectedIds)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden /> Delete
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-neutral-400 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300/50"
              onClick={() => onMove(selectedIds, 'inbox')}
            >
              <MoveRight className="mr-1.5 h-4 w-4" aria-hidden /> Move
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-neutral-400 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300/50"
              onClick={onClearSelection}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          className={['rounded-full px-3 py-1.5 text-xs', category === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-neutral-800 border border-neutral-400'].join(' ')}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.key}
            type="button"
            className={['rounded-full px-3 py-1.5 text-xs', category === c.key ? 'bg-primary-500 text-white' : 'bg-white text-neutral-800 border border-neutral-400'].join(' ')}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <nav className="mt-3 flex items-center text-xs text-neutral-600" aria-label="Breadcrumb">
        <span className="inline-flex items-center"><FolderOpen className="mr-1.5 h-4 w-4" aria-hidden /> Root</span>
        <ChevronRight className="mx-1 h-3 w-3" aria-hidden />
        <span>All Files</span>
      </nav>

      {view === 'grid' ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {paged.map(f => {
            const checked = selectedIds.includes(f.id);
            return (
              <div key={f.id} className="group relative rounded-lg border border-neutral-400 bg-white p-3 shadow-sm hover:border-primary-400">
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded bg-white/90 p-1 shadow"
                  onClick={() => (checked ? onDeselect(f.id) : onSelect(f.id))}
                  aria-label={checked ? 'Deselect file' : 'Select file'}
                >
                  {checked ? <CheckSquare className="h-4 w-4 text-primary-600" aria-hidden /> : <Square className="h-4 w-4 text-neutral-800" aria-hidden />}
                </button>
                <button type="button" onClick={() => onOpen(f.id)} className="block w-full text-left">
                  <div className="h-28 w-full overflow-hidden rounded-md bg-neutral-300">
                    {f.thumbnailUrl ? (
                      <img
                        src={f.thumbnailUrl}
                        alt={f.name || `Thumbnail for ${f.id}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" aria-hidden />
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-neutral-800">{f.name}</p>
                  <p className="text-xs text-neutral-600">{f.mimeType} • {formatFileSize(f.size)}</p>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-400 bg-white">
          <div className="grid grid-cols-12 border-b border-neutral-400 bg-neutral-300/50 px-3 py-2 text-xs font-semibold text-neutral-800">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {paged.map(f => {
            const checked = selectedIds.includes(f.id);
            return (
              <div key={f.id} className="grid grid-cols-12 items-center border-b border-neutral-300 px-3 py-2 last:border-0">
                <div className="col-span-6 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded bg-white p-1"
                    onClick={() => (checked ? onDeselect(f.id) : onSelect(f.id))}
                    aria-label={checked ? 'Deselect file' : 'Select file'}
                  >
                    {checked ? <CheckSquare className="h-4 w-4 text-primary-600" aria-hidden /> : <Square className="h-4 w-4 text-neutral-800" aria-hidden />}
                  </button>
                  <button type="button" onClick={() => onOpen(f.id)} className="truncate text-left text-sm font-medium text-neutral-800">{f.name}</button>
                </div>
                <div className="col-span-2 truncate text-xs text-neutral-600">{f.mimeType}</div>
                <div className="col-span-2 truncate text-xs text-neutral-600">{formatFileSize(f.size)}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button type="button" className="rounded-md border border-neutral-400 bg-white px-2 py-1 text-xs text-neutral-800 hover:bg-neutral-300/50" onClick={() => onOpen(f.id)} aria-label="Open and download">
                    <Download className="h-4 w-4" aria-hidden />
                  </button>
                  <button type="button" className="rounded-md bg-destructive px-2 py-1 text-xs text-white hover:opacity-90" onClick={() => onDelete([f.id])}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button type="button" className="rounded-md border border-neutral-400 bg-white px-2.5 py-1 text-sm text-neutral-800 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <span className="text-xs text-neutral-600">Page {currentPage} of {totalPages}</span>
          <button type="button" className="rounded-md border border-neutral-400 bg-white px-2.5 py-1 text-sm text-neutral-800 disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        </div>
      )}
    </div>
  );
};

export default FileManager;



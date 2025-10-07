/**
 * File Sharing Hook
 * Centralized state management for file operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
  FileMetadata,
  FileUploadProgress,
  FileFolder,
  FileCategory,
} from '@/types/file-sharing.types';
import {
  validateFile,
  sanitizeFileName,
  generateFileChecksum,
  getFileCategory,
  getFileExtension,
} from '@/utils/file-security';
import { compressImage, generateImageThumbnail } from '@/utils/image';
import {
  getSignedUploadUrl,
  uploadToSignedUrl,
  getSignedDownloadUrl,
  scanForViruses,
  recordAnalytics,
  exportFilesZip,
} from '@/services/files';

type PermissionMap = Record<string, Array<'view' | 'download' | 'edit' | 'delete'>>;

interface UseFileSharingReturn {
  files: FileMetadata[];
  uploadProgress: FileUploadProgress[];
  folders: FileFolder[];
  selectedFiles: string[];
  isUploading: boolean;
  uploadFiles: (files: FileList) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  selectFile: (fileId: string) => void;
  deselectFile: (fileId: string) => void;
  clearSelection: () => void;
  createFolder: (name: string, parentId?: string) => void;
  moveToFolder: (fileIds: string[], folderId: string) => void;
  searchFiles: (query: string) => FileMetadata[];
  filterByCategory: (category: FileCategory) => FileMetadata[];
  setPermissions: (fileId: string, permissions: Array<'view' | 'download' | 'edit' | 'delete'>) => void;
  incrementView: (fileId: string) => Promise<void>;
  incrementDownload: (fileId: string) => Promise<void>;
  exportSelected: (fileIds: string[]) => Promise<Blob>;
}

export function useFileSharing(): UseFileSharingReturn {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const permissionsRef = useRef<PermissionMap>({});
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    const filesToUpload = Array.from(fileList);
    
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    const newProgress: FileUploadProgress[] = [];

    for (const file of filesToUpload) {
      const validation = validateFile(file);
      
      if (!validation.isValid) {
        toast.error(`${file.name}: ${validation.errors.join(', ')}`);
        continue;
      }

      if (validation.warnings.length > 0) {
        toast.warning(`${file.name}: ${validation.warnings.join(', ')}`);
      }

      const fileId = uuidv4();
      const sanitizedName = sanitizeFileName(file.name);

      newProgress.push({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
      });

      setUploadProgress(prev => [...prev, newProgress[newProgress.length - 1]]);

      // Simulate upload with progress (replace with real signed URL flow)
      const controller = new AbortController();
      abortControllers.current.set(fileId, controller);

      try {
        // Update to uploading
        setUploadProgress(prev =>
          prev.map(p =>
            p.fileId === fileId ? { ...p, status: 'uploading' } : p
          )
        );

        // Optional: image compression before upload
        const fileToUpload = await compressImage(file);
        const thumbnailDataUrl = await generateImageThumbnail(fileToUpload).catch(() => undefined);

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setUploadProgress(prev =>
            prev.map(p =>
              p.fileId === fileId ? { ...p, progress } : p
            )
          );
        }

        // Optional server-side scan placeholder
        const scan = await scanForViruses(file);
        if (!scan.clean) {
          throw new Error('Virus scan failed');
        }

        // Generate checksum
        const checksum = await generateFileChecksum(fileToUpload);

        // Create file metadata
        const fileMetadata: FileMetadata = {
          id: fileId,
          name: sanitizedName,
          originalName: file.name,
          size: fileToUpload.size,
          mimeType: fileToUpload.type,
          category: getFileCategory(fileToUpload.type),
          extension: getFileExtension(fileToUpload.name),
          status: 'ready',
          url: URL.createObjectURL(fileToUpload),
          thumbnailUrl: thumbnailDataUrl,
          uploadedBy: 'current-user', // Replace with actual user
          uploadedAt: new Date().toISOString(),
          lastModified: new Date(fileToUpload.lastModified).toISOString(),
          version: 1,
          tags: [],
          permissions: ['view', 'download', 'edit', 'delete'],
          isPublic: false,
          downloadCount: 0,
          viewCount: 0,
          checksum,
        };

        setFiles(prev => [...prev, fileMetadata]);
        permissionsRef.current[fileId] = ['view', 'download', 'edit', 'delete'];

        setUploadProgress(prev =>
          prev.map(p =>
            p.fileId === fileId ? { ...p, status: 'completed' } : p
          )
        );

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        setUploadProgress(prev =>
          prev.map(p =>
            p.fileId === fileId
              ? { ...p, status: 'error', error: 'Upload failed' }
              : p
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        abortControllers.current.delete(fileId);
      }
    }

    setIsUploading(false);
    
    // Clear progress after delay with cleanup safety
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
    }
    clearTimeoutRef.current = setTimeout(() => {
      setUploadProgress([]);
      clearTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
    };
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      
      toast.success(`${file.name} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  }, [files]);

  const selectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) ? prev : [...prev, fileId]
    );
  }, []);

  const deselectFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const createFolder = useCallback((name: string, parentId?: string) => {
    const folder: FileFolder = {
      id: uuidv4(),
      name,
      parentId,
      createdAt: new Date().toISOString(),
      fileCount: 0,
    };
    setFolders(prev => [...prev, folder]);
    toast.success(`Folder "${name}" created`);
  }, []);

  const moveToFolder = useCallback((fileIds: string[], folderId: string) => {
    setFiles(prev =>
      prev.map(file =>
        fileIds.includes(file.id) ? { ...file, folderId } : file
      )
    );
    toast.success(`${fileIds.length} file(s) moved`);
  }, []);

  const searchFiles = useCallback((query: string): FileMetadata[] => {
    const lowercaseQuery = query.toLowerCase();
    return files.filter(file =>
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [files]);

  const filterByCategory = useCallback((category: FileCategory): FileMetadata[] => {
    return files.filter(file => file.category === category);
  }, [files]);

  const setPermissions = useCallback((fileId: string, permissions: Array<'view' | 'download' | 'edit' | 'delete'>) => {
    permissionsRef.current[fileId] = permissions;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, permissions } : f));
  }, []);

  const incrementView = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, viewCount: f.viewCount + 1 } : f));
    await recordAnalytics('view', fileId);
  }, []);

  const incrementDownload = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, downloadCount: f.downloadCount + 1 } : f));
    await recordAnalytics('download', fileId);
  }, []);

  const exportSelected = useCallback(async (fileIds: string[]) => {
    return await exportFilesZip(fileIds);
  }, []);

  return {
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
    createFolder,
    moveToFolder,
    searchFiles,
    filterByCategory,
    setPermissions,
    incrementView,
    incrementDownload,
    exportSelected,
  };
}



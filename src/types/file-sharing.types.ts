/**
 * File Sharing System - Type Definitions
 * Comprehensive types for secure file sharing and management
 */

export type FileCategory = 
  | 'document' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'other';

export type FileStatus = 
  | 'uploading' 
  | 'processing' 
  | 'ready' 
  | 'failed' 
  | 'deleted';

export type FilePermission = 'view' | 'download' | 'edit' | 'delete';

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  extension: string;
  status: FileStatus;
  url?: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  // ISO 8601 strings for serialization across API boundaries
  uploadedAt: string;
  lastModified: string;
  version: number;
  tags: string[];
  description?: string;
  folderId?: string;
  permissions: FilePermission[];
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  checksum: string;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileFolder {
  id: string;
  name: string;
  parentId?: string;
  // ISO 8601 string
  createdAt: string;
  fileCount: number;
  color?: string;
}

export interface FileShareSettings {
  fileId: string;
  allowedUsers: string[];
  // ISO 8601 string
  expiresAt?: string;
  password?: string;
  maxDownloads?: number;
  permissions: FilePermission[];
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  // ISO 8601 string
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  changes?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  maxFilesPerUpload: number;
  enableCompression: boolean;
  enableVirusScan: boolean;
}



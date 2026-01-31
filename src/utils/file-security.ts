/**
 * File Security & Validation Utilities
 * Production-ready security checks and file handling
 */

import { FileCategory, FileValidationResult } from '@/types/file-sharing.types';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  document: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 50 * 1024 * 1024, // 50MB
  archive: 100 * 1024 * 1024, // 100MB
  other: 25 * 1024 * 1024, // 25MB
} as const;

// Allowed MIME types by category
export const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ],
  archive: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],
  other: [],
};

export function getFileCategory(mimeType: string): FileCategory {
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (types.includes(mimeType)) {
      return category as FileCategory;
    }
  }
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const category = getFileCategory(file.type);
  const maxSize = FILE_SIZE_LIMITS[category];
  
  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`);
  }
  
  // Type validation
  if (category === 'other') {
    warnings.push('File type may not be supported for preview');
  }
  
  // Name validation
  if (file.name.length > 255) {
    errors.push('File name is too long (max 255 characters)');
  }
  
  // Malicious pattern detection
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1'];
  const hassuspicious = suspiciousExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (hassuspicious) {
    errors.push('File type is not allowed for security reasons');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export async function generateFileChecksum(file: File): Promise<string> {
  // Guard against memory pressure: avoid loading very large files entirely into memory.
  const MAX_CHECKSUM_SIZE = 100 * 1024 * 1024; // 100MB
  if (typeof file.size === 'number' && file.size > MAX_CHECKSUM_SIZE) {
    console.warn('Skipping checksum generation for large file to avoid memory pressure:', file.name);
    return 'CHECKSUM_SKIPPED_FILE_TOO_LARGE';
  }

  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function canPreviewFile(mimeType: string): boolean {
  const previewableTypes = [
    ...ALLOWED_MIME_TYPES.image,
    'application/pdf',
    'text/plain',
    'text/csv',
  ];
  return previewableTypes.includes(mimeType);
}



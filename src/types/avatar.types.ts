// Avatar management types

export type AvatarFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'svg';

export interface AvatarFile {
  file: File;
  format: AvatarFormat;
  size: number;
  width: number;
  height: number;
}

export interface AvatarUploadResult {
  url: string;
  thumbnails: Record<string, string>; // size: url
  original: string;
}

export interface AvatarError {
  code: 'FORMAT' | 'SIZE' | 'DIMENSION' | 'UPLOAD' | 'COMPRESSION' | 'CROP' | 'UNKNOWN';
  message: string;
}

export interface AvatarThumbnail {
  size: number;
  url: string;
}

export interface AvatarCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  aspect: number;
}

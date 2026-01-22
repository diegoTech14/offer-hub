

import Compressor from 'compressorjs';

export function compressImage(
  file: File,
  format: 'jpg' | 'jpeg' | 'png' | 'webp',
  maxSizeMB = 5
): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.85,
      convertSize: maxSizeMB * 1024 * 1024,
      mimeType:
        format === 'webp'
          ? 'image/webp'
          : format === 'png'
          ? 'image/png'
          : 'image/jpeg',
      success(result: File | Blob) {
        if ((result as File).size > maxSizeMB * 1024 * 1024) {
          reject(new Error('Image exceeds maximum allowed size after compression.'));
        } else {
          resolve(result as File);
        }
      },
      error(err: Error) {
        reject(err);
      },
    });
  });
}

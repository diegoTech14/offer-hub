// Generates thumbnails using canvas in the browser
export async function generateThumbnails(
  file: File,
  sizes: number[] = [32, 64, 128, 256],
  format: 'jpg' | 'jpeg' | 'png' | 'webp' = 'webp'
): Promise<Record<number, Blob>> {
  const imageBitmap = await createImageBitmap(file);
  const thumbnails: Record<number, Blob> = {};
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(imageBitmap, 0, 0, size, size);
    const mimeType =
      format === 'webp'
        ? 'image/webp'
        : format === 'png'
        ? 'image/png'
        : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create thumbnail blob'));
        },
        mimeType,
        0.85
      );
    });
    thumbnails[size] = blob;
  }
  return thumbnails;
}

// Validate image dimensions using browser APIs
export async function validateImageDimensions(
  file: File,
  minWidth = 200,
  minHeight = 200
): Promise<{ width: number; height: number }> {
  const img = document.createElement('img');
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    img.onload = () => {
      if (img.naturalWidth < minWidth || img.naturalHeight < minHeight) {
        reject(new Error('Image dimensions too small'));
      } else {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Invalid image'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

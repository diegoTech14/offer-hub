import { useState, useCallback } from 'react';
import { compressImage } from '../utils/image-compression';
import { generateThumbnails, validateImageDimensions } from '../utils/image-processing';
import type { AvatarFile, AvatarUploadResult, AvatarError, AvatarFormat } from '../types/avatar.types';

const ACCEPTED_FORMATS: AvatarFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
const MAX_SIZE_MB = 5;
const MIN_DIM = 200;

export function useAvatarUpload() {
  const [error, setError] = useState<AvatarError | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AvatarUploadResult | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [onCropConfirm, setOnCropConfirm] = useState<((cropped: File) => void) | null>(null);

  const validateFile = useCallback(async (file: File): Promise<AvatarFile> => {
    const ext = file.name.split('.').pop()?.toLowerCase() as AvatarFormat;
    if (!ACCEPTED_FORMATS.includes(ext)) {
      throw { code: 'FORMAT', message: 'Unsupported file format.' };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw { code: 'SIZE', message: 'File exceeds 5MB limit.' };
    }
    const { width, height } = await validateImageDimensions(file, MIN_DIM, MIN_DIM);
    return { file, format: ext, size: file.size, width, height };
  }, []);

  // New: handle file selection, validate, and open crop modal
  const handleFileSelect = useCallback(async (file: File) => {
    console.log('[AvatarUpload] handleFileSelect called with', file);
    setError(null);
    setUploading(false);
    setProgress(0);
    try {
      await validateFile(file); // Only validate, don't process
      const fileUrl = URL.createObjectURL(file);
  console.log('[AvatarUpload] setCropImage called with', fileUrl);
  setCropImage(fileUrl);
  console.log('[AvatarUpload] setShowCropModal(true) called');
  setShowCropModal(true);
      // Save file for cropping
      setOnCropConfirm(() => async (cropped: File) => {
        console.log('[AvatarUpload] onCropConfirm called with', cropped);
  setShowCropModal(false);
  setCropImage(null);
  setUploading(true);
  setProgress(0);
  console.log('[AvatarUpload] Starting upload after crop...');
        try {
          let compressed: File = cropped;
          const ext = cropped.name.split('.').pop()?.toLowerCase() as AvatarFormat;
          if (ext !== 'svg') {
            compressed = await compressImage(cropped, ext);
          }
          setProgress(30);
          const thumbs = await generateThumbnails(compressed, [32, 64, 128, 256], ext !== 'svg' ? ext : 'png');
          setProgress(70);
          const url = URL.createObjectURL(compressed);
          const thumbnails: Record<string, string> = {};
          for (const size of Object.keys(thumbs)) {
            const blob = thumbs[Number(size)];
            thumbnails[size] = URL.createObjectURL(blob);
          }
          // artificial delay so UI progress animation can complete (4s)
          await new Promise((res) => setTimeout(res, 4000));
          console.log('[AvatarUpload] setResult called', { url, thumbnails, original: url });
          setResult({ url, thumbnails, original: url });
          setPreview(url);
          setProgress(100);
        } catch (e) {
          setError(e as AvatarError);
          setProgress(0);
        } finally {
          setUploading(false);
        }
      });
    } catch (e) {
      setError(e as AvatarError);
      setProgress(0);
    }
  }, [validateFile]);

  // handleUpload is now just an alias for handleFileSelect for compatibility
  const handleUpload = handleFileSelect;

  // Call this from the crop modal's confirm button with the cropped file
  const confirmCrop = useCallback((cropped: File) => {
    console.log('[AvatarUpload] confirmCrop called with', cropped);
    console.log('[AvatarUpload] onCropConfirm is', onCropConfirm);
    setShowCropModal(false);
    setCropImage(null);
    if (onCropConfirm) {
      // Support async crop confirm callback
      Promise.resolve(onCropConfirm(cropped)).finally(() => {
        setOnCropConfirm(null);
      });
    } else {
      console.error('[AvatarUpload] onCropConfirm is not set when confirmCrop called!');
    }
  }, [onCropConfirm]);

  console.log('[AvatarUpload] useAvatarUpload hook initialized');
  return {
    error,
    uploading,
    progress,
    preview,
    result,
    handleUpload,
    setPreview,
    setError,
    showCropModal,
    cropImage,
    confirmCrop,
  };
}

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ManagedFile, FileValidationRule, FileValidationError } from '@/types/file';
import { validateFiles } from '@/lib/validation/fileValidation';

interface UseFileUploadOptions {
  rules?: FileValidationRule;
  initialFiles?: ManagedFile[];
  onFilesAdded?: (files: ManagedFile[]) => void;
  onError?: (errors: FileValidationError[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { rules = {}, initialFiles = [], onFilesAdded, onError } = options;
  const [files, setFiles] = useState<ManagedFile[]>(initialFiles);
  const [errors, setErrors] = useState<FileValidationError[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Track active Object URLs to prevent memory leaks and prevent premature revocation during renders
  const activeUrlsRef = useRef<Set<string>>(new Set());

  // Revoke remaining object URLs ONLY when component unmounts
  useEffect(() => {
    const urls = activeUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      urls.clear();
    };
  }, []);

  const addFiles = useCallback(
    (incomingFileList: File[] | FileList) => {
      const arrayFiles = Array.from(incomingFileList);
      if (arrayFiles.length === 0) return;

      const { validFiles, errors: validationErrors } = validateFiles(arrayFiles, rules, files);

      if (validationErrors.length > 0) {
        setErrors((prev) => [...prev, ...validationErrors]);
        onError?.(validationErrors);
      }

      if (validFiles.length > 0) {
        const newManagedFiles: ManagedFile[] = validFiles.map((file) => {
          let previewUrl: string | undefined = undefined;
          if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
            activeUrlsRef.current.add(previewUrl);
          }

          return {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl,
            status: 'idle',
            progress: 0,
          };
        });

        setFiles((prev) => [...prev, ...newManagedFiles]);
        onFilesAdded?.(newManagedFiles);
      }
    },
    [files, rules, onFilesAdded, onError]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.previewUrl?.startsWith('blob:')) {
        activeUrlsRef.current.delete(fileToRemove.previewUrl);
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      if (fileToRemove?.processedUrl?.startsWith('blob:')) {
        activeUrlsRef.current.delete(fileToRemove.processedUrl);
        URL.revokeObjectURL(fileToRemove.processedUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<ManagedFile>) => {
    if (patch.processedUrl?.startsWith('blob:')) {
      activeUrlsRef.current.add(patch.processedUrl);
    }
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...patch } : file)));
  }, []);

  const clearFiles = useCallback(() => {
    activeUrlsRef.current.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    activeUrlsRef.current.clear();
    setFiles([]);
    setErrors([]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Drag & drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  return {
    files,
    errors,
    isDragging,
    addFiles,
    removeFile,
    updateFile,
    clearFiles,
    clearErrors,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

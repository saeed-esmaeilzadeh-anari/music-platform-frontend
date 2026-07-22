'use client';

import { useState, useCallback, useRef } from 'react';

export interface DropZoneValidationError {
  type: 'mime' | 'size' | 'multiple';
  message: string;
}

interface UseDropZoneOptions {
  accept: string[];           // MIME types e.g. ['audio/mpeg', 'audio/wav']
  maxSizeBytes: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  onError?: (error: DropZoneValidationError) => void;
}

export interface DropZoneState {
  isDragging: boolean;
  isOver: boolean;
}

export function useDropZone({
  accept,
  maxSizeBytes,
  multiple = false,
  onFiles,
  onError,
}: UseDropZoneOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver]         = useState(false);
  const inputRef                    = useRef<HTMLInputElement>(null);
  const dragCounter                 = useRef(0);

  const validate = useCallback(
    (files: File[]): File[] | null => {
      if (!multiple && files.length > 1) {
        onError?.({ type: 'multiple', message: 'Only one file can be uploaded at a time.' });
        return null;
      }
      for (const file of files) {
        // MIME check — also accept by extension as fallback
        const mimeOk =
          accept.includes(file.type) ||
          accept.some((a) => {
            const ext = a.split('/')[1];
            return file.name.toLowerCase().endsWith(`.${ext}`);
          });
        if (!mimeOk) {
          onError?.({
            type: 'mime',
            message: `"${file.name}" is not a supported file type. Accepted: ${accept.join(', ')}.`,
          });
          return null;
        }
        if (file.size > maxSizeBytes) {
          const mb = Math.round(maxSizeBytes / 1024 / 1024);
          onError?.({
            type: 'size',
            message: `"${file.name}" exceeds the ${mb} MB size limit.`,
          });
          return null;
        }
      }
      return files;
    },
    [accept, maxSizeBytes, multiple, onError],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
      setIsOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
      setIsOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      setIsOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (!files.length) return;

      const valid = validate(files);
      if (valid) onFiles(valid);
    },
    [validate, onFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      const valid = validate(files);
      if (valid) onFiles(valid);
      // Reset so the same file can be re-selected after an error
      e.target.value = '';
    },
    [validate, onFiles],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const rootProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver:  handleDragOver,
    onDrop:      handleDrop,
    onClick:     openFilePicker,
  };

  const inputProps = {
    ref:      inputRef,
    type:     'file' as const,
    accept:   accept.join(','),
    multiple,
    onChange: handleInputChange,
    className: 'sr-only',
    tabIndex: -1,
    'aria-hidden': true as const,
  };

  return {
    rootProps,
    inputProps,
    state: { isDragging, isOver } as DropZoneState,
  };
}
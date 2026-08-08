'use client';
import { useState, useCallback, useRef } from 'react';

export interface DropZoneError { type: 'mime'|'size'|'multiple'; message: string; }

export function useDropZone({ accept, maxSizeBytes, multiple = false, onFiles, onError }:
  { accept: string[]; maxSizeBytes: number; multiple?: boolean;
    onFiles: (f: File[]) => void; onError?: (e: DropZoneError) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const counter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((files: File[]): File[] | null => {
    if (!multiple && files.length > 1) { onError?.({ type: 'multiple', message: 'One file at a time.' }); return null; }
    for (const f of files) {
      const ok = accept.includes(f.type) || accept.some(a => f.name.toLowerCase().endsWith('.' + a.split('/')[1]));
      if (!ok) { onError?.({ type: 'mime', message: `"${f.name}" is not supported. Accepted: ${accept.join(', ')}.` }); return null; }
      if (f.size > maxSizeBytes) { onError?.({ type: 'size', message: `"${f.name}" exceeds ${Math.round(maxSizeBytes/1024/1024)} MB.` }); return null; }
    }
    return files;
  }, [accept, maxSizeBytes, multiple, onError]);

  const onDragEnter  = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); counter.current++; if (e.dataTransfer.items?.length) { setIsDragging(true); setIsOver(true); } }, []);
  const onDragLeave  = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (--counter.current === 0) { setIsDragging(false); setIsOver(false); } }, []);
  const onDragOver   = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);
  const onDrop       = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); counter.current = 0; setIsDragging(false); setIsOver(false); const files = Array.from(e.dataTransfer.files); if (!files.length) return; const v = validate(files); if (v) onFiles(v); }, [validate, onFiles]);
  const onInputChange= useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files ?? []); e.target.value = ''; if (!files.length) return; const v = validate(files); if (v) onFiles(v); }, [validate, onFiles]);
  const open         = useCallback(() => inputRef.current?.click(), []);

  return {
    rootProps: { onDragEnter, onDragLeave, onDragOver, onDrop, onClick: open },
    inputProps: { ref: inputRef, type: 'file' as const, accept: accept.join(','), multiple, onChange: onInputChange, className: 'sr-only', tabIndex: -1, 'aria-hidden': true as const },
    isDragging, isOver,
  };
}

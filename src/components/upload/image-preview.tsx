'use client';

import { X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

export function ImagePreview({ file, onRemove, className }: ImagePreviewProps) {
  const url = URL.createObjectURL(file);
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-secondary border border-border group', className)}>
      <img
        src={url}
        alt="Preview"
        className="h-full w-full object-cover"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 hover:bg-black/60 transition-colors"
      >
        <X className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Remove
        </span>
      </button>
    </div>
  );
}

export function EmptyCover({ className, round = false }: { className?: string; round?: boolean }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-1.5 bg-secondary border border-dashed border-border text-muted-foreground',
      round ? 'rounded-full' : 'rounded-md',
      className,
    )}>
      <ImageIcon className="h-7 w-7 opacity-30" />
      <p className="text-[10px]">Cover art</p>
    </div>
  );
}

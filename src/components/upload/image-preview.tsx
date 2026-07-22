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
    <div className={cn('relative overflow-hidden rounded-md bg-secondary border border-border', className)}>
      <img
        src={url}
        alt="Cover preview"
        className="h-full w-full object-cover"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      {/* Replace overlay */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-1.5',
          'bg-black/0 hover:bg-black/60 transition-colors group',
        )}
      >
        <X className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
        <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Remove
        </span>
      </button>
    </div>
  );
}

interface EmptyCoverProps {
  className?: string;
}

export function EmptyCover({ className }: EmptyCoverProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-md bg-secondary border border-dashed border-border text-muted-foreground', className)}>
      <ImageIcon className="h-8 w-8 opacity-40" aria-hidden />
      <p className="text-xs">Cover art</p>
    </div>
  );
}
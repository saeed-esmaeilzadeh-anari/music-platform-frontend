'use client';

import { UploadCloud, FileAudio, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropZone, type DropZoneValidationError } from '@/hooks/use-drop-zone';

interface DropZoneProps {
  accept: string[];
  maxSizeBytes: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  onError?: (error: DropZoneValidationError) => void;
  /** Controls the large icon shown in the empty state */
  type?: 'audio' | 'image' | 'generic';
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  /** Content rendered inside when a file is already chosen — overrides default empty state */
  children?: React.ReactNode;
}

export function DropZone({
  accept,
  maxSizeBytes,
  multiple = false,
  onFiles,
  onError,
  type = 'generic',
  label,
  hint,
  disabled = false,
  className,
  children,
}: DropZoneProps) {
  const { rootProps, inputProps, state } = useDropZone({
    accept,
    maxSizeBytes,
    multiple,
    onFiles,
    onError,
  });

  const Icon =
    type === 'audio' ? FileAudio :
    type === 'image' ? ImageIcon :
    UploadCloud;

  const sizeMb = Math.round(maxSizeBytes / 1024 / 1024);

  return (
    <div
      {...(disabled ? {} : rootProps)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ?? 'Drop file or click to browse'}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          rootProps.onClick();
        }
      }}
      className={cn(
        // Base
        'relative flex flex-col items-center justify-center',
        'rounded-xl border-2 border-dashed transition-all duration-200',
        'cursor-pointer select-none outline-none',
        // States
        disabled
          ? 'border-border/30 bg-secondary/30 cursor-not-allowed opacity-50'
          : state.isOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border/60 bg-secondary/30 hover:border-primary/60 hover:bg-secondary/50',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {/* Hidden file input */}
      <input {...inputProps} disabled={disabled} />

      {/* Drag overlay */}
      {state.isOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/10 border-2 border-primary z-10">
          <div className="flex flex-col items-center gap-2 text-primary">
            <UploadCloud className="h-10 w-10" aria-hidden />
            <p className="text-sm font-semibold">Drop to upload</p>
          </div>
        </div>
      )}

      {/* Content */}
      {children ?? (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center pointer-events-none">
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full',
              'bg-secondary border border-border',
              state.isDragging && 'bg-primary/10 border-primary/40',
            )}
          >
            <Icon
              className={cn(
                'h-6 w-6 transition-colors',
                state.isDragging ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {label ?? 'Drag & drop or click to browse'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hint ?? `Accepted: ${accept.join(', ')} · Max ${sizeMb} MB`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
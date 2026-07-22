'use client';

import { CheckCircle2, XCircle, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadState } from '@/hooks/use-file-upload';

interface UploadProgressBarProps {
  state: UploadState;
  fileName?: string;
  className?: string;
}

const PHASE_LABEL: Record<string, string> = {
  idle:       '',
  presigning: 'Preparing upload…',
  uploading:  'Uploading…',
  confirming: 'Finalising…',
  processing: 'Processing audio…',
  done:       'Upload complete',
  error:      'Upload failed',
};

export function UploadProgressBar({ state, fileName, className }: UploadProgressBarProps) {
  if (state.phase === 'idle') return null;

  const percent =
    state.phase === 'uploading'   ? state.progress :
    state.phase === 'presigning'  ? 5  :
    state.phase === 'confirming'  ? 95 :
    state.phase === 'processing'  ? 100 :
    state.phase === 'done'        ? 100 : 0;

  const isError      = state.phase === 'error';
  const isDone       = state.phase === 'done';
  const isProcessing = state.phase === 'processing';
  const isActive     = !isError && !isDone;

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* File name + status icon */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isDone ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
          ) : isError ? (
            <XCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
          ) : isProcessing ? (
            <Loader2 className="h-4 w-4 shrink-0 text-primary animate-spin" aria-hidden />
          ) : (
            <Upload className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          )}
          {fileName && (
            <span className="truncate text-sm font-medium text-foreground">
              {fileName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {state.phase === 'uploading' && (
            <span className="text-xs tabular-nums font-medium text-primary">
              {state.progress}%
            </span>
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isDone       ? 'text-emerald-500' :
              isError      ? 'text-destructive' :
              isProcessing ? 'text-primary/80'  :
                             'text-muted-foreground',
            )}
          >
            {PHASE_LABEL[state.phase]}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            isDone       ? 'bg-emerald-500' :
            isError      ? 'bg-destructive'  :
            isProcessing ? 'bg-primary/60 animate-pulse' :
                           'bg-primary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Error message */}
      {isError && (
        <p className="text-xs text-destructive leading-snug">{state.message}</p>
      )}

      {/* Processing hint */}
      {isProcessing && (
        <p className="text-xs text-muted-foreground">
          Audio is being processed in the background. You can leave this page.
        </p>
      )}
    </div>
  );
}
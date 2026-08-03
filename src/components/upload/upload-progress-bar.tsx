'use client';

import { CheckCircle2, XCircle, Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import type { UploadState } from '@/hooks/use-file-upload';

const LABELS: Record<string, string> = {
  idle:       '',
  presigning: 'Preparing…',
  uploading:  'Uploading…',
  confirming: 'Finalising…',
  processing: 'Processing audio…',
  done:       'Complete',
  error:      'Failed',
};

const PERCENTS: Record<string, number> = {
  idle: 0, presigning: 5, confirming: 95, processing: 100, done: 100, error: 0,
};

interface Props { state: UploadState; fileName?: string; className?: string }

export function UploadProgressBar({ state, fileName, className }: Props) {
  if (state.phase === 'idle') return null;

  const pct     = state.phase === 'uploading' ? state.progress : (PERCENTS[state.phase] ?? 0);
  const isDone  = state.phase === 'done';
  const isErr   = state.phase === 'error';
  const isProc  = state.phase === 'processing';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isDone  && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
          {isErr   && <XCircle      className="h-4 w-4 shrink-0 text-destructive" />}
          {isProc  && <Loader2      className="h-4 w-4 shrink-0 text-primary animate-spin" />}
          {!isDone && !isErr && !isProc && <UploadCloud className="h-4 w-4 shrink-0 text-primary" />}
          {fileName && <span className="truncate text-sm font-medium text-foreground">{fileName}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {state.phase === 'uploading' && (
            <span className="text-xs tabular-nums font-semibold text-primary">{pct}%</span>
          )}
          <span className={cn(
            'text-xs font-medium',
            isDone ? 'text-emerald-500' : isErr ? 'text-destructive' : 'text-muted-foreground',
          )}>
            {LABELS[state.phase]}
          </span>
        </div>
      </div>

      <div
        className="h-1.5 w-full rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            isDone ? 'bg-emerald-500' :
            isErr  ? 'bg-destructive'  :
            isProc ? 'bg-primary/60 animate-pulse' :
                     'bg-primary',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isErr  && <p className="text-xs text-destructive">{state.error}</p>}
      {isProc && <p className="text-xs text-muted-foreground">Processing in background — you can leave this page.</p>}
    </div>
  );
}

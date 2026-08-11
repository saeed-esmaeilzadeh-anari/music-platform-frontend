'use client';

import { useCallback } from 'react';
import { Camera, ImageIcon } from 'lucide-react';
import { usePlaylistCover } from '@/hooks/use-playlist-cover';
import { useDropZone } from '@/hooks/use-drop-zone';
import { useToast } from '@/providers/toast-provider';
import { UploadProgressBar } from '@/components/upload/upload-progress-bar';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PlaylistCoverUploadProps {
  playlistId: string;
  currentCoverUrl?: string | null;
  isOwner: boolean;
  className?: string;
}

export function PlaylistCoverUpload({
  playlistId,
  currentCoverUrl,
  isOwner,
  className,
}: PlaylistCoverUploadProps) {
  const { error: toast }    = useToast();
  const { state, upload }   = usePlaylistCover(playlistId);
  const isUploading         = state.phase !== 'idle' && state.phase !== 'done' && state.phase !== 'error';

  const onFiles = useCallback(async (files: File[]) => {
    await upload(files[0]);
  }, [upload]);

  const onError = useCallback((e: { message: string }) => {
    toast('Invalid file', e.message);
  }, [toast]);

  const { rootProps, inputProps } = useDropZone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSizeBytes: MAX_IMAGE_SIZE_BYTES,
    onFiles,
    onError,
  });

  if (!isOwner) {
    return (
      <div className={cn('rounded-md bg-secondary border border-border overflow-hidden', className)}>
        {currentCoverUrl
          ? <img src={currentCoverUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-1/3 w-1/3 text-muted-foreground/20" /></div>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        {...rootProps}
        className={cn(
          'group relative rounded-md bg-secondary border border-border overflow-hidden cursor-pointer',
          'transition-all hover:border-primary/50',
          isUploading && 'pointer-events-none',
          className,
        )}
        aria-label="Upload playlist cover"
      >
        <input {...inputProps} />
        {currentCoverUrl
          ? <img src={currentCoverUrl} alt="Playlist cover" className="h-full w-full object-cover" />
          : <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-30" aria-hidden />
              <p className="text-xs">Add cover art</p>
            </div>}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover:bg-black/60 transition-colors">
          <Camera className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {currentCoverUrl ? 'Change cover' : 'Add cover'}
          </span>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>
      {state.phase !== 'idle' && <UploadProgressBar state={state} className="px-1" />}
    </div>
  );
}

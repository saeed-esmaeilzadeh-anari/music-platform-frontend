'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFileUpload } from '@/hooks/use-file-upload';
import { useArtistProfile } from '@/hooks/use-artist-profile';
import { useTracks } from '@/hooks/use-tracks';
import { useToast } from '@/providers/toast-provider';

import { DropZone } from './drop-zone';
import { ImagePreview, EmptyCover } from './image-preview';
import { UploadProgressBar } from './upload-progress-bar';
import { FormField, FormError } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '@/lib/constants';
import { cn } from '@/lib/utils/index';
import type { UploadAssetType } from '@/types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  assetType: z.enum([
    'TRACK_COVER',
    'ALBUM_COVER',
    'ARTIST_AVATAR',
    'ARTIST_BANNER',
    'USER_AVATAR',
  ] as const),
  trackId: z.string().uuid().optional(),
});

type CoverFormValues = z.infer<typeof schema>;

const ASSET_LABELS: Record<string, string> = {
  TRACK_COVER:   'Track cover',
  ALBUM_COVER:   'Album cover',
  ARTIST_AVATAR: 'Artist avatar',
  ARTIST_BANNER: 'Artist banner',
  USER_AVATAR:   'Profile avatar',
};

// ─── UploadCoverForm ──────────────────────────────────────────────────────────

export function UploadCoverForm() {
  const { artist } = useArtistProfile();
  const { data: tracksData } = useTracks({
    artistId: artist?.id,
    status: 'PUBLISHED',
    limit: 50,
  });
  const { error: toastError } = useToast();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [done, setDone]           = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CoverFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { assetType: 'TRACK_COVER', trackId: undefined },
  });

  const assetType = watch('assetType') as UploadAssetType;
  const trackId   = watch('trackId');
  const needsTrack = assetType === 'TRACK_COVER';

  const coverUpload = useFileUpload({
    assetType,
    trackId: needsTrack ? trackId : undefined,
    onDone:  () => setDone(true),
  });

  const isUploading = coverUpload.state.phase !== 'idle';

  const onSubmit = async (values: CoverFormValues) => {
    if (!coverFile) { toastError('No image selected', 'Please choose a cover image.'); return; }
    if (needsTrack && !values.trackId) {
      toastError('Select a track', 'Please choose which track this cover is for.');
      return;
    }
    await coverUpload.upload(coverFile);
  };

  const handleCoverFile  = useCallback((files: File[]) => setCoverFile(files[0]), []);
  const handleValidation = useCallback(
    (err: { message: string }) => toastError('Invalid file', err.message),
    [toastError],
  );

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden />
        <div>
          <p className="text-lg font-bold">{ASSET_LABELS[assetType]} uploaded!</p>
          <p className="mt-1 text-sm text-muted-foreground">Your image has been updated.</p>
        </div>
        <Button variant="secondary" size="md" onClick={() => {
          setCoverFile(null); setDone(false); coverUpload.reset();
        }}>
          Upload another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* ── Asset type picker ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">What are you uploading?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(ASSET_LABELS).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer transition-all text-center',
                assetType === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/50',
                isUploading && 'opacity-50 cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                value={value}
                disabled={isUploading}
                {...register('assetType')}
                className="sr-only"
              />
              <ImageIcon className={cn(
                'h-6 w-6',
                assetType === value ? 'text-primary' : 'text-muted-foreground',
              )} aria-hidden />
              <span className={cn(
                'text-xs font-medium',
                assetType === value ? 'text-primary' : 'text-muted-foreground',
              )}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* ── Track selector (when needed) ── */}
      {needsTrack && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Select track</h2>
          <FormField label="Track" required>
            <select
              {...register('trackId')}
              disabled={isUploading || !tracksData?.items.length}
              className={cn(
                'w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground',
                'outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <option value="">Select a track…</option>
              {tracksData?.items.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <FormError message={errors.trackId?.message} />
          </FormField>
          {!tracksData?.items.length && artist && (
            <p className="text-xs text-muted-foreground">
              No published tracks found. Upload a track first.
            </p>
          )}
        </section>
      )}

      {/* ── Image dropzone ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold">{ASSET_LABELS[assetType]} image</h2>

        <div className="flex gap-4">
          {/* Preview */}
          <div className={cn(
            'shrink-0',
            assetType === 'ARTIST_AVATAR' ? 'h-28 w-28 rounded-full overflow-hidden' : 'h-28 w-28',
          )}>
            {coverFile
              ? <ImagePreview file={coverFile} onRemove={() => setCoverFile(null)} className={cn(
                  'h-full w-full',
                  assetType === 'ARTIST_AVATAR' && 'rounded-full',
                )} />
              : <EmptyCover className={cn(
                  'h-full w-full',
                  assetType === 'ARTIST_AVATAR' && 'rounded-full',
                )} />}
          </div>

          {/* Drop zone */}
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone
              accept={ACCEPTED_IMAGE_TYPES}
              maxSizeBytes={MAX_IMAGE_SIZE_BYTES}
              onFiles={handleCoverFile}
              onError={handleValidation}
              type="image"
              label={coverFile ? 'Replace image' : 'Drop image here'}
              hint={
                assetType === 'ARTIST_BANNER'
                  ? 'JPEG, PNG, WebP · Max 5 MB · 16:9 recommended'
                  : 'JPEG, PNG, WebP · Max 5 MB · Square recommended'
              }
              disabled={isUploading}
              className="min-h-[100px]"
            />
            <UploadProgressBar state={coverUpload.state} />
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end gap-4 rounded-xl border border-border bg-card px-6 py-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isUploading}
          disabled={!coverFile || isUploading}
        >
          {isUploading ? 'Uploading…' : `Upload ${ASSET_LABELS[assetType].toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Music2, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { createTrackSchema, type CreateTrackFormValues } from '@/lib/validators';
import { useCreateTrack } from '@/hooks/use-tracks';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useArtistProfile } from '@/hooks/use-artist-profile';
import { useGenres } from '@/hooks/use-catalog';
import { useToast } from '@/providers/toast-provider';

import { DropZone } from './drop-zone';
import { ImagePreview, EmptyCover } from './image-preview';
import { UploadProgressBar } from './upload-progress-bar';
import { FormField, FormInput, FormError } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';

import {
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  ROUTES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <div className={cn(
      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
      done   ? 'bg-emerald-500 text-white' :
      active ? 'bg-primary text-primary-foreground' :
               'bg-secondary border border-border text-muted-foreground',
    )}>
      {done ? '✓' : n}
    </div>
  );
}

// ─── UploadTrackForm ──────────────────────────────────────────────────────────

export function UploadTrackForm() {
  const { artist, isLoading: artistLoading } = useArtistProfile();
  const { data: genresData }                 = useGenres();
  const createTrack                          = useCreateTrack(artist?.id ?? '');
  const { error: toastError }                = useToast();

  // Files
  const [audioFile,  setAudioFile]  = useState<File | null>(null);
  const [coverFile,  setCoverFile]  = useState<File | null>(null);
  const [trackId,    setTrackId]    = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  // Upload pipelines
  const audioUpload = useFileUpload({
    assetType: 'TRACK_AUDIO',
    trackId:   trackId ?? undefined,
    onDone: () => {
      // If cover was also selected, kick off that upload now
      if (coverFile && trackId) coverUpload.upload(coverFile);
      else setDone(true);
    },
  });

  const coverUpload = useFileUpload({
    assetType: 'TRACK_COVER',
    trackId:   trackId ?? undefined,
    onDone:    () => setDone(true),
  });

  // RHF
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTrackFormValues>({
    resolver: zodResolver(createTrackSchema),
    defaultValues: { title: '', isExplicit: false, genreIds: [] },
  });

  const onSubmit = async (values: CreateTrackFormValues) => {
    if (!artist) { toastError('No artist profile', 'Create an artist profile first.'); return; }
    if (!audioFile) { toastError('Audio required', 'Please select an audio file.'); return; }

    // Step 1 — create track metadata record → get trackId
    const track = await createTrack.mutateAsync({ ...values });
    setTrackId(track.id);

    // Step 2 — upload audio (cover upload chained in onDone above)
    await audioUpload.upload(audioFile);
  };

  const handleAudioFile = useCallback((files: File[]) => setAudioFile(files[0]), []);
  const handleCoverFile = useCallback((files: File[]) => setCoverFile(files[0]), []);

  const handleValidationError = useCallback(
    (err: { message: string }) => toastError('Invalid file', err.message),
    [toastError],
  );

  const isUploading =
    audioUpload.state.phase !== 'idle' ||
    coverUpload.state.phase !== 'idle';

  if (artistLoading) {
    return <div className="h-32 rounded-xl bg-secondary skeleton" />;
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <Music2 className="h-10 w-10 text-muted-foreground/30" aria-hidden />
        <div>
          <p className="font-semibold text-foreground">No artist profile</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You need an artist profile before you can upload tracks.
          </p>
        </div>
        <Link href={ROUTES.PROFILE} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Create artist profile
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden />
        <div>
          <p className="text-lg font-bold text-foreground">Track uploaded!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your audio is being processed. It will appear as Published once ready.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => {
            setAudioFile(null); setCoverFile(null); setTrackId(null); setDone(false);
            audioUpload.reset(); coverUpload.reset();
          }}>
            Upload another
          </Button>
          <Link href={ROUTES.ARTIST(artist.id)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            View artist page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* ── Step 1: Metadata ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <StepBadge n={1} done={!!trackId} active={!trackId} />
          <h2 className="text-sm font-semibold">Track details</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Title */}
          <FormField label="Title" required className="sm:col-span-2">
            <FormInput
              type="text"
              placeholder="Track title"
              error={!!errors.title}
              disabled={isUploading}
              {...register('title')}
            />
            <FormError message={errors.title?.message} />
          </FormField>

          {/* Genre */}
          <FormField label="Genre" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2 mt-1">
              {genresData?.map((g) => (
                <label key={g.id} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    value={g.id}
                    disabled={isUploading}
                    {...register('genreIds')}
                    className="sr-only peer"
                  />
                  <span className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                    'border-border text-muted-foreground bg-secondary',
                    'peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary',
                    'hover:border-primary/60 hover:text-foreground',
                    isUploading && 'opacity-50 cursor-not-allowed',
                  )}>
                    {g.name}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {/* Explicit */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" disabled={isUploading} {...register('isExplicit')} className="sr-only peer" />
              <div className="h-5 w-9 rounded-full bg-secondary border border-border peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Explicit content</p>
              <p className="text-xs text-muted-foreground">Mark if the track contains explicit lyrics</p>
            </div>
          </label>
        </div>
      </section>

      {/* ── Step 2: Audio ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <StepBadge n={2} done={audioUpload.state.phase === 'done' || audioUpload.state.phase === 'processing'} active={!!audioFile} />
          <h2 className="text-sm font-semibold">Audio file <span className="text-destructive ml-0.5">*</span></h2>
        </div>

        {audioFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3">
              <Music2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{audioFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB · {audioFile.type}
                </p>
              </div>
              {audioUpload.state.phase === 'idle' && (
                <button type="button" onClick={() => setAudioFile(null)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  Remove
                </button>
              )}
            </div>
            <UploadProgressBar state={audioUpload.state} />
          </div>
        ) : (
          <DropZone
            accept={ACCEPTED_AUDIO_TYPES}
            maxSizeBytes={MAX_AUDIO_SIZE_BYTES}
            onFiles={handleAudioFile}
            onError={handleValidationError}
            type="audio"
            label="Drop audio file here"
            hint="MP3, WAV, FLAC, AAC · Max 100 MB"
            disabled={isUploading}
            className="min-h-[140px]"
          />
        )}
      </section>

      {/* ── Step 3: Cover ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <StepBadge n={3} done={coverUpload.state.phase === 'done'} active={!!coverFile} />
          <h2 className="text-sm font-semibold">
            Cover art
            <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
          </h2>
        </div>

        <div className="flex gap-4">
          {/* Preview square */}
          <div className="h-28 w-28 shrink-0">
            {coverFile ? (
              <ImagePreview
                file={coverFile}
                onRemove={() => setCoverFile(null)}
                className="h-full w-full"
              />
            ) : (
              <EmptyCover className="h-full w-full" />
            )}
          </div>

          {/* Drop zone */}
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone
              accept={ACCEPTED_IMAGE_TYPES}
              maxSizeBytes={MAX_IMAGE_SIZE_BYTES}
              onFiles={handleCoverFile}
              onError={handleValidationError}
              type="image"
              label={coverFile ? 'Replace cover art' : 'Drop image here'}
              hint="JPEG, PNG, WebP · Max 5 MB · Square recommended"
              disabled={isUploading}
              className="min-h-[100px]"
            />
            <UploadProgressBar state={coverUpload.state} />
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Uploading as <span className="font-semibold text-foreground">{artist.stageName}</span>
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting || createTrack.isPending || isUploading}
          disabled={isSubmitting || createTrack.isPending || isUploading || !audioFile}
        >
          {isUploading ? 'Uploading…' : 'Upload track'}
        </Button>
      </div>
    </form>
  );
}
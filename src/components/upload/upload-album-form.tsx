'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Disc3, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { createAlbumSchema, type CreateAlbumFormValues } from '@/lib/validators';
import { useCreateAlbum } from '@/hooks/use-albums';
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
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  ROUTES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

const ALBUM_TYPE_OPTIONS = [
  { value: 'ALBUM',       label: 'Album' },
  { value: 'SINGLE',      label: 'Single' },
  { value: 'EP',          label: 'EP' },
  { value: 'COMPILATION', label: 'Compilation' },
] as const;

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

export function UploadAlbumForm() {
  const { artist, isLoading: artistLoading } = useArtistProfile();
  const { data: genresData }                 = useGenres();
  const { error: toastError }                = useToast();

  const [coverFile,  setCoverFile]  = useState<File | null>(null);
  const [albumId,    setAlbumId]    = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  const createAlbum = useCreateAlbum(artist?.id ?? '');

  const coverUpload = useFileUpload({
    assetType: 'ALBUM_COVER',
    onDone:    () => setDone(true),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAlbumFormValues>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: { title: '', type: 'ALBUM', releaseDate: '', genreIds: [] },
  });

  const selectedType = watch('type');
  const isUploading  = coverUpload.state.phase !== 'idle';

  const onSubmit = async (values: CreateAlbumFormValues) => {
    if (!artist) { toastError('No artist profile', 'Create an artist profile first.'); return; }

    const album = await createAlbum.mutateAsync({
      ...values,
      releaseDate: values.releaseDate || undefined,
    });
    setAlbumId(album.id);

    if (coverFile) {
      await coverUpload.upload(coverFile);
    } else {
      setDone(true);
    }
  };

  const handleCoverFile = useCallback((files: File[]) => setCoverFile(files[0]), []);
  const handleValidationError = useCallback(
    (err: { message: string }) => toastError('Invalid file', err.message),
    [toastError],
  );

  if (artistLoading) return <div className="h-32 rounded-xl bg-secondary skeleton" />;

  if (!artist) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <Disc3 className="h-10 w-10 text-muted-foreground/30" aria-hidden />
        <div>
          <p className="font-semibold">No artist profile</p>
          <p className="mt-1 text-sm text-muted-foreground">You need an artist profile before creating albums.</p>
        </div>
        <Link href={ROUTES.PROFILE}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Create artist profile
        </Link>
      </div>
    );
  }

  if (done && albumId) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden />
        <div>
          <p className="text-lg font-bold">Album created!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Now upload tracks to this album from the Track upload tab.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={() => {
            setCoverFile(null); setAlbumId(null); setDone(false); coverUpload.reset();
          }}>
            Create another
          </Button>
          <Link href={ROUTES.ALBUM(albumId)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            View album <ExternalLink className="h-3.5 w-3.5" aria-hidden />
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
          <StepBadge n={1} done={!!albumId} active={!albumId} />
          <h2 className="text-sm font-semibold">Album details</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Title */}
          <FormField label="Title" required className="sm:col-span-2">
            <FormInput
              type="text"
              placeholder="Album title"
              error={!!errors.title}
              disabled={isUploading}
              {...register('title')}
            />
            <FormError message={errors.title?.message} />
          </FormField>

          {/* Type */}
          <FormField label="Type">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ALBUM_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isUploading}
                  onClick={() => setValue('type', opt.value, { shouldDirty: true })}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-all',
                    selectedType === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    isUploading && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>

          {/* Release date */}
          <FormField label="Release date">
            <FormInput
              type="date"
              error={!!errors.releaseDate}
              disabled={isUploading}
              {...register('releaseDate')}
            />
            <FormError message={errors.releaseDate?.message} />
          </FormField>

          {/* Genres */}
          <FormField label="Genres" className="sm:col-span-2">
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
        </div>
      </section>

      {/* ── Step 2: Cover art ── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <StepBadge n={2} done={coverUpload.state.phase === 'done'} active={!!coverFile} />
          <h2 className="text-sm font-semibold">
            Cover art
            <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="h-32 w-32 shrink-0">
            {coverFile
              ? <ImagePreview file={coverFile} onRemove={() => setCoverFile(null)} className="h-full w-full" />
              : <EmptyCover className="h-full w-full" />}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone
              accept={ACCEPTED_IMAGE_TYPES}
              maxSizeBytes={MAX_IMAGE_SIZE_BYTES}
              onFiles={handleCoverFile}
              onError={handleValidationError}
              type="image"
              label={coverFile ? 'Replace cover' : 'Drop cover art here'}
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
          Creating album as <span className="font-semibold text-foreground">{artist.stageName}</span>
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting || createAlbum.isPending || isUploading}
          disabled={isSubmitting || createAlbum.isPending || isUploading}
        >
          {isUploading ? 'Uploading cover…' : createAlbum.isPending ? 'Creating…' : 'Create album'}
        </Button>
      </div>
    </form>
  );
}
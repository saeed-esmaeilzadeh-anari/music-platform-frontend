'use client';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Disc3, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createAlbumSchema, type CreateAlbumFormValues } from '@/lib/validators';
import { useCreateAlbum } from '@/hooks/use-albums';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useArtists } from '@/hooks/use-artists';
import { useAuthStore } from '@/stores/auth.store';
import { useGenres } from '@/hooks/use-catalog';
import { useToast } from '@/providers/toast-provider';
import { DropZone } from './drop-zone';
import { ImagePreview, EmptyCover } from './image-preview';
import { UploadProgressBar } from './upload-progress-bar';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TYPES = ['ALBUM','SINGLE','EP','COMPILATION'] as const;
const inputCls = (err?: boolean, disabled?: boolean) => cn('w-full rounded-md bg-secondary border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/20', err?'border-destructive':'border-border', disabled&&'opacity-50 cursor-not-allowed');
function Step({ n, done, active }: { n:number; done:boolean; active:boolean }) {
  return <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', done?'bg-emerald-500 text-white':active?'bg-primary text-primary-foreground':'bg-secondary border border-border text-muted-foreground')}>{done?'✓':n}</div>;
}

export function UploadAlbumForm() {
  const { user } = useAuthStore();
  const { data: artists } = useArtists({ limit: 100 });
  const { data: genres }  = useGenres();
  const { error: toast }  = useToast();
  const artist      = artists?.items.find(a => a.userId === user?.id) ?? null;
  const createAlbum = useCreateAlbum(artist?.id ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [albumId,   setAlbumId]   = useState<string | null>(null);
  const [done,      setDone]      = useState(false);
  const coverUpload = useFileUpload({ assetType: 'ALBUM_COVER', onDone: () => setDone(true) });
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateAlbumFormValues>({ resolver: zodResolver(createAlbumSchema), defaultValues: { title:'', type:'ALBUM', releaseDate:'', genreIds:[] } });
  const selectedType = watch('type');
  const busy = isSubmitting || createAlbum.isPending || coverUpload.state.phase !== 'idle';

  const onSubmit = async (values: CreateAlbumFormValues) => {
    if (!artist) { toast('No artist profile','Create one first.'); return; }
    const album = await createAlbum.mutateAsync({ ...values, releaseDate: values.releaseDate||undefined });
    setAlbumId(album.id);
    if (coverFile) await coverUpload.upload(coverFile); else setDone(true);
  };
  const onCoverFile = useCallback((f: File[]) => setCoverFile(f[0]), []);
  const onErr = useCallback((e: { message: string }) => toast('Invalid file', e.message), [toast]);

  if (done && albumId) return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-10 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-500" />
      <div><p className="text-lg font-bold">Album created!</p><p className="mt-1 text-sm text-muted-foreground">Upload tracks and assign them to this album.</p></div>
      <div className="flex gap-3">
        <button type="button" onClick={() => { setCoverFile(null); setAlbumId(null); setDone(false); coverUpload.reset(); }}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors">Create another</button>
        <Link href={ROUTES.ALBUM(albumId)} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          View album <ExternalLink className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3"><Step n={1} done={!!albumId} active={!albumId} /><h2 className="text-sm font-semibold">Album details</h2></div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Title <span className="text-destructive">*</span></label>
          <input {...register('title')} type="text" placeholder="Album title" disabled={busy} className={inputCls(!!errors.title, busy)} />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button key={t} type="button" disabled={busy} onClick={() => setValue('type', t, { shouldDirty: true })}
                className={cn('rounded-md border px-3 py-2 text-sm font-medium transition-all', selectedType===t?'border-primary bg-primary/10 text-primary':'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground', busy&&'opacity-50 cursor-not-allowed')}>
                {t.charAt(0)+t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Release date</label>
          <input {...register('releaseDate')} type="date" disabled={busy} className={inputCls(false, busy)} />
        </div>
        {!!genres?.length && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <label key={g.id} className="cursor-pointer">
                  <input type="checkbox" value={g.id} disabled={busy} {...register('genreIds')} className="sr-only peer" />
                  <span className={cn('inline-block rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer border-border text-muted-foreground bg-secondary peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary hover:border-primary/60 hover:text-foreground', busy&&'opacity-50 pointer-events-none')}>{g.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3"><Step n={2} done={coverUpload.state.phase==='done'} active={!!coverFile} /><h2 className="text-sm font-semibold">Cover art <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span></h2></div>
        <div className="flex gap-4">
          <div className="h-32 w-32 shrink-0">
            {coverFile ? <ImagePreview file={coverFile} onRemove={() => setCoverFile(null)} className="h-full w-full" /> : <EmptyCover className="h-full w-full" />}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone accept={ACCEPTED_IMAGE_TYPES} maxSizeBytes={MAX_IMAGE_SIZE_BYTES} onFiles={onCoverFile} onError={onErr} type="image" label={coverFile?'Replace cover':'Drop cover art here'} hint="JPEG, PNG, WebP · Max 5 MB · Square" disabled={busy} className="min-h-[100px]" />
            <UploadProgressBar state={coverUpload.state} />
          </div>
        </div>
      </section>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">Creating as <span className="font-semibold text-foreground">{artist?.stageName ?? '…'}</span></p>
        <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {busy ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{coverUpload.state.phase!=='idle'?'Uploading…':'Creating…'}</> : 'Create album'}
        </button>
      </div>
    </form>
  );
}

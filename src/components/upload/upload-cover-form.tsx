'use client';
import { useState, useCallback } from 'react';
import { CheckCircle2, ImageIcon } from 'lucide-react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useArtists } from '@/hooks/use-artists';
import { useAuthStore } from '@/stores/auth.store';
import { useTracks } from '@/hooks/use-tracks';
import { useToast } from '@/providers/toast-provider';
import { DropZone } from './drop-zone';
import { ImagePreview, EmptyCover } from './image-preview';
import { UploadProgressBar } from './upload-progress-bar';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { UploadAssetType } from '@/types';

const OPTIONS: { value: UploadAssetType; label: string; hint: string; round?: boolean }[] = [
  { value: 'TRACK_COVER',   label: 'Track cover',   hint: 'Square · 1400×1400 px min' },
  { value: 'ALBUM_COVER',   label: 'Album cover',   hint: 'Square · 1400×1400 px min' },
  { value: 'ARTIST_AVATAR', label: 'Artist avatar', hint: 'Square · displays as circle', round: true },
  { value: 'ARTIST_BANNER', label: 'Artist banner', hint: '16:9 · 1920×1080 px recommended' },
  { value: 'USER_AVATAR',   label: 'Profile photo', hint: 'Square · displays as circle', round: true },
];

export function UploadCoverForm() {
  const { user }          = useAuthStore();
  const { data: artists } = useArtists({ limit: 100 });
  const artist            = artists?.items.find(a => a.userId === user?.id) ?? null;
  const { data: tracks }  = useTracks({ artistId: artist?.id, status: 'PUBLISHED', limit: 50 });
  const { error: toast }  = useToast();

  const [assetType, setAssetType] = useState<UploadAssetType>('TRACK_COVER');
  const [trackId,   setTrackId]   = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [done,      setDone]      = useState(false);

  const needsTrack = assetType === 'TRACK_COVER';
  const isRound    = OPTIONS.find(o => o.value === assetType)?.round ?? false;
  const coverUpload = useFileUpload({ assetType, trackId: needsTrack ? trackId : undefined, onDone: () => setDone(true) });
  const busy = coverUpload.state.phase !== 'idle';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverFile)            { toast('No image', 'Select an image first.'); return; }
    if (needsTrack && !trackId){ toast('Select a track', 'Choose which track this cover is for.'); return; }
    await coverUpload.upload(coverFile);
  };

  const onCoverFile = useCallback((f: File[]) => setCoverFile(f[0]), []);
  const onErr       = useCallback((e: { message: string }) => toast('Invalid file', e.message), [toast]);

  if (done) return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-10 text-center">
      <CheckCircle2 className="h-14 w-14 text-emerald-500" />
      <div><p className="text-lg font-bold">Image uploaded!</p><p className="mt-1 text-sm text-muted-foreground">Your image has been updated.</p></div>
      <button type="button" onClick={() => { setCoverFile(null); setDone(false); coverUpload.reset(); }}
        className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors">Upload another</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">What are you uploading?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {OPTIONS.map(opt => (
            <button key={opt.value} type="button" disabled={busy} onClick={() => setAssetType(opt.value)}
              className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all', assetType===opt.value?'border-primary bg-primary/10':'border-border hover:border-primary/40 hover:bg-secondary/60', busy&&'opacity-50 cursor-not-allowed')}>
              <ImageIcon className={cn('h-6 w-6', assetType===opt.value?'text-primary':'text-muted-foreground')} />
              <div>
                <p className={cn('text-xs font-semibold', assetType===opt.value?'text-primary':'text-foreground')}>{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{opt.hint}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {needsTrack && (
        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-sm font-semibold">Select track <span className="text-destructive">*</span></h2>
          {!artist ? <p className="text-sm text-muted-foreground">No artist profile found.</p> : (
            <select value={trackId} onChange={e => setTrackId(e.target.value)} disabled={busy || !tracks?.items.length}
              className="w-full rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Select a track…</option>
              {tracks?.items.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          )}
          {artist && !tracks?.items.length && <p className="text-xs text-muted-foreground">No published tracks found. Upload a track first.</p>}
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">{OPTIONS.find(o => o.value === assetType)?.label ?? 'Image'}</h2>
        <div className="flex gap-4">
          <div className={cn('h-28 w-28 shrink-0', isRound && 'rounded-full overflow-hidden')}>
            {coverFile
              ? <ImagePreview file={coverFile} onRemove={() => setCoverFile(null)} className={cn('h-full w-full', isRound && 'rounded-full')} />
              : <EmptyCover className="h-full w-full" round={isRound} />}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone accept={ACCEPTED_IMAGE_TYPES} maxSizeBytes={MAX_IMAGE_SIZE_BYTES} onFiles={onCoverFile} onError={onErr} type="image" label={coverFile?'Replace image':'Drop image here'} hint={OPTIONS.find(o=>o.value===assetType)?.hint} disabled={busy} className="min-h-[100px]" />
            <UploadProgressBar state={coverUpload.state} />
          </div>
        </div>
      </section>

      <div className="flex justify-end rounded-xl border border-border bg-card px-6 py-4">
        <button type="submit" disabled={!coverFile || busy}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {busy ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Uploading…</> : 'Upload image'}
        </button>
      </div>
    </form>
  );
}

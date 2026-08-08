'use client';

import { useState } from 'react';
import { Music2, Disc3, ImageIcon, Info, Shield, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { UploadTrackForm } from '@/components/upload/upload-track-form';
import { UploadAlbumForm } from '@/components/upload/upload-album-form';
import { UploadCoverForm } from '@/components/upload/upload-cover-form';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

type Tab = 'track' | 'album' | 'cover';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'track', label: 'Track',     icon: Music2,     description: 'Upload an audio file with metadata and optional cover art.' },
  { id: 'album', label: 'Album',     icon: Disc3,      description: 'Create an album or EP, then add tracks to it.' },
  { id: 'cover', label: 'Cover art', icon: ImageIcon,  description: 'Replace cover art for a track, album, or artist profile.' },
];

const TIPS: Record<Tab, { heading: string; items: string[] }> = {
  track: {
    heading: 'Track tips',
    items: [
      'Use WAV or FLAC for the best audio quality.',
      'Metadata cannot be edited while the track is processing.',
      'Square cover art at 3000×3000 px looks best.',
      'Mark tracks explicit if they contain mature content.',
      'Audio is processed asynchronously — safe to leave the page.',
    ],
  },
  album: {
    heading: 'Album tips',
    items: [
      'Create the album first, then upload and assign tracks to it.',
      'Square cover art with consistent style works best.',
      'Set a release date to help listeners discover new music.',
      'An EP is typically 3–6 tracks; a Single is one or two.',
    ],
  },
  cover: {
    heading: 'Cover art tips',
    items: [
      'Minimum recommended size is 1400×1400 px.',
      'Use square images (1:1) for tracks and albums.',
      'Artist banners look best at 16:9 (e.g. 1920×1080 px).',
      'PNG or JPEG at high quality is sufficient for streaming.',
    ],
  },
};

function TipsSidebar({ tab }: { tab: Tab }) {
  const { heading, items } = TIPS[tab];
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm font-semibold">{heading}</p>
        </div>
        <ul className="space-y-2.5">
          {items.map(tip => (
            <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-semibold">Content policy</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Only upload content you own or have rights to distribute.
          Uploads are reviewed against our community guidelines.
          Violating content will be removed.
        </p>
      </div>
    </aside>
  );
}

function AccessGuard() {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-12 text-center max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
        <Lock className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <div>
        <p className="text-lg font-bold">Artist access required</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Uploading music requires an Artist account.
          {user?.role === 'LISTENER' && (
            <> Create an artist profile from your profile page to unlock uploads.</>
          )}
        </p>
      </div>
      <Link href={ROUTES.PROFILE}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
        Go to profile
      </Link>
    </div>
  );
}

export function UploadClient() {
  const [tab, setTab]  = useState<Tab>('track');
  const { user }       = useAuthStore();
  const canUpload      = user?.role === 'ARTIST' || user?.role === 'ADMIN';

  return (
    <div className="px-4 py-8 lg:px-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upload</h1>
        <p className="mt-1 text-sm text-muted-foreground">Share your music with the world.</p>
      </div>

      {!canUpload ? (
        <AccessGuard />
      ) : (
        <div className="flex gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tab bar */}
            <div
              className="flex gap-1 rounded-xl border border-border bg-card p-1.5"
              role="tablist"
              aria-label="Upload type"
            >
              {TABS.map(t => {
                const Icon   = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                      'text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground -mt-2 px-1">
              {TABS.find(t => t.id === tab)?.description}
            </p>

            {/* Panel */}
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {tab === 'track' && <UploadTrackForm />}
              {tab === 'album' && <UploadAlbumForm />}
              {tab === 'cover' && <UploadCoverForm />}
            </div>
          </div>

          {/* Tips sidebar */}
          <TipsSidebar tab={tab} />
        </div>
      )}
    </div>
  );
}

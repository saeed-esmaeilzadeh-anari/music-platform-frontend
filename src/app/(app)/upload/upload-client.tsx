'use client';

import { useState } from 'react';
import { Music2, Disc3, ImageIcon, Info, Shield } from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/stores/auth.store';
import { useArtistProfile } from '@/hooks/use-artist-profile';
import { UploadTrackForm } from '@/components/upload/upload-track-form';
import { UploadAlbumForm } from '@/components/upload/upload-album-form';
import { UploadCoverForm } from '@/components/upload/upload-cover-form';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Tab definition ───────────────────────────────────────────────────────────

type UploadTab = 'track' | 'album' | 'cover';

interface TabConfig {
  id: UploadTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id:          'track',
    label:       'Track',
    icon:        Music2,
    description: 'Upload an audio file with metadata and optional cover art.',
  },
  {
    id:          'album',
    label:       'Album',
    icon:        Disc3,
    description: 'Create an album or EP, then add tracks to it.',
  },
  {
    id:          'cover',
    label:       'Cover art',
    icon:        ImageIcon,
    description: 'Replace the cover art for a track, album, or your artist profile.',
  },
];

// ─── Upload tips sidebar ──────────────────────────────────────────────────────

const TIPS: Record<UploadTab, { heading: string; items: string[] }> = {
  track: {
    heading: 'Track upload tips',
    items: [
      'Use WAV or FLAC for the best audio quality.',
      'Fill in all metadata before uploading — it cannot be edited while processing.',
      'Square cover art (1:1) at 3000×3000 px looks best.',
      'Mark your track explicit if it contains mature content.',
      'Audio is processed asynchronously — you can leave the page.',
    ],
  },
  album: {
    heading: 'Album tips',
    items: [
      'Create the album first, then upload individual tracks and assign them to it.',
      'Use a consistent square cover for the best results across devices.',
      'Set a release date to help listeners find new music.',
      'An EP is typically 3–6 tracks; a Single is one or two.',
    ],
  },
  cover: {
    heading: 'Cover art tips',
    items: [
      'Minimum recommended size is 1400×1400 px.',
      'Use square images (1:1 ratio) for track and album covers.',
      'Artist banners look best at 16:9 (e.g. 1920×1080 px).',
      'PNG or JPEG at 72 dpi is sufficient for streaming.',
    ],
  },
};

function TipsSidebar({ tab }: { tab: UploadTab }) {
  const { heading, items } = TIPS[tab];
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
      {/* Tips card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <p className="text-sm font-semibold">{heading}</p>
        </div>
        <ul className="space-y-2.5">
          {items.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Upload policy */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
          <p className="text-sm font-semibold">Content policy</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Only upload content you own or have the rights to distribute.
          Uploads are reviewed against our community guidelines.
          Violating tracks will be removed.
        </p>
      </div>
    </aside>
  );
}

// ─── Role guard ───────────────────────────────────────────────────────────────

function NotArtistGuard() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-12 text-center max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
        <Music2 className="h-7 w-7 text-muted-foreground/40" aria-hidden />
      </div>
      <div>
        <p className="text-lg font-bold">Artist access required</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Uploading music requires an Artist account.
          {user?.role === 'LISTENER' && (
            <> Your current role is <strong>Listener</strong>. Create an artist profile to unlock uploads.</>
          )}
        </p>
      </div>
      <Link
        href={ROUTES.PROFILE}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Go to profile
      </Link>
    </div>
  );
}

// ─── UploadClient ─────────────────────────────────────────────────────────────

export function UploadClient() {
  const [activeTab, setActiveTab] = useState<UploadTab>('track');
  const { user }                  = useAuthStore();

  const canUpload =
    user?.role === 'ARTIST' || user?.role === 'ADMIN';

  return (
    <div className="px-4 py-8 lg:px-8 max-w-[1200px]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upload</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Share your music with the world.
        </p>
      </div>

      {!canUpload ? (
        <NotArtistGuard />
      ) : (
        <div className="flex gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tabs */}
            <div
              className="flex gap-1 rounded-xl border border-border bg-card p-1.5"
              role="tablist"
              aria-label="Upload type"
            >
              {TABS.map((tab) => {
                const Icon    = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                      'text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab description */}
            <p className="text-sm text-muted-foreground -mt-2 px-1">
              {TABS.find((t) => t.id === activeTab)?.description}
            </p>

            {/* Tab panels */}
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeTab === 'track' && <UploadTrackForm />}
              {activeTab === 'album' && <UploadAlbumForm />}
              {activeTab === 'cover' && <UploadCoverForm />}
            </div>
          </div>

          {/* Tips sidebar — xl+ only */}
          <TipsSidebar tab={activeTab} />
        </div>
      )}
    </div>
  );
}
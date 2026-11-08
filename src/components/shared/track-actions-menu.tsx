'use client';

import { useState } from 'react';
import { ListPlus, ListEnd, ListStart, Flag, Heart } from 'lucide-react';
import { usePlayerStore } from '@/stores/player.store';
import { useIsFavoriteTrack } from '@/hooks/use-favorites';
import { useToast } from '@/providers/toast-provider';
import { useLocale } from '@/providers/locale-provider';
import { ReportModal } from './report-modal';
import type { TrackResponse } from '@/types';

interface TrackActionsMenuProps {
  track: TrackResponse;
  onClose: () => void;
  onAddToPlaylist: () => void;
  target?: 'TRACK' | 'ALBUM' | 'PLAYLIST' | 'COMMENT' | 'USER' | 'ARTIST';
}

/**
 * Shared "..." menu for tracks (used by rows and cards): play next,
 * add to queue, add to playlist, like and report. Right-click context
 * menus on rows/cards reuse the same actions through this component.
 */
export function TrackActionsMenu({
  track,
  onClose,
  onAddToPlaylist,
  target = 'TRACK',
}: TrackActionsMenuProps) {
  const t = useLocale().t;
  const { toast } = useToast();
  const insertNext = usePlayerStore(s => s.insertNext);
  const addToQueue = usePlayerStore(s => s.addToQueue);
  const { isFavorited, toggle } = useIsFavoriteTrack(track.id);
  const [reportOpen, setReportOpen] = useState(false);

  const closeAfter = (action: () => void) => {
    action();
    onClose();
  };

  const items: Array<{
    key: string;
    label: string;
    icon: React.ElementType;
    onClick: () => void;
  }> = [
    {
      key: 'play-next',
      label: t('contextMenu.playNext'),
      icon: ListStart,
      onClick: () => closeAfter(() => {
        insertNext(track);
        toast({ title: t('contextMenu.addedPlayNext'), variant: 'success' });
      }),
    },
    {
      key: 'add-queue',
      label: t('contextMenu.addToQueue'),
      icon: ListEnd,
      onClick: () => closeAfter(() => {
        addToQueue(track);
        toast({ title: t('contextMenu.addedToQueue'), variant: 'success' });
      }),
    },
    {
      key: 'add-playlist',
      label: t('contextMenu.addToPlaylist'),
      icon: ListPlus,
      onClick: () => closeAfter(onAddToPlaylist),
    },
    {
      key: 'like',
      label: isFavorited ? t('contextMenu.unlike') : t('contextMenu.like'),
      icon: Heart,
      onClick: () => closeAfter(() => toggle()),
    },
    {
      key: 'report',
      label: t('contextMenu.report'),
      icon: Flag,
      onClick: () => closeAfter(() => setReportOpen(true)),
    },
  ];

  return (
    <>
      <div
        role="menu"
        className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-card shadow-lg py-1"
      >
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            onClick={item.onClick}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
          >
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </button>
        ))}
      </div>

      {reportOpen && (
        <ReportModal
          targetType={target}
          targetId={track.id}
          targetLabel={track.title}
          onClose={() => {
            setReportOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

'use client';

import { useRef, useState } from 'react';
import { QueuePanel } from './queue-panel';
import { MiniPlayer } from './mini-player';
import { FullscreenPlayer } from './fullscreen-player';
import { KeyboardShortcutsHint } from './keyboard-shortcuts-hint';
import { useUIStore } from '@/stores/ui.store';
import { usePlayerStore } from '@/stores/player.store';

/**
 * PlayerShell
 *
 * Single import that wires together every player overlay:
 *   - QueuePanel (slide-in from right, toggled by ListMusic button & queue state)
 *   - MiniPlayer (floating bottom bar on mobile when PlayerBar is offscreen)
 *   - FullscreenPlayer (full-viewport expanded view on mobile, tap cover to open)
 *   - KeyboardShortcutsHint (floating ? button + modal on desktop)
 *
 * Mount once inside (app)/layout.tsx alongside PlayerBar.
 */

export function PlayerShell() {
  const { queuePanelOpen } = useUIStore();
  const { currentTrack } = usePlayerStore();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const playerBarRef = useRef<HTMLElement>(null);

  // FullscreenPlayer only makes sense when there's a track
  const showFullscreen = fullscreenOpen && !!currentTrack;

  return (
    <>
      {/* Queue panel — desktop sidebar + mobile overlay */}
      {queuePanelOpen && <QueuePanel />}

      {/* Mobile mini player — appears when PlayerBar scrolls off screen */}
      <MiniPlayer playerBarRef={playerBarRef as React.RefObject<HTMLElement>} />

      {/* Mobile fullscreen player */}
      {showFullscreen && (
        <FullscreenPlayer onClose={() => setFullscreenOpen(false)} />
      )}

      {/* Desktop keyboard shortcut hint */}
      <KeyboardShortcutsHint />
    </>
  );
}

// Re-export the playerBarRef so (app)/layout.tsx can attach it to the footer
export { type MiniPlayer };
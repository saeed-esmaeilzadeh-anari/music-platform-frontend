'use client';

import { MiniPlayer }              from './mini-player';
import { KeyboardShortcutsHint }   from './keyboard-shortcuts-hint';
import { QueuePanel }              from './queue-panel';
import { useUIStore }              from '@/stores/ui.store';

/**
 * PlayerShell
 *
 * Rendered as a sibling to <main> inside the (app) layout flex row.
 *
 * - QueuePanel: renders inline when open → pushes <main> on desktop,
 *   uses a fixed overlay backdrop on mobile (handled inside QueuePanel).
 * - MiniPlayer: position:fixed — mobile only, appears when PlayerBar
 *   scrolls offscreen (detected via IntersectionObserver on #player-bar-sentinel).
 * - KeyboardShortcutsHint: position:fixed — desktop only floating button + modal.
 */
export function PlayerShell() {
  const { queuePanelOpen, closeQueuePanel } = useUIStore();

  return (
    <>
      {/* Inline queue panel — pushes content sideways on desktop */}
      {queuePanelOpen && (
        <QueuePanel onClose={closeQueuePanel} />
      )}

      {/* Fixed overlays */}
      <MiniPlayer />
      <KeyboardShortcutsHint />
    </>
  );
}

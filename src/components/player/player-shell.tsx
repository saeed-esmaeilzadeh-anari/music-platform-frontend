'use client';

import { useState } from 'react';
import { FullscreenPlayer } from './fullscreen-player';
import { usePlayerStore } from '@/stores/player.store';

/**
 * PlayerShell
 *
 * Manages overlay player states that need client-side toggle logic:
 * - FullscreenPlayer (mobile expanded view)
 *
 * QueuePanel, MiniPlayer, and KeyboardShortcutsHint are mounted directly
 * in (app)/layout.tsx since they need no shared toggle state with each other.
 *
 * This component provides a context for the cover-art tap → fullscreen
 * gesture on mobile. Import and mount inside (app)/layout.tsx if needed.
 */
export function PlayerShell() {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const { currentTrack } = usePlayerStore();

  if (!currentTrack || !fullscreenOpen) return null;

  return (
    <FullscreenPlayer onClose={() => setFullscreenOpen(false)} />
  );
}
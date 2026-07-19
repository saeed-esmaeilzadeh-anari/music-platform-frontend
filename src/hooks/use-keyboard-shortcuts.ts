'use client';

/**
 * useKeyboardShortcuts
 *
 * Returns a descriptive map of every keyboard shortcut registered by
 * AudioProvider. Used exclusively by the KeyboardShortcutsHint component
 * to render the help modal — the actual keydown listeners live in
 * AudioProvider so they're always active regardless of which component
 * renders this hook.
 */

export interface ShortcutEntry {
  keys: string[];
  description: string;
  category: 'Playback' | 'Navigation' | 'Volume';
}

export function useKeyboardShortcuts(): ShortcutEntry[] {
  return [
    { keys: ['Space'],         description: 'Play / Pause',           category: 'Playback'    },
    { keys: ['Shift', '→'],   description: 'Next track',             category: 'Playback'    },
    { keys: ['Shift', '←'],   description: 'Previous track',         category: 'Playback'    },
    { keys: ['Alt', '→'],     description: 'Skip forward 10 s',      category: 'Navigation'  },
    { keys: ['Alt', '←'],     description: 'Skip backward 10 s',     category: 'Navigation'  },
    { keys: ['M'],             description: 'Mute / Unmute',          category: 'Volume'      },
    { keys: ['Alt', '↑'],     description: 'Volume up',              category: 'Volume'      },
    { keys: ['Alt', '↓'],     description: 'Volume down',            category: 'Volume'      },
    { keys: ['Alt', 'S'],     description: 'Toggle shuffle',         category: 'Playback'    },
    { keys: ['Alt', 'R'],     description: 'Cycle repeat mode',      category: 'Playback'    },
  ];
}
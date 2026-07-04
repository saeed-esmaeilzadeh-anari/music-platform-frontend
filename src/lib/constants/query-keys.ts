/**
 * Centralized TanStack Query key factory.
 * Every key is a tuple so invalidation is predictable and hierarchical.
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.tracks.all() })
 */

export const queryKeys = {
  // ---- AUTH ----
  auth: {
    me: () => ["auth", "me"] as const,
  },

  // ---- USERS ----
  users: {
    all: (params?: object) => ["users", params] as const,
    detail: (id: string) => ["users", id] as const,
    me: () => ["users", "me"] as const,
  },

  // ---- ARTISTS ----
  artists: {
    all: (params?: object) => ["artists", params] as const,
    detail: (id: string) => ["artists", id] as const,
  },

  // ---- GENRES ----
  genres: {
    all: () => ["genres"] as const,
    detail: (id: string) => ["genres", id] as const,
  },

  // ---- ALBUMS ----
  albums: {
    all: (params?: object) => ["albums", params] as const,
    detail: (id: string) => ["albums", id] as const,
    byArtist: (artistId: string, params?: object) =>
      ["albums", "artist", artistId, params] as const,
  },

  // ---- TRACKS ----
  tracks: {
    all: (params?: object) => ["tracks", params] as const,
    detail: (id: string) => ["tracks", id] as const,
    byArtist: (artistId: string, params?: object) =>
      ["tracks", "artist", artistId, params] as const,
    byAlbum: (albumId: string) => ["tracks", "album", albumId] as const,
  },

  // ---- PLAYLISTS ----
  playlists: {
    mine: (params?: object) => ["playlists", "me", params] as const,
    detail: (id: string) => ["playlists", id] as const,
  },

  // ---- FAVORITES ----
  favorites: {
    all: (params?: object) => ["favorites", params] as const,
  },

  // ---- LISTENING HISTORY ----
  history: {
    all: (params?: object) => ["history", params] as const,
  },

  // ---- SEARCH ----
  search: {
    results: (query: object) => ["search", query] as const,
  },

  // ---- UPLOAD ----
  uploads: {
    detail: (id: string) => ["uploads", id] as const,
  },

  // ---- COMMENTS ----
  comments: {
    byTarget: (targetType: string, targetId: string, params?: object) =>
      ["comments", targetType, targetId, params] as const,
  },

  // ---- LIKES ----
  likes: {
    count: (targetType: string, targetId: string) =>
      ["likes", "count", targetType, targetId] as const,
  },

  // ---- NOTIFICATIONS ----
  notifications: {
    all: (params?: object) => ["notifications", params] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  // ---- SUBSCRIPTION ----
  subscription: {
    active: () => ["subscription", "me"] as const,
  },

  // ---- PAYMENTS ----
  payments: {
    history: (params?: object) => ["payments", "history", params] as const,
  },

  // ---- ADMIN ----
  admin: {
    dashboard: () => ["admin", "dashboard"] as const,
  },
} as const;

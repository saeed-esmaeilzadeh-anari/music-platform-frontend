import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "Only letters, numbers, dots, dashes and underscores"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(/(?=.*[a-z])/, "Must contain a lowercase letter")
      .regex(/(?=.*[A-Z])/, "Must contain an uppercase letter")
      .regex(/(?=.*\d)/, "Must contain a number"),
    confirmPassword: z.string(),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Users ────────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

// ─── Artists ──────────────────────────────────────────────────────────────────

export const createArtistSchema = z.object({
  stageName: z
    .string()
    .min(1, "Stage name is required")
    .max(100, "Max 100 characters"),
  bio: z.string().max(2000, "Max 2000 characters").optional(),
});
export type CreateArtistFormValues = z.infer<typeof createArtistSchema>;

export const updateArtistSchema = createArtistSchema.partial();
export type UpdateArtistFormValues = z.infer<typeof updateArtistSchema>;

// ─── Albums ───────────────────────────────────────────────────────────────────

export const albumTypeValues = [
  "ALBUM",
  "SINGLE",
  "EP",
  "COMPILATION",
] as const;

export const createAlbumSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  type: z.enum(albumTypeValues).optional(),
  releaseDate: z.string().optional(),
  genreIds: z.array(z.string().uuid()).max(5).optional(),
});
export type CreateAlbumFormValues = z.infer<typeof createAlbumSchema>;

export const updateAlbumSchema = createAlbumSchema.partial();
export type UpdateAlbumFormValues = z.infer<typeof updateAlbumSchema>;

// ─── Tracks ───────────────────────────────────────────────────────────────────

export const createTrackSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  albumId: z.string().uuid().optional(),
  isExplicit: z.boolean().optional(),
  genreIds: z.array(z.string().uuid()).max(5).optional(),
});
export type CreateTrackFormValues = z.infer<typeof createTrackSchema>;

export const updateTrackSchema = createTrackSchema.partial();
export type UpdateTrackFormValues = z.infer<typeof updateTrackSchema>;

// ─── Playlists ────────────────────────────────────────────────────────────────

export const playlistVisibilityValues = [
  "PUBLIC",
  "PRIVATE",
  "UNLISTED",
] as const;

export const createPlaylistSchema = z.object({
  title: z.string().min(1, "Title is required").max(150, "Max 150 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  visibility: z.enum(playlistVisibilityValues).optional(),
});
export type CreatePlaylistFormValues = z.infer<typeof createPlaylistSchema>;

export const updatePlaylistSchema = createPlaylistSchema.partial();
export type UpdatePlaylistFormValues = z.infer<typeof updatePlaylistSchema>;

// ─── Comments ─────────────────────────────────────────────────────────────────

export const commentTargetValues = ["TRACK", "ALBUM", "PLAYLIST"] as const;

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Max 2000 characters"),
  targetType: z.enum(commentTargetValues),
  targetId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});
export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});
export type UpdateCommentFormValues = z.infer<typeof updateCommentSchema>;

// ─── Genres (admin) ───────────────────────────────────────────────────────────

export const createGenreSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  description: z.string().max(500).optional(),
});
export type CreateGenreFormValues = z.infer<typeof createGenreSchema>;

export const updateGenreSchema = createGenreSchema.partial();
export type UpdateGenreFormValues = z.infer<typeof updateGenreSchema>;

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptionPlanValues = [
  "PREMIUM_MONTHLY",
  "PREMIUM_YEARLY",
  "FAMILY",
] as const;

export const createSubscriptionSchema = z.object({
  plan: z.enum(subscriptionPlanValues),
});
export type CreateSubscriptionFormValues = z.infer<
  typeof createSubscriptionSchema
>;

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchEntityValues = [
  "ALL",
  "TRACK",
  "ALBUM",
  "ARTIST",
  "PLAYLIST",
] as const;

export const searchSchema = z.object({
  q: z.string().min(1, "Enter a search term"),
  type: z.enum(searchEntityValues).optional(),
});
export type SearchFormValues = z.infer<typeof searchSchema>;

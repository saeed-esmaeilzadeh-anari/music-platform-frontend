// ============================================================
// Types: Mirror of every backend DTO + Prisma enum
// Source of truth: NestJS DTOs in src/modules/**/*.dto.ts
// API prefix: /api/v1
// Response envelope: { success: true, statusCode: number, data: T, timestamp: string }
// ============================================================

// -----------------------------------------------------------
// ENUMS (mirror prisma/schema.prisma enums exactly)
// -----------------------------------------------------------

export type Role = "LISTENER" | "ARTIST" | "MODERATOR" | "ADMIN";

export type AccountStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETED"
  | "PENDING_VERIFICATION";

export type TrackStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type AlbumType = "ALBUM" | "SINGLE" | "EP" | "COMPILATION";

export type PlaylistVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export type LikeTargetType = "TRACK" | "ALBUM" | "PLAYLIST" | "COMMENT";

export type CommentTargetType = "TRACK" | "ALBUM" | "PLAYLIST";

export type NotificationType =
  | "NEW_FOLLOWER"
  | "NEW_RELEASE"
  | "PLAYLIST_ADD"
  | "COMMENT_REPLY"
  | "LIKE_RECEIVED"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_EXPIRING"
  | "PAYMENT_FAILED"
  | "SYSTEM";

export type SubscriptionPlan =
  | "FREE"
  | "PREMIUM_MONTHLY"
  | "PREMIUM_YEARLY"
  | "FAMILY";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "INCOMPLETE";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type PaymentProvider = "STRIPE" | "PAYPAL" | "MANUAL";

export type UploadAssetType =
  | "TRACK_AUDIO"
  | "TRACK_COVER"
  | "ALBUM_COVER"
  | "ARTIST_AVATAR"
  | "ARTIST_BANNER"
  | "PLAYLIST_COVER"
  | "USER_AVATAR";

export type UploadStatus =
  | "PENDING"
  | "UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type SearchEntityType =
  | "ALL"
  | "TRACK"
  | "ALBUM"
  | "ARTIST"
  | "PLAYLIST";

// -----------------------------------------------------------
// API ENVELOPE
// All success responses are wrapped in this shape:
// { success: true, statusCode: number, data: T, timestamp: string }
// -----------------------------------------------------------

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

// -----------------------------------------------------------
// PAGINATION
// -----------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// -----------------------------------------------------------
// AUTH  (mirrors: auth/dto/*)
// -----------------------------------------------------------

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  role: Role;
}

export interface AuthResponse {
  user: UserSummary;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// -----------------------------------------------------------
// USERS  (mirrors: users/dto/*)
// -----------------------------------------------------------

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// -----------------------------------------------------------
// ARTISTS  (mirrors: artists/dto/*)
// -----------------------------------------------------------

export interface ArtistResponse {
  id: string;
  userId: string;
  stageName: string;
  bio?: string | null;
  bannerUrl?: string | null;
  isVerified: boolean;
  monthlyListeners: number;
  createdAt: string;
}

export interface CreateArtistDto {
  stageName: string;
  bio?: string;
}

export interface UpdateArtistDto {
  stageName?: string;
  bio?: string;
}

// -----------------------------------------------------------
// GENRES  (mirrors: genres/dto/*)
// -----------------------------------------------------------

export interface GenreResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface CreateGenreDto {
  name: string;
  description?: string;
}

export interface UpdateGenreDto {
  name?: string;
  description?: string;
}

// -----------------------------------------------------------
// ALBUMS  (mirrors: albums/dto/*)
// -----------------------------------------------------------

export interface AlbumResponse {
  id: string;
  title: string;
  type: AlbumType;
  coverUrl?: string | null;
  releaseDate?: string | null;
  artistId: string;
  isPublished: boolean;
  createdAt: string;
}

export interface CreateAlbumDto {
  title: string;
  type?: AlbumType;
  releaseDate?: string;
  genreIds?: string[];
}

export interface UpdateAlbumDto {
  title?: string;
  type?: AlbumType;
  releaseDate?: string;
  genreIds?: string[];
}

export interface AlbumQuery extends PaginationQuery {
  artistId?: string;
}

// -----------------------------------------------------------
// TRACKS  (mirrors: tracks/dto/*)
// -----------------------------------------------------------

export interface TrackArtistSummary {
  id: string;
  stageName: string;
}

export interface TrackResponse {
  id: string;
  title: string;
  durationSec: number;
  audioUrl?: string | null;
  coverUrl?: string | null;
  status: TrackStatus;
  isExplicit: boolean;
  playCount: string; // BigInt serialized as string
  albumId?: string | null;
  artist: TrackArtistSummary;
  createdAt: string;
}

export interface CreateTrackDto {
  title: string;
  albumId?: string;
  isExplicit?: boolean;
  genreIds?: string[];
}

export interface UpdateTrackDto {
  title?: string;
  albumId?: string;
  isExplicit?: boolean;
  genreIds?: string[];
}

export interface TrackQuery extends PaginationQuery {
  search?: string;
  artistId?: string;
  albumId?: string;
  genreId?: string;
  status?: TrackStatus;
}

export interface RegisterPlayDto {
  progressSec?: number;
}

// -----------------------------------------------------------
// PLAYLISTS  (mirrors: playlists/dto/*)
// -----------------------------------------------------------

export interface PlaylistResponse {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  visibility: PlaylistVisibility;
  ownerId: string;
  createdAt: string;
}

export interface CreatePlaylistDto {
  title: string;
  description?: string;
  visibility?: PlaylistVisibility;
}

export interface UpdatePlaylistDto {
  title?: string;
  description?: string;
  visibility?: PlaylistVisibility;
}

export interface AddTrackToPlaylistDto {
  trackId: string;
  position?: number;
}

export interface ReorderPlaylistTrackDto {
  position: number;
}

// -----------------------------------------------------------
// FAVORITES  (mirrors: favorites/dto/*)
// -----------------------------------------------------------

export interface FavoriteResponse {
  id: string;
  trackId: string;
  createdAt: string;
}

export interface AddFavoriteDto {
  trackId: string;
}

// -----------------------------------------------------------
// LISTENING HISTORY  (mirrors: listening-history/dto/*)
// -----------------------------------------------------------

export interface ListeningHistoryResponse {
  id: string;
  trackId: string;
  playedAt: string;
  progressSec: number;
  completed: boolean;
}

// -----------------------------------------------------------
// COMMENTS  (mirrors: comments/dto/*)
// -----------------------------------------------------------

export interface CommentResponse {
  id: string;
  content: string;
  userId: string;
  targetType: CommentTargetType;
  parentId?: string | null;
  isEdited: boolean;
  createdAt: string;
}

export interface CreateCommentDto {
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

// -----------------------------------------------------------
// LIKES  (mirrors: likes/dto/*)
// -----------------------------------------------------------

export interface LikeResponse {
  id: string;
  targetType: LikeTargetType;
  createdAt: string;
}

export interface CreateLikeDto {
  targetType: LikeTargetType;
  targetId: string;
}

export interface LikeCountResponse {
  count: number;
}

// -----------------------------------------------------------
// NOTIFICATIONS  (mirrors: notifications/dto/*)
// -----------------------------------------------------------

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

// -----------------------------------------------------------
// SEARCH  (mirrors: search/dto/*)
// -----------------------------------------------------------

export interface SearchResult {
  tracks: Array<{ id: string; title: string; artistName: string }>;
  albums: Array<{ id: string; title: string; artistName: string }>;
  artists: Array<{ id: string; stageName: string }>;
  playlists: Array<{ id: string; title: string }>;
}

export interface SearchQuery extends PaginationQuery {
  q: string;
  type?: SearchEntityType;
}

// -----------------------------------------------------------
// UPLOAD  (mirrors: upload/dto/*)
// -----------------------------------------------------------

export interface RequestUploadDto {
  assetType: UploadAssetType;
  originalName: string;
  mimeType: string;
  trackId?: string;
}

export interface PresignedUploadResponse {
  uploadId: string;
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface ConfirmUploadDto {
  uploadId: string;
  sizeBytes?: number;
}

export interface UploadResponse {
  id: string;
  assetType: UploadAssetType;
  status: UploadStatus;
  s3Key: string;
  trackId?: string | null;
  createdAt: string;
}

// -----------------------------------------------------------
// SUBSCRIPTION  (mirrors: subscription/dto/*)
// -----------------------------------------------------------

export type SubscriptionPlanInput =
  | "PREMIUM_MONTHLY"
  | "PREMIUM_YEARLY"
  | "FAMILY";

export interface CreateSubscriptionDto {
  plan: SubscriptionPlanInput;
}

export interface SubscriptionResponse {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

// -----------------------------------------------------------
// PAYMENTS  (mirrors: payments/dto/*)
// -----------------------------------------------------------

export interface PaymentResponse {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
}

// -----------------------------------------------------------
// ADMIN  (mirrors: admin/dto/*)
// -----------------------------------------------------------

export interface AdminDashboardStats {
  totalUsers: number;
  totalArtists: number;
  totalTracks: number;
  totalAlbums: number;
  activeSubscriptions: number;
}

export interface UpdateUserStatusDto {
  status: "ACTIVE" | "SUSPENDED";
}

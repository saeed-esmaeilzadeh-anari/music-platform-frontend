"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music2, CheckCircle2, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { createTrackSchema, type CreateTrackFormValues } from "@/lib/validators";
import { useCreateTrack } from "@/hooks/use-tracks";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useArtists } from "@/hooks/use-artists";
import { useAlbums } from "@/hooks/use-albums";
import { useAuthStore } from "@/stores/auth.store";
import { useGenres } from "@/hooks/use-catalog";
import { useToast } from "@/providers/toast-provider";
import { DropZone } from "./drop-zone";
import { ImagePreview, EmptyCover } from "./image-preview";
import { UploadProgressBar } from "./upload-progress-bar";
import {
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  ROUTES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ArtistResponse } from "@/types";

// ─── Shared primitives ─────────────────────────────────────────────────────────

function Step({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <div className={cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
      done  ? "bg-emerald-500 text-white"
            : active ? "bg-primary text-primary-foreground"
                     : "bg-secondary border border-border text-muted-foreground",
    )}>
      {done ? "✓" : n}
    </div>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls = (err?: boolean, disabled?: boolean) =>
  cn(
    "w-full rounded-md bg-secondary border px-3 py-2.5 text-sm text-foreground",
    "placeholder:text-muted-foreground/50 outline-none transition-colors",
    "focus:border-primary/50 focus:ring-2 focus:ring-ring/20",
    err ? "border-destructive" : "border-border",
    disabled && "opacity-50 cursor-not-allowed",
  );

const selectCls = (disabled?: boolean) =>
  cn(
    "w-full appearance-none rounded-md bg-secondary border border-border",
    "px-3 py-2.5 pe-9 text-sm text-foreground outline-none transition-colors",
    "focus:border-primary/50 focus:ring-2 focus:ring-ring/20",
    disabled && "opacity-50 cursor-not-allowed",
  );

// ─── Artist selector — only for ADMIN / MODERATOR ─────────────────────────────

interface ArtistSelectorProps {
  value: string;
  onChange: (artistId: string, artist: ArtistResponse | null) => void;
  disabled?: boolean;
}

function ArtistSelector({ value, onChange, disabled }: ArtistSelectorProps) {
  // Load ALL artists — no userId filter — so Admin can pick any of them
  const { data, isLoading } = useArtists({ limit: 100 });
  const artists = data?.items ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const artist = artists.find((a) => a.id === id) ?? null;
    onChange(id, artist);
  };

  return (
    <Field label="Artist" required>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || isLoading}
          className={selectCls(disabled || isLoading)}
        >
          <option value="">
            {isLoading ? "Loading artists…" : "Select an artist…"}
          </option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.stageName}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      {!isLoading && artists.length === 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          No artists found. Create an artist profile first.
        </p>
      )}
    </Field>
  );
}

// ─── Album selector — filtered by selected artistId ───────────────────────────

interface AlbumSelectorProps {
  artistId: string;
  value: string;
  onChange: (albumId: string) => void;
  disabled?: boolean;
}

function AlbumSelector({ artistId, value, onChange, disabled }: AlbumSelectorProps) {
  const { data, isLoading } = useAlbums(artistId ? { artistId, limit: 100 } : undefined);
  const albums = data?.items ?? [];

  if (!artistId) return null;

  return (
    <Field label="Album">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className={selectCls(disabled || isLoading)}
        >
          <option value="">
            {isLoading ? "Loading albums…" : "No album (single)"}
          </option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
    </Field>
  );
}

// ─── UploadTrackForm ──────────────────────────────────────────────────────────

export function UploadTrackForm() {
  const { user }         = useAuthStore();
  const { error: toast } = useToast();
  const { data: genres } = useGenres();

  // ── Role-based artist resolution ──────────────────────────────────────────
  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  // For ARTIST: find their own profile from the list (keep existing behaviour)
  const { data: allArtists } = useArtists({ limit: 100 });
  const ownArtist = isAdmin
    ? null
    : allArtists?.items.find((a) => a.userId === user?.id) ?? null;

  // For ADMIN: track the artist the admin selects from the dropdown
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedArtist,   setSelectedArtist]   = useState<ArtistResponse | null>(null);

  // The effective artistId that will be sent to the backend URL:
  //   Admin  → selectedArtistId  (chosen from dropdown)
  //   Artist → ownArtist.id
  const effectiveArtistId = isAdmin ? selectedArtistId : ownArtist?.id ?? "";
  const effectiveArtist   = isAdmin ? selectedArtist   : ownArtist;

  // Album selection (only visible after artist is chosen)
  const [selectedAlbumId, setSelectedAlbumId] = useState("");

  // useCreateTrack MUST be called unconditionally (Rules of Hooks).
  // It closes over effectiveArtistId, so it will use the correct value
  // at the time the mutation is triggered.
  const createTrack = useCreateTrack(effectiveArtistId);

  // Upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [trackId,   setTrackId]   = useState<string | null>(null);
  const [done,      setDone]      = useState(false);

  const coverUpload = useFileUpload({
    assetType: "TRACK_COVER",
    trackId:   trackId ?? undefined,
    onDone:    () => setDone(true),
  });
  const audioUpload = useFileUpload({
    assetType: "TRACK_AUDIO",
    trackId:   trackId ?? undefined,
    onDone: () => {
      if (coverFile && trackId) coverUpload.upload(coverFile);
      else setDone(true);
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<CreateTrackFormValues>({
      resolver: zodResolver(createTrackSchema),
      defaultValues: { title: "", isExplicit: false, genreIds: [] },
    });

  const busy =
    isSubmitting ||
    createTrack.isPending ||
    audioUpload.state.phase !== "idle" ||
    coverUpload.state.phase !== "idle";

  const onSubmit = async (values: CreateTrackFormValues) => {
    // Guard: artist must be resolved
    if (!effectiveArtistId) {
      toast(
        isAdmin ? "Select an artist" : "No artist profile",
        isAdmin
          ? "Choose the artist this track belongs to."
          : "Create an artist profile first.",
      );
      return;
    }
    if (!audioFile) {
      toast("Audio required", "Select an audio file.");
      return;
    }

    // Build DTO — artistId is in the URL path, not the body
    const dto: CreateTrackFormValues = {
      title:      values.title,
      isExplicit: values.isExplicit,
      genreIds:   values.genreIds,
      // Include albumId only when one is chosen
      ...(selectedAlbumId ? { albumId: selectedAlbumId } : {}),
    };

    const track = await createTrack.mutateAsync(dto);
    setTrackId(track.id);
    await audioUpload.upload(audioFile);
  };

  const onAudioErr  = useCallback((e: { message: string }) => toast("Invalid file", e.message), [toast]);
  const onCoverErr  = useCallback((e: { message: string }) => toast("Invalid file", e.message), [toast]);
  const onAudioFile = useCallback((f: File[]) => setAudioFile(f[0]), []);
  const onCoverFile = useCallback((f: File[]) => setCoverFile(f[0]), []);

  const resetForm = () => {
    setAudioFile(null);
    setCoverFile(null);
    setTrackId(null);
    setDone(false);
    setSelectedArtistId("");
    setSelectedArtist(null);
    setSelectedAlbumId("");
    audioUpload.reset();
    coverUpload.reset();
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (user?.role === "LISTENER") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <Music2 className="h-10 w-10 text-muted-foreground/30" />
        <div>
          <p className="font-semibold">Artist profile required</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an artist profile to upload tracks.
          </p>
        </div>
        <Link
          href={ROUTES.PROFILE}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to profile
        </Link>
      </div>
    );
  }

  // ARTIST role but no artist profile created yet
  if (!isAdmin && !ownArtist && allArtists !== undefined) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
        <Music2 className="h-10 w-10 text-muted-foreground/30" />
        <div>
          <p className="font-semibold">No artist profile found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You need an artist profile before you can upload tracks.
          </p>
        </div>
        <Link
          href={ROUTES.PROFILE}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to profile
        </Link>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <div>
          <p className="text-lg font-bold">Track uploaded!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Audio is being processed and will go live shortly.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Upload another
          </button>
          {effectiveArtist && (
            <Link
              href={ROUTES.ARTIST(effectiveArtist.id)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              View artist page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Step 1: Metadata */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Step n={1} done={!!trackId} active={!trackId} />
          <h2 className="text-sm font-semibold">Track details</h2>
        </div>

        {/* ── ADMIN: artist picker ── */}
        {isAdmin && (
          <ArtistSelector
            value={selectedArtistId}
            onChange={(id, artist) => {
              setSelectedArtistId(id);
              setSelectedArtist(artist);
              setSelectedAlbumId(""); // reset album when artist changes
            }}
            disabled={busy}
          />
        )}

        {/* Album picker — shown once an artist is known */}
        <AlbumSelector
          artistId={effectiveArtistId}
          value={selectedAlbumId}
          onChange={setSelectedAlbumId}
          disabled={busy}
        />

        {/* Title */}
        <Field label="Title" required error={errors.title?.message}>
          <input
            {...register("title")}
            type="text"
            placeholder="Track title"
            disabled={busy}
            className={inputCls(!!errors.title, busy)}
          />
        </Field>

        {/* Genres */}
        {!!genres?.length && (
          <Field label="Genres">
            <div className="flex flex-wrap gap-2 mt-1">
              {genres.map((g) => (
                <label key={g.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    value={g.id}
                    disabled={busy}
                    {...register("genreIds")}
                    className="sr-only peer"
                  />
                  <span className={cn(
                    "inline-block rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                    "border-border text-muted-foreground bg-secondary",
                    "peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary",
                    "hover:border-primary/60 hover:text-foreground",
                    busy && "opacity-50 pointer-events-none",
                  )}>
                    {g.name}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        )}

        {/* Explicit toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              disabled={busy}
              {...register("isExplicit")}
              className="sr-only peer"
            />
            <div className="h-5 w-9 rounded-full bg-secondary border border-border peer-checked:bg-primary transition-colors" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Explicit content</p>
            <p className="text-xs text-muted-foreground">Contains mature or explicit lyrics</p>
          </div>
        </label>
      </section>

      {/* Step 2: Audio */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Step
            n={2}
            done={["done", "processing"].includes(audioUpload.state.phase)}
            active={!!audioFile}
          />
          <h2 className="text-sm font-semibold">
            Audio file <span className="text-destructive ml-0.5">*</span>
          </h2>
        </div>
        {audioFile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3">
              <Music2 className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{audioFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB · {audioFile.type}
                </p>
              </div>
              {audioUpload.state.phase === "idle" && (
                <button
                  type="button"
                  onClick={() => setAudioFile(null)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            <UploadProgressBar state={audioUpload.state} />
          </div>
        ) : (
          <DropZone
            accept={ACCEPTED_AUDIO_TYPES}
            maxSizeBytes={MAX_AUDIO_SIZE_BYTES}
            onFiles={onAudioFile}
            onError={onAudioErr}
            type="audio"
            label="Drop audio file here"
            hint="MP3, WAV, FLAC, AAC · Max 100 MB"
            disabled={busy}
            className="min-h-[140px]"
          />
        )}
      </section>

      {/* Step 3: Cover */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Step n={3} done={coverUpload.state.phase === "done"} active={!!coverFile} />
          <h2 className="text-sm font-semibold">
            Cover art{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="h-28 w-28 shrink-0">
            {coverFile ? (
              <ImagePreview file={coverFile} onRemove={() => setCoverFile(null)} className="h-full w-full" />
            ) : (
              <EmptyCover className="h-full w-full" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <DropZone
              accept={ACCEPTED_IMAGE_TYPES}
              maxSizeBytes={MAX_IMAGE_SIZE_BYTES}
              onFiles={onCoverFile}
              onError={onCoverErr}
              type="image"
              label={coverFile ? "Replace cover" : "Drop image here"}
              hint="JPEG, PNG, WebP · Max 5 MB · Square recommended"
              disabled={busy}
              className="min-h-[100px]"
            />
            <UploadProgressBar state={coverUpload.state} />
          </div>
        </div>
      </section>

      {/* Submit footer */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-6 py-4">
        <p className="text-xs text-muted-foreground">
          {effectiveArtist ? (
            <>
              Uploading as{" "}
              <span className="font-semibold text-foreground">{effectiveArtist.stageName}</span>
            </>
          ) : isAdmin ? (
            <span className="text-amber-500">← Select an artist first</span>
          ) : (
            "Loading artist…"
          )}
        </p>
        <button
          type="submit"
          disabled={busy || !audioFile || (isAdmin && !selectedArtistId)}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {audioUpload.state.phase !== "idle" ? "Uploading…" : "Creating…"}
            </>
          ) : (
            "Upload track"
          )}
        </button>
      </div>
    </form>
  );
}

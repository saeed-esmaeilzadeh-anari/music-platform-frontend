'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { updatePlaylistSchema, type UpdatePlaylistFormValues } from '@/lib/validators';
import { useUpdatePlaylist } from '@/hooks/use-playlists';
import { Button } from '@/components/ui/button';
import { FormField, FormInput, FormError } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import type { PlaylistResponse, PlaylistVisibility } from '@/types';

interface PlaylistEditModalProps {
  playlist: PlaylistResponse;
  onClose: () => void;
}

const VISIBILITY_OPTIONS: { value: PlaylistVisibility; label: string; hint: string }[] = [
  { value: 'PRIVATE',  label: 'Private',  hint: 'Only you can see this' },
  { value: 'UNLISTED', label: 'Unlisted', hint: 'Anyone with the link' },
  { value: 'PUBLIC',   label: 'Public',   hint: 'Visible to everyone' },
];

export function PlaylistEditModal({ playlist, onClose }: PlaylistEditModalProps) {
  const update = useUpdatePlaylist(playlist.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdatePlaylistFormValues>({
    resolver: zodResolver(updatePlaylistSchema),
    defaultValues: {
      title:       playlist.title,
      description: playlist.description ?? '',
      visibility:  playlist.visibility,
    },
  });

  // Reset when playlist data changes (e.g. after a successful save)
  useEffect(() => {
    reset({
      title:       playlist.title,
      description: playlist.description ?? '',
      visibility:  playlist.visibility,
    });
  }, [playlist, reset]);

  const visibility = watch('visibility');

  const onSubmit = async (values: UpdatePlaylistFormValues) => {
    await update.mutateAsync({
      title:       values.title,
      description: values.description || undefined,
      visibility:  values.visibility,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Edit playlist"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-border bg-card shadow-2xl animate-fade-in',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Edit playlist</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-5">
          {/* Title */}
          <FormField label="Title" required>
            <FormInput
              type="text"
              placeholder="My playlist"
              error={!!errors.title}
              {...register('title')}
            />
            <FormError message={errors.title?.message} />
          </FormField>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Optional description…"
              className={cn(
                'w-full resize-none rounded-md bg-secondary border border-border',
                'px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50',
                'outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20',
                'transition-colors',
              )}
            />
            <FormError message={errors.description?.message} />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('visibility', opt.value, { shouldDirty: true })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md border px-3 py-3 text-xs transition-all',
                    visibility === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary',
                  )}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className={cn('text-center leading-tight', visibility === opt.value ? 'text-primary/70' : 'text-muted-foreground/60')}>
                    {opt.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting || update.isPending}
              disabled={!isDirty || isSubmitting || update.isPending}
            >
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ListMusic } from 'lucide-react';
import { createPlaylistSchema, type CreatePlaylistFormValues } from '@/lib/validators';
import { useCreatePlaylist } from '@/hooks/use-playlists';
import { Button } from '@/components/ui/button';
import { FormField, FormInput, FormError } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import type { PlaylistVisibility } from '@/types';

interface PlaylistCreateModalProps {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

const VISIBILITY_OPTIONS: { value: PlaylistVisibility; label: string; hint: string }[] = [
  { value: 'PRIVATE',  label: 'Private',  hint: 'Only you' },
  { value: 'UNLISTED', label: 'Unlisted', hint: 'Anyone with link' },
  { value: 'PUBLIC',   label: 'Public',   hint: 'Everyone' },
];

export function PlaylistCreateModal({ onClose, onCreated }: PlaylistCreateModalProps) {
  const titleId = useId();
  const descId  = useId();
  const create  = useCreatePlaylist();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<CreatePlaylistFormValues>({
      resolver: zodResolver(createPlaylistSchema),
      defaultValues: { title: '', description: '', visibility: 'PRIVATE' },
    });

  const visibility = watch('visibility');

  const onSubmit = async (values: CreatePlaylistFormValues) => {
    const result = await create.mutateAsync({
      title:       values.title,
      description: values.description || undefined,
      visibility:  values.visibility,
    });
    onCreated?.(result.id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div role="dialog" aria-label="Create playlist" aria-modal="true"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ListMusic className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">New playlist</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-5">
          {/* Title */}
          <FormField label="Title" required>
            <FormInput id={titleId} type="text" placeholder="My playlist"
              error={!!errors.title} autoFocus {...register('title')} />
            <FormError message={errors.title?.message} />
          </FormField>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor={descId}
              className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <textarea id={descId} rows={3} placeholder="Optional description…"
              {...register('description')}
              className="w-full resize-none rounded-md bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/20 transition-colors" />
            <FormError message={errors.description?.message} />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <span className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Visibility
            </span>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => setValue('visibility', opt.value, { shouldDirty: true })}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md border px-3 py-3 text-xs transition-all',
                    visibility === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary',
                  )}>
                  <span className="font-semibold">{opt.label}</span>
                  <span className={cn('text-[10px]', visibility === opt.value ? 'text-primary/70' : 'text-muted-foreground/60')}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="md"
              loading={isSubmitting || create.isPending}
              disabled={isSubmitting || create.isPending}>
              Create playlist
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

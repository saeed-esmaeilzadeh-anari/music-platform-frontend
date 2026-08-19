'use client';

import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, X } from 'lucide-react';
import { createCommentSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';
import type { CommentTargetType } from '@/types';

interface CommentFormProps {
  targetType: CommentTargetType;
  targetId:   string;
  parentId?:  string;
  /** Prefilled text for edit mode */
  initialValue?: string;
  /** 'create' | 'edit' | 'reply' */
  mode?: 'create' | 'edit' | 'reply';
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit:   (content: string) => Promise<void>;
  onCancel?:  () => void;
}

export function CommentForm({
  targetType, targetId, parentId,
  initialValue = '', mode = 'create',
  placeholder, autoFocus = false,
  onSubmit, onCancel,
}: CommentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } =
    useForm<{ content: string }>({
      resolver: zodResolver(createCommentSchema.pick({ content: true })),
      defaultValues: { content: initialValue },
    });

  const { ref: rhfRef, ...registerRest } = register('content');

  // Merge refs
  const setRef = (el: HTMLTextAreaElement | null) => {
    rhfRef(el);
    (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
  };

  // Auto-resize textarea
  const content = watch('content');
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleFormSubmit = async ({ content }: { content: string }) => {
    await onSubmit(content.trim());
    if (mode !== 'edit') reset();
  };

  const isEmpty = !content?.trim();

  const PLACEHOLDER = {
    create: 'Write a comment…',
    reply:  'Write a reply…',
    edit:   'Edit your comment…',
  }[mode];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className={cn(
        'flex gap-3',
        mode === 'reply' && 'pl-12',
      )}>
        <div className="flex-1 min-w-0">
          <div className={cn(
            'rounded-xl border transition-colors',
            'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/20',
            mode === 'edit'
              ? 'border-primary/40 bg-primary/5'
              : 'border-border bg-secondary',
          )}>
            <textarea
              {...registerRest}
              ref={setRef}
              placeholder={placeholder ?? PLACEHOLDER}
              rows={mode === 'create' ? 2 : 1}
              className={cn(
                'w-full resize-none rounded-xl bg-transparent px-4 py-3',
                'text-sm text-foreground placeholder:text-muted-foreground/50',
                'outline-none min-h-[44px] max-h-40 overflow-y-auto',
              )}
              onKeyDown={e => {
                // Cmd/Ctrl+Enter submits
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(handleFormSubmit)();
                }
                // Escape cancels
                if (e.key === 'Escape') onCancel?.();
              }}
            />
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-muted-foreground/50">
              {mode !== 'create' ? null : (
                <>⌘↵ to submit · Esc to cancel</>
              )}
            </span>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button type="button" onClick={onCancel}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="h-3 w-3" /> Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isEmpty || isSubmitting}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5',
                  'text-xs font-semibold transition-all',
                  'bg-primary text-primary-foreground',
                  'hover:opacity-90 active:scale-95',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                {isSubmitting ? (
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                {mode === 'edit' ? 'Save' : mode === 'reply' ? 'Reply' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

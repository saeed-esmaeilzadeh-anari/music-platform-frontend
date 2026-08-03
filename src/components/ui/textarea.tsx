import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-md border bg-input px-3.5 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground/60',
        'transition-colors duration-150 resize-y',
        'outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background',
        'border-border',
        error && 'border-destructive focus:ring-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

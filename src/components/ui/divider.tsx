import { cn } from "@/lib/utils";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn("border-border", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />
      <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

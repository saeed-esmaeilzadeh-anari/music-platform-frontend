"use client";

import { UploadCloud, FileAudio, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/index";
import { useDropZone, type DropZoneError } from "@/hooks/use-drop-zone";

interface DropZoneProps {
  accept: string[];
  maxSizeBytes: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  onError?: (err: DropZoneError) => void;
  type?: "audio" | "image" | "generic";
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function DropZone({
  accept,
  maxSizeBytes,
  multiple = false,
  onFiles,
  onError,
  type = "generic",
  label,
  hint,
  disabled = false,
  className,
  children,
}: DropZoneProps) {
  const { rootProps, inputProps, isOver } = useDropZone({
    accept,
    maxSizeBytes,
    multiple,
    onFiles,
    onError,
  });

  const Icon =
    type === "audio" ? FileAudio : type === "image" ? ImageIcon : UploadCloud;
  const mb = Math.round(maxSizeBytes / 1024 / 1024);

  return (
    <div
      {...(disabled ? {} : rootProps)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label ?? "Drop file or click to browse"}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          rootProps.onClick();
        }
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed",
        "cursor-pointer select-none outline-none transition-all duration-200",
        disabled
          ? "border-border/30 bg-secondary/20 opacity-50 cursor-not-allowed"
          : isOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-border/60 bg-secondary/30 hover:border-primary/60 hover:bg-secondary/50",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <input {...inputProps} disabled={disabled} />

      {isOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary/10 border-2 border-primary">
          <div className="flex flex-col items-center gap-2 text-primary">
            <UploadCloud className="h-10 w-10" />
            <p className="text-sm font-semibold">Drop to upload</p>
          </div>
        </div>
      )}

      {children ?? (
        <div className="pointer-events-none flex flex-col items-center gap-3 px-6 py-8 text-center">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary",
              isOver && "bg-primary/10 border-primary/40"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                isOver ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {label ?? "Drag & drop or click to browse"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hint ?? `Accepted: ${accept.join(", ")} · Max ${mb} MB`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

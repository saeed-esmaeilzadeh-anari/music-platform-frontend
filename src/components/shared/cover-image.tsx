import { useState } from "react";
import { Music2, Disc3, User, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils/index";

type CoverType = "track" | "album" | "artist" | "playlist";

interface CoverImageProps {
  src?: string | null;
  alt: string;
  type?: CoverType;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const SIZE_MAP = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-full w-full",
};

const ICON_MAP: Record<CoverType, React.ElementType> = {
  track: Music2,
  album: Disc3,
  artist: User,
  playlist: ListMusic,
};

const SHAPE_MAP: Record<CoverType, string> = {
  track: "rounded",
  album: "rounded",
  artist: "rounded-full",
  playlist: "rounded",
};

export function CoverImage({
  src,
  alt,
  type = "track",
  className,
  size = "md",
}: CoverImageProps) {
  const [error, setError] = useState(false);
  const Icon = ICON_MAP[type];
  const shape = SHAPE_MAP[type];

  if (!src || error) {
    return (
      <div
        className={cn(
          "bg-secondary border border-border flex items-center justify-center shrink-0",
          shape,
          size === "xl" ? "h-full w-full" : SIZE_MAP[size],
          className
        )}
      >
        <Icon className="h-1/3 w-1/3 text-muted-foreground/30" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn(
        "object-cover shrink-0",
        shape,
        size === "xl" ? "h-full w-full" : SIZE_MAP[size],
        className
      )}
    />
  );
}

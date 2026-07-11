import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function SidebarWordmark() {
  return (
    <Link
      href={ROUTES.BROWSE}
      className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
      aria-label="Soundwave — go to browse"
    >
      {/* Waveform icon — 5 bars of varying heights */}
      <span className="flex shrink-0 items-end gap-[3px] h-5" aria-hidden>
        {[3, 5, 7, 5, 4].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-primary group-hover:bg-accent transition-colors duration-200"
            style={{ height: `${h * 2.8}px` }}
          />
        ))}
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Soundwave
      </span>
    </Link>
  );
}

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface AuthWavePanelProps {
  heading: string;
  subheading: string;
  /** Feature bullets shown below the heading */
  features?: string[];
}

/**
 * The left-side atmospheric panel used on login and register.
 * Signature element: 5 animated waveform bars in violet.
 * Hidden on mobile — the form takes full width.
 */
export function AuthWavePanel({ heading, subheading, features }: AuthWavePanelProps) {
  return (
    <div
      className="
        hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0
        flex-col justify-between
        bg-[#0D0E1A]
        border-r border-border
        p-10 xl:p-14
        relative overflow-hidden
      "
    >
      {/* Background gradient orb — ambient glow behind waveform */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
                   h-[420px] w-[420px] rounded-full
                   bg-[radial-gradient(circle,hsl(263_70%_58%/0.18)_0%,transparent_70%)]"
      />

      {/* Wordmark */}
      <Link
        href={ROUTES.BROWSE}
        className="relative z-10 inline-flex items-center gap-2.5 group w-fit"
        aria-label="Soundwave home"
      >
        {/* Minimal icon — stacked bars */}
        <span className="flex items-end gap-[3px] h-6" aria-hidden>
          {[3, 5, 7, 5, 4].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-primary group-hover:bg-accent transition-colors duration-300"
              style={{ height: `${h * 3}px` }}
            />
          ))}
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Soundwave
        </span>
      </Link>

      {/* Centre content */}
      <div className="relative z-10 space-y-8">
        {/* Animated waveform — the signature element */}
        <div
          className="flex items-end gap-[6px] h-16"
          aria-hidden
          role="presentation"
        >
          <span className="w-[6px] rounded-full bg-primary/90 glow-violet wave-bar-1" style={{ minHeight: 18 }} />
          <span className="w-[6px] rounded-full bg-primary/90 glow-violet wave-bar-2" style={{ minHeight: 18 }} />
          <span className="w-[6px] rounded-full bg-accent/90     glow-violet wave-bar-3" style={{ minHeight: 18 }} />
          <span className="w-[6px] rounded-full bg-primary/90 glow-violet wave-bar-4" style={{ minHeight: 18 }} />
          <span className="w-[6px] rounded-full bg-primary/90 glow-violet wave-bar-5" style={{ minHeight: 18 }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            {heading}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
            {subheading}
          </p>
        </div>

        {features && features.length > 0 && (
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden
                />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} Soundwave. All rights reserved.
      </p>
    </div>
  );
}

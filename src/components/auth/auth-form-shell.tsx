import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface AuthFormShellProps {
  title: string;
  description: string;
  /** Shown in the "Don't have an account? X" footer link area */
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

/**
 * Right-panel shell for all auth pages.
 * Handles the scroll container, mobile wordmark, title block, and footer link.
 * The form itself goes in {children}.
 */
export function AuthFormShell({
  title,
  description,
  footerPrompt,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthFormShellProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 overflow-y-auto">
      <div className="w-full max-w-[400px] space-y-7">
        {/* Mobile-only wordmark — the panel is hidden on small screens */}
        <Link
          href={ROUTES.BROWSE}
          className="lg:hidden inline-flex items-center gap-2 group mb-2"
          aria-label="Soundwave home"
        >
          <span className="flex items-end gap-[3px] h-5" aria-hidden>
            {[3, 5, 7, 5, 4].map((h, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-primary"
                style={{ height: `${h * 2.5}px` }}
              />
            ))}
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Soundwave
          </span>
        </Link>

        {/* Title block */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Form */}
        {children}

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          {footerPrompt}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-primary hover:text-accent transition-colors underline-offset-4 hover:underline"
          >
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

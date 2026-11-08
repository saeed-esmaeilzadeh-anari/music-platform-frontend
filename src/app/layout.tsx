import type { Metadata } from "next";
import "./globals.css";
import { RootProviders } from "@/providers";
import { LocaleProvider } from "@/providers/locale-provider";
import { localeMeta } from "@/lib/i18n/config";
import { getServerLocale, getServerT } from "@/lib/i18n/server";
import localFont from "next/font/local";

const iransansweb = localFont({
  src: [
    { path: "../../public/IRANSansWeb_Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/IRANSansWeb.woff2", weight: "400", style: "normal" },
    { path: "../../public/IRANSansWeb_Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/IRANSansWeb_Bold.woff2", weight: "600", style: "normal" },
    { path: "../../public/IRANSansWeb_Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-iransansweb",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();
  return {
    title: { default: t("meta.site.title"), template: t("meta.site.titleTemplate") },
    description: t("meta.site.description"),
  };
}

// Applied BEFORE first paint so the persisted theme/accent never flashes.
// Reads the same 'ms-prefs' key the preferences store persists (zustand
// persist format: { state: { theme, accent, ... }, version: 1 }).
const themeInitScript = `
(function(){
  try {
    var raw = localStorage.getItem('ms-prefs');
    var prefs = raw ? (JSON.parse(raw).state || {}) : {};
    var theme = prefs.theme || 'dark';
    var accent = prefs.accent || 'emerald';
    if (accent === 'cyan') accent = 'violet';
    var dark = theme === 'dark' || (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    var el = document.documentElement;
    el.classList.toggle('dark', dark);
    el.setAttribute('data-accent', accent);
    if (prefs.reducedMotion) el.setAttribute('data-motion', 'reduced');
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  const { dir } = localeMeta[locale];

  return (
    <html lang={locale} dir={dir} className={`${iransansweb.variable} dark font-iransansweb antialiased bg-background text-foreground`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-svh bg-background font-iransansweb antialiased text-foreground">
        <LocaleProvider initialLocale={locale}>
          <RootProviders>{children}</RootProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
 
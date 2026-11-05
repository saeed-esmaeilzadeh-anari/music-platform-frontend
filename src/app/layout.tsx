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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  const { dir } = localeMeta[locale];

  return (
    <html lang={locale} dir={dir} className={`${iransansweb.variable} dark font-iransansweb antialiased bg-background text-foreground`} suppressHydrationWarning>
      <body className="min-h-svh bg-background font-iransansweb antialiased text-foreground">
        <LocaleProvider initialLocale={locale}>
          <RootProviders>{children}</RootProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
 
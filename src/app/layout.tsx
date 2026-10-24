import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { RootProviders } from "@/providers";
import { LocaleProvider } from "@/providers/locale-provider";
import type { Locale } from "@/lib/i18n/messages";
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
  const cookieStore = await cookies();
  const isEnglish = cookieStore.get("NEXT_LOCALE")?.value === "en";
  return {
    title: { default: isEnglish ? "Soundwave | Music Platform" : "ساندوِیو | پلتفرم موسیقی", template: isEnglish ? "%s | Soundwave" : "%s | ساندوِیو" },
    description: isEnglish ? "A music platform for listeners, artists, and content managers." : "پلتفرم موسیقی برای شنوندگان، هنرمندان و مدیران محتوا.",
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = cookieLocale === "en" ? "en" : "fa";
  const dir = locale === "fa" ? "rtl" : "ltr";

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

import type { Metadata } from "next";
import "./globals.css";
import { RootProviders } from "@/providers";
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

export const metadata: Metadata = {
  title: {
    default: "ساندوِیو | پلتفرم موسیقی",
    template: "%s | ساندوِیو",
  },
  description: "پلتفرم فارسی موسیقی برای شنوندگان، هنرمندان و مدیران محتوا.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={`${iransansweb.variable} dark font-iransansweb antialiased bg-background text-foreground`} suppressHydrationWarning>
      <body className="min-h-svh bg-background font-iransansweb antialiased text-foreground">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}

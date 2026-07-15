import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { hkGrotesk, iransansweb } from '@/config/fonts';
import "./globals.css";
import { RootProviders } from "@/providers";


import localFont from "next/font/local";

const iransansweb = localFont({
  src: [
    {
      path: "../../public/IRANSansWeb_Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/IRANSansWeb.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/IRANSansWeb_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/IRANSansWeb_Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/IRANSansWeb_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  // family: "iransansweb",
  variable: "--font-iransansweb",
  display: "swap",
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    default: 'Soundwave',
    template: '%s · Soundwave',
  },
  description: 'Music streaming for listeners and artists.',
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html
      lang="fa" className={`${iransansweb.variable} dark font-iransansweb antialiased bg-background text-foreground`}
      suppressHydrationWarning
      // dir="rtl"
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${iransansweb.variable} font-iransansweb antialiased bg-background text-foreground`} > { /* className="min-h-full flex flex-col" */}
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
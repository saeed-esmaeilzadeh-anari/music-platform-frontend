import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

// const vazirmatn = Vazirmatn({
//   subsets: ['arabic', 'latin'],
//   variable: '--font-vazirmatn',
//   display: 'swap',
// });

import localFont from "next/font/local";

const iransansweb = localFont({
  src: [
    {
      path: "../../../public/IRANSansWeb_Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/IRANSansWeb.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/IRANSansWeb_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/IRANSansWeb_Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/IRANSansWeb_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  // family: "iransansweb",
  variable: "--font-iransansweb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت',
    template: '%s · پنل مدیریت Soundwave',
  },
  description: 'پنل مدیریت Soundwave — مدیریت کاربران، هنرمندان، محتوا و ژانرها.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" lang="fa" 
    // className={`${vazirmatn.variable} font-admin`}
    className={`${iransansweb.variable} dark font-iransansweb antialiased bg-background text-foreground`}
    >
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </div>
  );
}

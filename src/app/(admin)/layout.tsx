import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
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
    <div dir="rtl" lang="fa" className={`${vazirmatn.variable} font-admin`}>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </div>
  );
}

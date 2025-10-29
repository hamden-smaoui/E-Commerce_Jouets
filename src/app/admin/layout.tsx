import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TopBar from '@/components/layout/TopBar';
import NavbarAdmin from '@/components/layout/NavBarAdmin';
import SidebarAdmin from '@/components/layout/SideBarAdmin';
import '../globals.css';
import RequireAdmin from "@/components/RequireAdmin";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
 title: "Bamby Joy",
  description: "Magasin en ligne pour jouets",
  icons: {
    icon: '/logoBamby.png',
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAdmin>
      <NavbarAdmin />
      <div className="flex h-[calc(100vh-64px)]">
        <SidebarAdmin>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarAdmin>
      </div>
    </RequireAdmin>
  );
}
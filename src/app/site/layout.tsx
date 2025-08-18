import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jouets E-Commerce",
  description: "Magasin en ligne pour jouets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="light">
      <body className={inter.className}>
        <TopBar message="Soldes jusqu'à 60% ! Profitez maintenant !" />
        <Navbar />
        <main className="min-h-[calc(100vh-120px)]">{children}</main>
      </body>
    </html>
  );
}
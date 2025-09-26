import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SiteShell from "./SiteShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jouets E-Commerce",
  description: "Magasin en ligne pour jouets",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light">
      <body className={inter.className}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
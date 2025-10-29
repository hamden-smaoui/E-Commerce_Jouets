import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import SiteShell from "./SiteShell";
import { CartProvider } from "@/hooks/useCart";
import { FavoritesProvider } from "@/hooks/useFavorites";
import MetaPixel from "@/components/MetaPixel";
import CookieBanner from "@/components/CookieBanner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "Bamby Joy",
  description: "Magasin en ligne pour jouets",
  icons: {
    icon: '/logoBamby.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light">
      <body className={inter.className}>
        <MetaPixel />
        <CartProvider>
          <FavoritesProvider>
            <SiteShell>{children}</SiteShell>
            <CookieBanner />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
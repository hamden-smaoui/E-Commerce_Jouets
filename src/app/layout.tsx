import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { FavoritesProvider } from "@/hooks/useFavorites";



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toy Universe",
  description: "Toy Universe - Online Toy Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="light">
      <body>
        <div className={inter.className}>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
              {children}
              <Toaster />
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
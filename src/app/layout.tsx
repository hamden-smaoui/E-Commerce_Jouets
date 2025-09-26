import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { FavoritesProvider } from "@/hooks/useFavorites";
import AuthSessionProvider from "@/components/ui/AuthSessionProvider";
import { AuthWrapper } from "@/components/AuthWrapper";

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
      <body className={inter.className}>
        <AuthSessionProvider>
          <AuthWrapper>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  {children}
                  <Toaster />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </AuthWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

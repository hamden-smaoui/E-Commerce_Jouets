import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/ui/AuthSessionProvider";
import ConnectionStatusBanner from "@/components/ui/ConnectionStatusBanner";
import { Suspense } from "react";
import SessionTokenSync from "@/components/SessionTokenSync";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bamby Joy",
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
        <ConnectionStatusBanner />
        <AuthSessionProvider>
          <SessionTokenSync />
          <Suspense>
          {children}
          </Suspense>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
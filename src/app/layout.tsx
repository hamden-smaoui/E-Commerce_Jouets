import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthSessionProvider from "@/components/ui/AuthSessionProvider";
import ConnectionStatusBanner from "@/components/ui/ConnectionStatusBanner";
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
        <ConnectionStatusBanner />
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
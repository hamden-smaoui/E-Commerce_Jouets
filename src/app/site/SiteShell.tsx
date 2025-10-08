"use client";
import TopBarWrapper from "@/components/layout/TopBarWrapper";
import Navbar from "@/components/layout/Navbar";
import CartButton from "@/components/ui/FloatingCartButton";


export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBarWrapper />
      <Navbar />
      <main className="min-h-[calc(100vh-120px)]">{children}</main>
      <div className="fixed bottom-6 right-6 z-[998]">
        <CartButton />
      </div>
    </>
  );
}
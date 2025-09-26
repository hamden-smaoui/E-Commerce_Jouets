"use client";
import TopBarWrapper from "@/components/layout/TopBarWrapper";
import Navbar from "@/components/layout/Navbar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBarWrapper />
      <Navbar />
      <main className="min-h-[calc(100vh-120px)]">{children}</main>
    </>
  );
}
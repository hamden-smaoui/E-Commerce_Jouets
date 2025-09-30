"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KidsCornerLoader from "./ui/KidsCornerLoader";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.userData;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    console.log('user',user)
    if (status === "unauthenticated") {
      router.replace("/signIn");
    } else if (status === "authenticated" && user?.role !== "admin") {
      router.replace("/403");
    } else if (status === "authenticated" && user?.role === "admin") {
      setChecked(true);
    }
  }, [status, user, router]);

  if (status === "loading" || !checked) return ( <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader 
          message="Chargement..."
          size="lg"
          showMessage={true}
        />
      </div>);
  return <>{children}</>;
}
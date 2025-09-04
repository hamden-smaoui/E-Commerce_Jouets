"use client";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import TopBar from "./TopBar";

export default function TopBarWrapper() {
  const { storeInfo } = useStoreInfo();
  
  return (
    <TopBar 
      message={storeInfo?.topDescription || "Livraison gratuite à partir de 50€ d'achat"} 
    />
  );
}
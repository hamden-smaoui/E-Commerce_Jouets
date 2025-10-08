"use client";
import React, { useEffect, useState } from "react";

export default function ConnectionStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Fonction pour mettre à jour l'état
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-red-600 text-white text-center py-2 z-[9999] fixed top-0 left-0">
      <span>Pas de connexion Internet. Veuillez vérifier votre connexion.</span>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Délai de 1 seconde avant d'afficher la bannière
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
    
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookieConsent", "essential");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const analyticsChecked = (document.getElementById("analytics") as HTMLInputElement)?.checked;
    localStorage.setItem("cookieConsent", analyticsChecked ? "all" : "essential");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999] transition-opacity animate-fade-in"
        onClick={() => setShowBanner(false)}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-xl font-extrabold text-pink-600 drop-shadow-lg flex items-center font-[Comic_Sans_MS,sans-serif]">
            🍪 Gestion des Cookies
          </h2>
          <button
            onClick={() => setShowBanner(false)}
            className="p-2 hover:bg-pink-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <p className="text-gray-700 text-sm font-[Comic_Sans_MS,sans-serif] leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
            Certains cookies sont essentiels au fonctionnement du site. 🎈
          </p>

          {/* Détails des cookies */}
          {showDetails && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-2xl space-y-3 border-2 border-pink-200">
              {/* Cookies essentiels */}
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm">
                <input 
                  type="checkbox" 
                  checked 
                  disabled 
                  className="mt-1 accent-pink-500"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-pink-600 font-[Comic_Sans_MS,sans-serif] flex items-center gap-2">
                    🔒 Cookies essentiels
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Nécessaires au fonctionnement du site : authentification, panier, 
                    session utilisateur et préférences.
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Ces cookies ne peuvent pas être désactivés.
                  </p>
                </div>
              </div>
              
              {/* Cookies analytiques */}
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm">
                <input 
                  type="checkbox" 
                  id="analytics"
                  defaultChecked
                  className="mt-1 accent-purple-500"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-purple-600 font-[Comic_Sans_MS,sans-serif] flex items-center gap-2">
                    📊 Cookies analytiques (optionnels)
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Nous aident à comprendre comment vous utilisez notre site pour 
                    l'améliorer continuellement (Google Analytics, statistiques de visite).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bouton pour afficher/masquer les détails */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-purple-600 hover:text-purple-700 font-semibold text-sm underline transition-colors font-[Comic_Sans_MS,sans-serif]"
          >
            {showDetails ? "Masquer les détails ⬆️" : "Voir les détails des cookies ⬇️"}
          </button>

          {/* Lien vers la politique */}
          <p className="text-xs text-center text-gray-500 font-[Comic_Sans_MS,sans-serif]">
           Consultez notre{" "}
            <Link href="/cookie-policy" className="text-purple-600 underline font-semibold">
              Politique des Cookies
            </Link>
          </p>
        </div>

        {/* Footer avec boutons */}
        <div className="border-t-2 border-pink-200 p-4 space-y-3 bg-gradient-to-r from-pink-50 to-purple-50">
          {showDetails && (
            <button
              onClick={handleSavePreferences}
              className="w-full bg-white border-2 border-purple-300 text-purple-600 py-3 px-4 rounded-full hover:bg-purple-50 transition-all font-bold text-sm shadow-sm"
            >
              💾 Enregistrer mes préférences
            </button>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-full hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
            >
              ❌ Refuser tout
            </button>
            
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-full hover:shadow-lg transition-all font-bold text-sm"
            >
              ✨ Accepter tout
            </button>
          </div>

          
        </div>
      </div>
    </>
  );
}
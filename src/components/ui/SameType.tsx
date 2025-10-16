"use client";
import React, { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  description?: string;
  quantiteStock: number;
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  image?: string;
  images?: Array<{ idImage: number; url: string; rang: number }>;
}

interface SameTypeProps {
  offers: Product[];
}

export default function SameType({ offers }: SameTypeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollBy = (dir: "prev" | "next") => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector("div[data-card]") as HTMLElement;
    if (!card) return;
    const scrollAmount = card.offsetWidth * (window.innerWidth < 640 ? 1.2 : 3);
    el.scrollBy({
      left: dir === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  // Détermine si les boutons doivent être affichés
  const shouldShowButtons = () => {
    if (isMobile) {
      // Sur mobile: afficher si plus d'1 produit
      return offers.length > 1;
    } else {
      // Sur desktop: afficher si 4 produits ou plus
      return offers.length >= 4;
    }
  };

  return (
    <section className="py-8 w-full bg-transparent">
      <div className="mx-auto px-2 sm:px-6 max-w-7xl">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2
            className="text-xl sm:text-4xl font-black tracking-wide text-purple-500 drop-shadow-lg flex items-center justify-center gap-2"
            style={{ fontFamily: "'Comic Neue', 'Comic Sans MS', cursive, sans-serif" }}
          >
            <span role="img" aria-label="toy">🧸</span>
            Produits de même type
            <span role="img" aria-label="puzzle">🧩</span>
          </h2>
          <div className="flex justify-center mt-2">
            {/* playful divider with dots */}
            <svg width="140" height="16" viewBox="0 0 140 16" fill="none">
              <ellipse cx="8" cy="8" rx="8" ry="8" fill="#a855f7" />
              <rect x="16" y="7" width="108" height="2" rx="1" fill="url(#gradient)" />
              <ellipse cx="132" cy="8" rx="8" ry="8" fill="#ec4899" />
              <defs>
                <linearGradient id="gradient" x1="16" y1="8" x2="124" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* CAROUSEL */}
        <div className="relative">
          {/* Scrollable Product List */}
          <div
            ref={containerRef}
            className="
              flex gap-4 overflow-x-auto
              scroll-smooth snap-x snap-mandatory
              px-1 sm:px-12
              pb-3
              custom-scrollbar
            "
            tabIndex={0}
            style={{
              overscrollBehaviorX: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {offers.map((product) => (
              <div
                key={product.idProduit}
                data-card
                className="snap-start shrink-0 px-2"
                style={{
                  width: "80vw",
                  maxWidth: 280,
                  minWidth: 170,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Navigation Buttons BELOW the carousel - Affichage conditionnel */}
          {shouldShowButtons() && (
            <div className="flex justify-center gap-8 mt-4">
              <button
                onClick={() => scrollBy("prev")}
                className="w-14 h-14 bg-purple-300/90 hover:bg-purple-400/90 border-4 border-white shadow-2xl text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  filter: "drop-shadow(0 2px 12px #a855f7aa)",
                  outline: "none",
                }}
                aria-label="Précédent"
              >
                <ArrowLeftIcon className="h-8 w-8 text-white" aria-label="left arrow" />
              </button>
              <button
                onClick={() => scrollBy("next")}
                className="w-14 h-14 bg-pink-300/90 hover:bg-pink-400/90 border-4 border-white shadow-2xl text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  filter: "drop-shadow(0 2px 12px #ec4899aa)",
                  outline: "none",
                }}
                aria-label="Suivant"
              >
                <ArrowRightIcon className="h-8 w-8 text-white" aria-label="right arrow" />
              </button>
            </div>
          )}
        </div>

        {/* SEE ALL BUTTON */}
        <div className="text-center mt-8 sm:mt-12">
          <a href="/site/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
          >
            Voir tous les produits
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
      
      {/* Custom scrollbar style */}
      <style>
        {`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 #faf5ff;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          border-radius: 8px;
          background: #faf5ff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #a855f7 30%, #ec4899 70%);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #a855f7 10%, #ec4899 90%);
        }
        `}
      </style>
    </section>
  );
}
"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  image?: string;
  description?: string;
  quantiteStock: number;
  type?: { idType: number; nom: string };
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  images?: Array<{
    idImage: number;
    url: string;
    rang: number;
  }>;
  totalVendu?: number;
}

interface BestOffersProps {
  offers: Product[];
}

export default function BestOffers({ offers }: BestOffersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default for desktop
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const itemsPerPageByScreen = {
    mobile: 3.5, // Mobile (<768px): 2 products
    desktop: 7, // Desktop (≥768px): 5 products
  };

  // Update itemsPerPage based on screen size
  useEffect(() => {
    const getItemsPerPage = () => {
      return window.innerWidth < 768 ? itemsPerPageByScreen.mobile : itemsPerPageByScreen.desktop;
    };

    setItemsPerPage(getItemsPerPage());
    
    const handleResize = () => {
      const newItemsPerPage = getItemsPerPage();
      setItemsPerPage(newItemsPerPage);
      // Adjust currentIndex to prevent showing empty space
      setCurrentIndex(prev => Math.min(prev, Math.max(0, offers.length - newItemsPerPage)));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offers.length]);

  const maxIndex = Math.max(0, offers.length - itemsPerPage);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1); // Move by 1 product
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1); // Move by 1 product
    }
  };

  // Handle mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrollingRef.current) return;
    
    e.preventDefault();
    isScrollingRef.current = true;
    
    if (e.deltaY > 0 && canGoNext) {
      handleNext();
    } else if (e.deltaY < 0 && canGoPrev) {
      handlePrev();
    }
    
    // Debounce scrolling
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 300);
  };

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canGoNext) {
      handleNext();
    } else if (isRightSwipe && canGoPrev) {
      handlePrev();
    }
  };

  return (
    <section className="py-8 sm:py-12">
      <div className=" mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-serif text-center italic mb-8 sm:mb-12 text-purple-500 border-b-2 border-purple-500 pb-4">
          Nos Meilleures Offres
        </h2>
        
        <div className="relative">
          {/* Navigation Buttons */}
          {canGoPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-110"
              aria-label="Produit précédent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-110"
              aria-label="Produit suivant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Products Container */}
          <div 
            ref={containerRef}
            className="overflow-hidden mx-8 sm:mx-12"
            onWheel={handleWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
                width: `${(offers.length * 100) / itemsPerPage}%`,
              }}
            >
              {offers.map((product) => (
                <div
                  key={product.idProduit}
                  className="px-2"
                  style={{ 
                    width: `${100 / offers.length}%`,
                    minWidth: `${100 / itemsPerPage}%`
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-purple-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller au produit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-12">
          
            <a href="/site/products"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Voir tous les produits →
          </a>
        </div>
      </div>
    </section>
  );
}
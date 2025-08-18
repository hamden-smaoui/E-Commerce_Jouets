"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  description?: string;
  quantiteStock: number;
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  image?: string;
}

interface SameTypeProps {
  offers: Product[];
}

export default function SameType({ offers }: SameTypeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerPageByScreen = {
    sm: 2, // Mobile (<640px): 2 products
    md: 3, // Medium (≥768px): 3 products
    lg: 4, // Large (≥1024px): 4 products
  };

  const getItemsPerPage = () => {
    if (typeof window === "undefined") return itemsPerPageByScreen.lg;
    if (window.innerWidth < 640) return itemsPerPageByScreen.sm;
    if (window.innerWidth < 1024) return itemsPerPageByScreen.md;
    return itemsPerPageByScreen.lg;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Update itemsPerPage on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
      setCurrentIndex(0); // Reset to first page on resize
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const maxIndex = Math.max(0, offers.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      return newIndex >= 0 ? newIndex : 0;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + itemsPerPage;
      return newIndex <= maxIndex ? newIndex : maxIndex;
    });
  };

  const showButtons = offers.length > itemsPerPage && itemsPerPage !== itemsPerPageByScreen.sm;
  const showPrev = showButtons && currentIndex > 0;
  const showNext = showButtons && currentIndex < maxIndex;

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-serif text-center italic mb-8 sm:mb-12 text-purple-500 border-b-2 border-purple-500 pb-4">
          Produits de même type
        </h2>
        <div className="relative">
          <div className="flex overflow-x-auto sm:overflow-hidden snap-x snap-mandatory scrollbar-hide">
            <div
              className="flex transition-transform duration-500 ease-in-out sm:transition-transform"
              style={{
                transform: itemsPerPage !== itemsPerPageByScreen.sm ? `translateX(-${(currentIndex / itemsPerPage) * 100}%)` : 'none',
                width: itemsPerPage !== itemsPerPageByScreen.sm ? `${(offers.length / itemsPerPage) * 100}%` : 'auto',
              }}
            >
              {offers.map((product) => (
                <div
                  key={product.idProduit}
                  className="flex-shrink-0 snap-start px-2 w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-[150px] sm:max-w-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          {showPrev && (
            <button
              onClick={handlePrev}
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-blue-600 hover:to-yellow-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {showNext && (
            <button
              onClick={handleNext}
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-blue-600 hover:to-yellow-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="/site/products"
            className="btn btn-outline bg-gradient-to-r from-purple-400 to-purple-700 text-white border-purple-500 hover:from-purple-600 hover:to-purple-800"
          >
            Voir tous →
          </a>
        </div>
      </div>
    </section>
  );
}
"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  image?: string;
  description?: string;
  quantiteStock: number;
  marque?: {
    idMarque: number;
    nom: string;
  };
  categorie?: {
    idCategorie: number;
    nom: string;
  };
}

interface BestOffersProps {
  offers: Product[];
}

export default function BestOffers({ offers }: BestOffersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 4; 
  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const maxIndex = offers.length - itemsPerPage;

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev - itemsPerPage;
      if (newIndex <= 0) setHasPrev(false);
      return newIndex >= 0 ? newIndex : 0;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = prev + itemsPerPage;
      if (newIndex > 0) setHasPrev(true);
      return newIndex <= maxIndex ? newIndex : maxIndex;
    });
  };

  const showButtons = offers.length > itemsPerPage;
  const showPrev = showButtons && hasPrev;
  const showNext = showButtons && currentIndex < maxIndex;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-serif text-center italic mb-12 text-purple-500 border-b-2 border-purple-500 pb-4">
  Nos Meilleures Offres
</h2>
        <div className="relative">
          <div className="flex overflow-hidden justify-start px-8"> 
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`, 
                width: `${(offers.length / itemsPerPage) * 100}%` 
              }}
            >
              {offers.map((product) => (
                <div key={product.idProduit} className="mx-2 flex-shrink-0 w-1/5"> 
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          {showPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-blue-600 hover:to-yellow-600 transition-all"
            >
              ←
            </button>
          )}
          {showNext && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-blue-600 hover:to-yellow-600 transition-all"
            >
              →
            </button>
          )}
        </div>
        <div className="text-center mt-12">
          <a href="/site/products" className="btn btn-outline bg-gradient-to-r from-purple-400 to-purple-700 text-white border-purple-500 hover:from-purple-600 hover:to-purple-800">
  Voir tous les produits →
</a>
        </div>
      </div>
    </section>
  );
}
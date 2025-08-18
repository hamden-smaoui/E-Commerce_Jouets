"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  images?: Array<{
    idImage: number;
    url: string;
    rang: number;
  }>;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Trier les images par rang
  const sortedImages = product.images?.sort((a, b) => a.rang - b.rang) || [];
  
  // Utiliser l'image principale ou la première image
  const displayImage = sortedImages.length > 0 
    ? sortedImages[currentImageIndex].url 
    : product.image;

  const handleMouseEnter = () => {
    if (sortedImages.length > 1) {
      setCurrentImageIndex(1); // Montrer la deuxième image
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0); // Retourner à la première image
  };

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200">
      {/* Image Container - Sans padding */}
      <figure 
        className="relative w-full h-48 sm:h-52 md:h-56 lg:h-48 xl:h-52 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={`http://localhost:3001${displayImage || '/images/placeholder.jpg'}`}            
          alt={product.nom}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* Badge Stock */}
        <div className="absolute top-2 right-2 z-10">
          {product.quantiteStock <= 5 && product.quantiteStock > 0 && (
            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Stock faible
            </div>
          )}
          {product.quantiteStock === 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Rupture
            </div>
          )}
        </div>

        {/* Indicateur multiple images */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {sortedImages.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </figure>
      
      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h2 className="text-sm sm:text-base font-semibold line-clamp-2 mb-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {product.nom}
        </h2>
        
        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        
        {/* Marque et Catégorie */}
        <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
          {product.marque && (
            <span>Marque: {product.marque.nom}</span>
          )}
          {product.categorie && (
            <span>Catégorie: {product.categorie.nom}</span>
          )}
        </div>
        
        {/* Prix et Actions */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              {product.prix.toFixed(2)}€
            </span>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/site/products/${product.idProduit}`} className="flex-1">
              <button className="w-full py-2 px-3 text-xs sm:text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Détails
              </button>
            </Link>
            
            {product.quantiteStock > 0 ? (
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L5.4 5M7 13h10" />
                </svg>
              </button>
            ) : (
              <button className="px-3 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { usePromotions } from "@/hooks/usePromotion";
import PromotionBadge from "./PromotionBadge";
import { useFavorites } from "@/hooks/useFavorites";

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { promotions, calculatePriceWithPromotion, hasPromotions } = usePromotions(product.idProduit);

  // Price calculations
  const { prixFinal, reduction, pourcentageReduction } = calculatePriceWithPromotion(product.prix);
  
  // Sort images by rang
  const sortedImages = product.images?.sort((a, b) => a.rang - b.rang) || [];
  
  // Get display image
  const displayImage = sortedImages.length > 0 
    ? sortedImages[currentImageIndex].url 
    : product.image;

  // Stock status logic
  const getStockStatus = () => {
    if (product.quantiteStock === 0) {
      return { text: "Rupture de stock", class: "bg-red-500", available: false };
    } else if (product.quantiteStock <= 5) {
      return { text: `Stock limité (${product.quantiteStock})`, class: "bg-orange-500", available: true };
     } else {
      return { text: "En stock", class: "bg-green-500 text-white", available: true };
    }
  };

  const stockStatus = getStockStatus();

  const handleMouseEnter = () => {
    if (sortedImages.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  const handleAddToCart = async () => {
    if (!stockStatus.available) return;
    
    try {
      setIsAddingToCart(true);
      await addToCart(product.idProduit, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
 const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if card is wrapped in Link
    e.stopPropagation();
    
    try {
      setIsTogglingFavorite(true);
      if (isFavorite(product.idProduit)) {
        await removeFromFavorites(product.idProduit);
      } else {
        await addToFavorites(product.idProduit);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };
    const isProductFavorite = isFavorite(product.idProduit);

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 hover:border-purple-200">
      {/* Image Container */}
     <figure 
  className="relative w-full h-48 sm:h-56 md:h-60 overflow-hidden bg-gray-50"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  <Image
    src={imageError ? '/images/placeholder.jpg' : `http://localhost:3001${displayImage || '/images/placeholder.jpg'}`}
    alt={product.nom}
    fill
    className="object-cover group-hover:scale-110 transition-transform duration-500"
    sizes="(max-width: 768px) 50vw, 20vw"
    onError={() => setImageError(true)}
  />
  
  {/* Promotion Badge - keep at top-left */}
  <PromotionBadge pourcentageReduction={pourcentageReduction} />
  
  {/* Stock Status Badge - keep at top-right */}
  <div className="absolute top-3 right-3 z-10">
    <div className={`${stockStatus.class} text-white text-xs px-3 py-1 rounded-full font-medium shadow-md`}>
      {stockStatus.text}
    </div>
  </div>

  {/* Favorite Heart Button - moved to bottom-right */}
  <div className="absolute bottom-3 right-3 z-10">
    <button
      onClick={handleToggleFavorite}
      disabled={isTogglingFavorite}
      className={`btn btn-circle btn-sm transition-all duration-300 shadow-lg ${
        isProductFavorite 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'bg-white/90 hover:bg-white text-gray-600 border-white/90'
      } ${isTogglingFavorite ? 'loading' : ''}`}
      title={isProductFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isTogglingFavorite ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill={isProductFavorite ? "currentColor" : "none"} 
          viewBox="0 0 24 24" 
          strokeWidth="2.5" 
          stroke="currentColor" 
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      )}
    </button>
  </div>



        {/* Multiple Images Indicator */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 left-3 flex space-x-1">
            {sortedImages.slice(0, 4).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white shadow-md' : 'bg-white/50'
                }`}
              />
            ))}
            {sortedImages.length > 4 && (
              <div className="text-white text-xs bg-black/30 px-2 py-0.5 rounded-full">
                +{sortedImages.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={`/site/products/${product.idProduit}`}>
            <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors">
              Vue rapide
            </button>
          </Link>
        </div>
      </figure>
      
      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 mb-2 min-h-[3rem] group-hover:text-purple-600 transition-colors">
          {product.nom}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {/* Brand and Category */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.marque && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
              {product.marque.nom}
            </span>
          )}
          {product.categorie && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
              {product.categorie.nom}
            </span>
          )}
        </div>
        
        {/* Pricing */}
        <div className="mt-auto">
          <div className="mb-4">
            {hasPromotions && reduction > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-red-600">
                    {prixFinal.toFixed(2)} TND
                  </span>
                  <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    -{pourcentageReduction}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 line-through">
                    {product.prix.toFixed(2)} TND
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    Économie: {reduction.toFixed(2)} TND
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {product.prix.toFixed(2)} TND
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link href={`/site/products/${product.idProduit}`} className="flex-1">
              <button className="w-full py-2.5 px-4 text-sm font-medium border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200">
                Détails
              </button>
            </Link>
            
            <button 
              onClick={handleAddToCart}
              disabled={!stockStatus.available || isAddingToCart}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                stockStatus.available 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : stockStatus.available ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L5.4 5M7 13h10" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
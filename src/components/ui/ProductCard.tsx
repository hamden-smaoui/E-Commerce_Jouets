"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { usePromotions } from "@/hooks/usePromotion";
import PromotionBadge from "./PromotionBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
interface ProduitVariation {
  idProduitVariation: number;
  quantiteStock: number;
  // autres champs si besoin
}
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
   variations?: ProduitVariation[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { calculatePriceWithPromotion, hasPromotions } = usePromotions(product.idProduit);

  // Detect mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const { prixFinal, reduction, pourcentageReduction } = calculatePriceWithPromotion(product.prix);

  const sortedImages = product.images?.sort((a, b) => a.rang - b.rang) || [];
  const hasMultipleImages = sortedImages.length > 1;
  const displayImage = sortedImages.length > 0 
    ? sortedImages[currentImageIndex].url 
    : product.image;

const getStockStatus = () => {
  if (product.variations && product.variations.length > 0) {
    const totalStock = product.variations.reduce(
      (sum, v) => sum + (v.quantiteStock || 0),
      0
    );
    if (totalStock === 0) {
      return { 
        text: "Rupture", 
        class: "bg-white/60 backdrop-blur-md text-red-600 font-bold", 
        available: false 
      };
    } else if (totalStock <= 5) {
      return { 
        text: `limité`, 
        class: "bg-white/60 backdrop-blur-md text-amber-600 font-bold", 
        available: true 
      };
    } else {
      return { 
        text: "En stock", 
        class: "bg-white/60 backdrop-blur-md text-green-600 font-bold", 
        available: true 
      };
    }
  }
  // Stock général (fallback)
  if (product.quantiteStock === 0) {
    return { 
      text: "Rupture", 
      class: "bg-white/60 backdrop-blur-md text-red-600 font-bold", 
      available: false 
    };
  } else if (product.quantiteStock <= 5) {
    return { 
      text: `limité`, 
      class: "bg-white/60 backdrop-blur-md text-amber-600 font-bold", 
      available: true 
    };
  } else {
    return { 
      text: "En stock", 
      class: "bg-white/60 backdrop-blur-md text-green-600 font-bold", 
      available: true 
    };
  }
};

  const stockStatus = getStockStatus();

  // Clear all timers
  const clearAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start image cycling (Desktop only)
  const startImageCycling = () => {
    if (!hasMultipleImages || isMobile) return;
    clearAllTimers();
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 800);
  };

  // Stop image cycling (Desktop only)
  const stopImageCycling = () => {
    if (!isMobile) {
      clearAllTimers();
      setCurrentImageIndex(0);
    }
  };

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (!isMobile && hasMultipleImages) {
      setIsHovering(true);
      startImageCycling();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
      stopImageCycling();
    }
  };

  // Mobile touch handlers for manual scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !hasMultipleImages) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !hasMultipleImages) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !hasMultipleImages) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      e.preventDefault();
      e.stopPropagation();
      if (deltaX > 0) {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
        );
      } else {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
        );
      }
    } else if (!isDragging) {
      // allow normal navigation
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
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
    <Link href={`/site/products/${product.idProduit}`} className="block h-full">
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-200 hover:border-pink-300 cursor-pointer">
        {/* Image Container */}
        <figure 
          className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={imageError ? '/images/placeholder.jpg' : `${displayImage || '/images/placeholder.jpg'}`}
            alt={product.nom}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 300px"
            className={`object-cover transition-all duration-500 ${
              (!isMobile && isHovering) 
                ? 'scale-110' 
                : 'group-hover:scale-110'
            }`}
            onError={() => setImageError(true)}
            draggable={false}
          />
          
          {/* Promotion Badge - top-left */}
          <PromotionBadge pourcentageReduction={pourcentageReduction} />
          
         {/* Stock Status Badge - top-right */}
<div className="absolute top-2 right-2 z-10">
  <div className={`${stockStatus.class} text-[10px] sm:text-xs px-2 py-1 rounded-full shadow-sm`}>
    {stockStatus.text}
  </div>
</div>

          {/* Favorite Heart Button - bottom-right */}
          <div className="absolute bottom-2 right-2 z-10">
            <button
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`btn btn-circle btn-xs sm:btn-sm transition-all duration-300 shadow-md ${
                isProductFavorite 
                  ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500'
                  : 'bg-white/90 hover:bg-white text-pink-500 border-white/90'
              } ${isTogglingFavorite ? 'loading' : ''}`}
              title={isProductFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isTogglingFavorite ? (
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill={isProductFavorite ? "currentColor" : "none"} 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5" 
                  stroke="currentColor" 
                  className="w-3 h-3 sm:w-4 sm:h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              )}
            </button>
          </div>

          {/* Multiple Images Indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-2 flex space-x-1">
              {sortedImages.slice(0, 4).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-white shadow-md' : 'bg-white/50'
                  }`}
                />
              ))}
              {sortedImages.length > 4 && (
                <div className="text-white text-[9px] bg-black/30 px-1.5 py-0.5 rounded-full">
                  +{sortedImages.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Mobile Swipe Instruction */}
          {isMobile && hasMultipleImages && currentImageIndex === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white text-[10px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Glissez pour voir plus
            </div>
          )}
        </figure>
        
        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-gray-900 transition-colors">
            {product.nom}
          </h3>
          
          {/* Description */}
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}
          
          {/* Brand and Category */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.marque && (
              <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {product.marque.nom}
              </span>
            )}
            {product.categorie && (
              <span className="text-[10px] sm:text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                {product.categorie.nom}
              </span>
            )}
          </div>
          
          {/* Price and Cart Button Row */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              {/* Pricing */}
              <div className="flex-1">
                {hasPromotions && reduction > 0 ? (
                  <div className="space-y-0.5">
                    {/* New Price */}
                    <div className="text-base sm:text-lg font-bold text-pink-600">
                      {prixFinal.toFixed(2)} <span className="text-xs font-normal text-pink-500">TND</span>
                    </div>
                    {/* Original Price */}
                    <div className="text-xs text-gray-500 line-through font-normal">
                      {product.prix.toFixed(2)} <span className="text-[10px]">TND</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-base sm:text-lg font-bold text-gray-900">
                    {product.prix.toFixed(2)} <span className="text-xs font-normal text-gray-600">TND</span>
                  </div>
                )}
              </div>
              
              {/* Cart Icon Button as link */}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/site/products/${product.idProduit}`);
                }}
                className="ml-2 btn btn-circle btn-xs sm:btn-sm bg-purple-100 hover:bg-purple-200 shadow-sm hover:scale-105 transition-all flex items-center justify-center text-purple-600"
                title="Voir le produit"
              >
                <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
"use client";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import SameType from "@/components/ui/SameType";
import Footer from "@/components/ui/Footer";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { usePromotions } from "@/hooks/usePromotion";
import PromotionBadge from "@/components/ui/PromotionBadge";
import ProduitsService, { ProduitResponse, ImageData } from "@/services/produits-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import AvisComponent from '@/components/ui/avis';
import CommentaireComponent from '@/components/ui/commentaireSection';

interface Product {
  idProduit: number;
  nom: string;
  prix: number;
  description: string;
  quantiteStock: number;
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  images?: ImageData[];
  type?: { idType: number; nom: string };
  minAge?: string | null;
  maxAge?: string | null;
  typeAge?: 'mois' | 'ans' | null;
  genre?: 'fille' | 'garçon' | 'enfant' | null;
}

interface SameTypeProduct {
  idProduit: number;
  nom: string;
  prix: number;
  description?: string;
  quantiteStock: number;
  marque?: { idMarque: number; nom: string };
  categorie?: { idCategorie: number; nom: string };
  image?: string;
  minAge?: string | null;
  maxAge?: string | null;
  typeAge?: 'mois' | 'ans' | null;
  genre?: 'fille' | 'garçon' | 'enfant' | null;
}

export default function ProduitDetails() {
  const params = useParams();
  const id = params.id;
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [produit, setProduit] = useState<Product | null>(null);
  const [sameTypeProducts, setSameTypeProducts] = useState<SameTypeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("/images/placeholder.jpg");
  const [quantity, setQuantity] = useState(1);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'avis' | 'commentaires'>('avis');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // À adapter selon votre système d'auth
  const imageRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { promotions, calculatePriceWithPromotion, hasPromotions } = usePromotions(produit?.idProduit || 0);

  const priceData = produit ? calculatePriceWithPromotion(produit.prix) : null;

  const formatAgeRange = (minAge: string | null | undefined, maxAge: string | null | undefined, typeAge: 'mois' | 'ans' | null | undefined): string => {
    if (!minAge && !maxAge) return 'N/A';
    if (!typeAge) return 'N/A';
    if (minAge && !maxAge) return `${minAge} ${typeAge}`;
    if (!minAge && maxAge) return `Jusqu'à ${maxAge} ${typeAge}`;
    return `${minAge} - ${maxAge} ${typeAge}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await ProduitsService.getProduitById(parseInt(id as string));
        const updatedProduct: Product = {
          ...productData,
          images: productData.images || [],
        };
        setProduit(updatedProduct);

        const sortedImages = updatedProduct.images?.sort((a, b) => a.rang - b.rang) || [];
        if (sortedImages.length > 0) {
          setSelectedImage(sortedImages[0].url);
        }

        const allProducts = await ProduitsService.getAllProduits();
        const relatedProducts = allProducts
          .filter(
            (p) =>
              p.idProduit !== updatedProduct.idProduit &&
              (p.idCategorie === updatedProduct.categorie?.idCategorie ||
                (updatedProduct.type?.idType && p.idType === updatedProduct.type?.idType))
          )
          .slice(0, 5)
          .map((p) => {
            const firstImage = p.images?.sort((a, b) => a.rang - b.rang)[0];
            const imageUrl = firstImage?.url || "/images/placeholder.jpg";
            return {
              ...p,
              image: imageUrl,
            };
          });
        setSameTypeProducts(relatedProducts);
        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Erreur lors du chargement du produit: ${message}`);
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <KidsCornerLoader 
          message="Chargement des produits..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600">{error || "Le produit que vous recherchez n'existe pas."}</p>
        </div>
      </div>
    );
  }

  const sortedImages = produit.images?.sort((a, b) => a.rang - b.rang) || [];

  const getStockStatus = () => {
    if (produit.quantiteStock === 0) {
      return { text: "Rupture de stock", class: "bg-red-500 text-white", available: false };
    } else if (produit.quantiteStock <= 5) {
      return { text: `Stock limité (${produit.quantiteStock})`, class: "bg-orange-500 text-white", available: true };
    } else {
      return { text: "En stock", class: "bg-green-500 text-white", available: true };
    }
  };

  const stockStatus = getStockStatus();

  const handleIncrement = () => {
    if (quantity < produit.quantiteStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= produit.quantiteStock) {
      setQuantity(value);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    const index = sortedImages.findIndex((img) => img.url === imageUrl);
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPos({ x, y });
      setShowMagnifier(true);
    } else {
      setShowMagnifier(false);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % sortedImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(sortedImages[nextIndex].url);
  };

  const handlePrevImage = () => {
    const prevIndex = currentImageIndex === 0 ? sortedImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(sortedImages[prevIndex].url);
  };

  const handleAddToCart = async () => {
    if (!stockStatus.available) return;
    try {
      setIsAddingToCart(true);
      await addToCart(produit.idProduit, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!produit) return;
    try {
      setIsTogglingFavorite(true);
      if (isFavorite(produit.idProduit)) {
        await removeFromFavorites(produit.idProduit);
      } else {
        await addToFavorites(produit.idProduit);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const isProductFavorite = produit ? isFavorite(produit.idProduit) : false;

  const tabs = [
    { 
      id: 'avis', 
      label: 'Avis', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    { 
      id: 'commentaires', 
      label: 'Commentaires', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
  ] as const;

  return (
    <div className="min-h-screen bg-white font-[Comic_Sans_MS,sans-serif]">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
          {/* Images */}
          <div className="order-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-pink-200">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {sortedImages.length > 1 && (
                    <div className="flex lg:flex-col gap-2 order-2 lg:order-1 w-full lg:w-25 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-96">
                      {sortedImages.slice(0, 5).map((image, index) => (
                        <button
                          key={image.idImage}
                          onClick={() => handleImageSelect(image.url)}
                          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImage === image.url 
                              ? "border-pink-400 shadow-md" 
                              : "border-gray-200 hover:border-pink-200"
                          }`}
                        >
                          <Image
                            src={`http://localhost:3001${image.url || '/images/placeholder.jpg'}`}
                            alt={`${produit.nom} thumbnail ${image.rang}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex-1 order-1 lg:order-2">
                    <div
                      ref={imageRef}
                      className="relative w-full bg-white rounded-xl overflow-hidden border-2 border-pink-200"
                      style={{ aspectRatio: "1/1" }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Image
                        src={`http://localhost:3001${selectedImage || '/images/placeholder.jpg'}`}
                        alt={produit.nom}
                        fill
                        className="object-cover"
                      />
                      {priceData && <PromotionBadge pourcentageReduction={priceData.pourcentageReduction} />}
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`${stockStatus.class} text-xs px-3 py-1 rounded-full font-extrabold shadow-md font-[Comic_Sans_MS,sans-serif]`}>
                          {stockStatus.text}
                        </div>
                      </div>
                      {sortedImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-pink-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                          >
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}

                      {sortedImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 lg:hidden">
                          {sortedImages.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-pink-500' : 'bg-pink-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {showMagnifier && (
                      <div
                        className="absolute w-48 h-48 rounded-full border-2 border-white shadow-xl pointer-events-none z-10 hidden lg:block"
                        style={{
                          top: `${magnifierPos.y - 96}px`,
                          left: `${magnifierPos.x + 20}px`,
                          backgroundImage: `url(${`http://localhost:3001${selectedImage || '/images/placeholder.jpg'}`})`,
                          backgroundPosition: `-${magnifierPos.x * 2 - 96}px -${magnifierPos.y * 2 - 96}px`,
                          backgroundSize: `400% 400%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infos produit */}
          <div className="order-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-8 h-fit sticky top-6 border-2 border-pink-200">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-pink-600 drop-shadow-lg leading-tight flex-1 font-[Comic_Sans_MS,sans-serif]">
                    {produit.nom}
                  </h1>
                  
                  {priceData && hasPromotions && priceData.reduction > 0 ? (
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-red-600">
                          {priceData.prixFinal.toFixed(2)} TND
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                          -{priceData.pourcentageReduction}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 line-through">
                          {produit.prix.toFixed(2)} TND
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Économie: {priceData.reduction.toFixed(2)} TND
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                      {produit.prix.toFixed(2)} TND
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    {produit.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 py-4 border-t border-b border-gray-200">
                  {produit.marque && (
                    <span className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-full font-bold">
                      {produit.marque.nom}
                    </span>
                  )}
                  {produit.categorie && (
                    <span className="text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-full font-bold">
                      {produit.categorie.nom}
                    </span>
                  )}
                  {produit.genre && (
                    <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-full font-bold">
                      {produit.genre}
                    </span>
                  )}
                  {(produit.minAge || produit.maxAge) && (
                    <span className="text-sm bg-pink-50 text-pink-700 px-3 py-2 rounded-full font-bold">
                      {formatAgeRange(produit.minAge, produit.maxAge, produit.typeAge)}
                    </span>
                  )}
                  <span className={`text-sm px-3 py-2 rounded-full font-bold ${stockStatus.class}`}>
                    {stockStatus.text}
                  </span>
                </div>

                {stockStatus.available && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleDecrement}
                          disabled={quantity === 1}
                          className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <input
                          type="number"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-20 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                          min="1"
                          max={produit.quantiteStock}
                        />
                        
                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= produit.quantiteStock}
                          className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-70"
                      >
                        {isAddingToCart ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                            </svg>
                            <span>Ajouter au panier</span>
                          </>
                        )}
                      </button>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleToggleFavorite}
                          disabled={isTogglingFavorite}
                          className={`flex-1 font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                            isProductFavorite 
                              ? 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-2 border-pink-200' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200'
                          } ${isTogglingFavorite ? 'opacity-70' : ''}`}
                        >
                          {isTogglingFavorite ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          ) : (
                            <>
                              <svg 
                                className="w-5 h-5" 
                                fill={isProductFavorite ? "currentColor" : "none"} 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="hidden sm:inline">
                                Favoris
                              </span>
                            </>
                          )}
                        </button>
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 border-2 border-gray-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="hidden sm:inline">Partager</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!stockStatus.available && (
                  <div className="space-y-3">
                    <button className="w-full bg-gray-300 text-gray-500 font-extrabold py-3 px-6 rounded-lg cursor-not-allowed" disabled>
                      Produit indisponible
                    </button>
                    <div className="flex space-x-3">
                      <button className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-extrabold py-3 px-6 rounded-lg transition-colors duration-200">
                        Me notifier
                      </button>
                      <button 
                        onClick={handleToggleFavorite}
                        disabled={isTogglingFavorite}
                        className={`flex-1 font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                          isProductFavorite 
                            ? 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-2 border-pink-200' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200'
                        }`}
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill={isProductFavorite ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="hidden sm:inline">Favoris</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section avec onglets pour Description, Avis et Commentaires */}
        <div className="mt-12">
          <div className="border-b-2 border-pink-200 mb-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-extrabold text-base whitespace-nowrap transition-colors font-[Comic_Sans_MS,sans-serif] ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-pink-600 hover:border-pink-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            {activeTab === 'avis' && (
              <AvisComponent 
                idProduit={produit.idProduit}
              />
            )}

            {activeTab === 'commentaires' && (
              <CommentaireComponent 
                idProduit={produit.idProduit}
              />
            )}
          </div>
        </div>

        
          <SameType offers={sameTypeProducts} />
        
      </div>
      <Footer />
    </div>
  );
}
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
import ProduitsService, { ProduitResponse, ImageData, ProduitVariation, Taille, Couleur, Age } from "@/services/produits-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import AvisComponent from '@/components/ui/avis';
import CommentaireComponent from '@/components/ui/commentaireSection';
import * as fbq from "@/lib/fpixel";
import LoginRequiredModal from '@/components/layout/LoginRequiredModal';
import { useSession } from "next-auth/react";

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
  genre?: 'fille' | 'garçon' | 'enfant' | null;
  variations?: ProduitVariation[];
  livraisonGratuite?: boolean;
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
  genre?: 'fille' | 'garçon' | 'enfant' | null;
  variations?: ProduitVariation[];
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ProduitVariation | null>(null);
  const [selectedCouleur, setSelectedCouleur] = useState<number | null>(null);
  const [selectedTaille, setSelectedTaille] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [availableVariations, setAvailableVariations] = useState<ProduitVariation[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const [pixelTracked, setPixelTracked] = useState(false);
  const { addToCart } = useCart();
  const { promotions, calculatePriceWithPromotion, hasPromotions } = usePromotions(produit?.idProduit || 0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

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

        if (updatedProduct.variations && updatedProduct.variations.length > 0) {
          setAvailableVariations(updatedProduct.variations);

          const uniqueCouleurs = Array.from(new Set(updatedProduct.variations.map(v => v.idCouleur).filter(Boolean)));
          const uniqueTailles = Array.from(new Set(updatedProduct.variations.map(v => v.idTaille).filter(Boolean)));
          const uniqueAges = Array.from(new Set(updatedProduct.variations.map(v => v.idAge).filter(Boolean)));

          if (uniqueCouleurs.length === 1) setSelectedCouleur(uniqueCouleurs[0] as number);
          else setSelectedCouleur(null);

          if (uniqueTailles.length === 1) setSelectedTaille(uniqueTailles[0] as number);
          else setSelectedTaille(null);

          if (uniqueAges.length === 1) setSelectedAge(uniqueAges[0] as number);
          else setSelectedAge(null);
        }

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
      setPixelTracked(false);
    }
  }, [id]);

  useEffect(() => {
    if (produit && !pixelTracked) {
      const priceData = calculatePriceWithPromotion(produit.prix);

      fbq.event('ViewContent', {
        content_ids: [produit.idProduit.toString()],
        content_name: produit.nom,
        content_type: 'product',
        content_category: produit.categorie?.nom || '',
        value: priceData ? priceData.prixFinal : produit.prix,
        currency: 'TND'
      });

      setPixelTracked(true);
    }
  }, [produit, pixelTracked]);

  useEffect(() => {
    if (!produit?.variations) return;

    const needsTaille = produit.variations.some(v => v.idTaille !== null);
    const needsAge = produit.variations.some(v => v.idAge !== null);

    const allRequiredSelected = selectedCouleur &&
      (!needsTaille || selectedTaille) &&
      (!needsAge || selectedAge);

    if (allRequiredSelected) {
      const exactMatch = produit.variations.find(v =>
        v.idCouleur === selectedCouleur &&
        (!needsTaille || v.idTaille === selectedTaille) &&
        (!needsAge || v.idAge === selectedAge)
      );
      setSelectedVariation(exactMatch || null);
    } else {
      setSelectedVariation(null);
    }
  }, [selectedCouleur, selectedTaille, selectedAge, produit?.variations]);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  // ✅ NOUVELLE FONCTION : Filtrer les images selon la couleur sélectionnée
  const getFilteredImages = () => {
    if (!produit?.images) return [];

    // Si aucune couleur sélectionnée, afficher toutes les images
    if (!selectedCouleur) return sortedImages;

    // Filtrer les images qui correspondent à la couleur sélectionnée OU sans couleur
    return sortedImages.filter(img =>
      img.idCouleur === selectedCouleur || img.idCouleur === null
    );
  };

  const filteredImages = getFilteredImages();

  const getAvailableCouleurs = () => {
    if (!produit?.variations) return [];
    const couleurs = produit.variations
      .map(v => v.couleur)
      .filter((c): c is Couleur => c !== undefined && c !== null)
      .filter((c, index, self) => self.findIndex(c2 => c2.idCouleur === c.idCouleur) === index);
    return couleurs;
  };

  const getAvailableTailles = () => {
    if (!produit?.variations || !selectedCouleur) return [];
    const tailles = produit.variations
      .filter(v => v.idCouleur === selectedCouleur)
      .map(v => v.taille)
      .filter((t): t is Taille => t !== undefined && t !== null)
      .filter((t, index, self) => self.findIndex(t2 => t2.idTaille === t.idTaille) === index);
    return tailles;
  };

  const getAvailableAges = () => {
    if (!produit?.variations || !selectedCouleur) return [];
    const ages = produit.variations
      .filter(v =>
        v.idCouleur === selectedCouleur &&
        (!selectedTaille || v.idTaille === selectedTaille)
      )
      .map(v => v.age)
      .filter((a): a is Age => a !== undefined && a !== null)
      .filter((a, index, self) => self.findIndex(a2 => a2.idAge === a.idAge) === index);
    return ages;
  };

  const getStockStatus = () => {
    if (!selectedCouleur && !selectedTaille && !selectedAge) {
      return {
        text: "Sélectionnez vos options",
        class: "bg-white/60 backdrop-blur-md text-gray-600 font-bold",
        available: false
      };
    }
    if (selectedVariation) {
      const stock = selectedVariation.quantiteStock;
      if (stock === 0) {
        return {
          text: "Rupture",
          class: "bg-white/60 backdrop-blur-md text-red-600 font-bold",
          available: false
        };
      } else if (stock <= 5) {
        return {
          text: "Limité",
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
    let filtered = produit?.variations ?? [];
    if (selectedCouleur) filtered = filtered.filter(v => v.idCouleur === selectedCouleur);
    if (selectedTaille) filtered = filtered.filter(v => v.idTaille === selectedTaille);
    if (selectedAge) filtered = filtered.filter(v => v.idAge === selectedAge);

    if (filtered.length > 0) {
      const someStock = filtered.some(v => v.quantiteStock > 0);
      if (someStock) {
        return {
          text: "En stock",
          class: "bg-white/60 backdrop-blur-md text-green-600 font-bold",
          available: true
        };
      } else {
        return {
          text: "Rupture",
          class: "bg-white/60 backdrop-blur-md text-red-600 font-bold",
          available: false
        };
      }
    }
    return {
      text: "Sélectionnez vos options",
      class: "bg-white/60 backdrop-blur-md text-gray-600 font-bold",
      available: false
    };
  };

  const stockStatus = getStockStatus();

  const handleIncrement = () => {
    const maxStock = selectedVariation?.quantiteStock || 0;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxStock = selectedVariation?.quantiteStock || 0;
    if (!isNaN(value) && value > 0 && value <= maxStock) {
      setQuantity(value);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    const index = filteredImages.findIndex((img) => img.url === imageUrl);
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
    const nextIndex = (currentImageIndex + 1) % filteredImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex].url);
  };

  const handlePrevImage = () => {
    const prevIndex = currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex].url);
  };

  const handleAddToCart = async () => {
    if (!stockStatus.available || !selectedVariation) return;
    try {
      setIsAddingToCart(true);
      await addToCart(
        produit.idProduit,
        quantity,
        selectedVariation?.idProduitVariation,
        produit,
        selectedVariation || undefined
      );
    } catch (error) {
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!produit) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      setIsTogglingFavorite(true);
      if (isFavorite(produit.idProduit)) {
        await removeFromFavorites(produit.idProduit);
      } else {
        await addToFavorites(produit.idProduit);
      }
    } catch (error) {
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setLinkCopied(true);

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    }
  };

  const availableCouleurs = getAvailableCouleurs();
  const availableTailles = getAvailableTailles();
  const availableAges = getAvailableAges();
  const isProductFavorite = produit ? isFavorite(produit.idProduit) : false;

  const isCartButtonDisabled = () => {
    if (!selectedVariation) return true;
    if (!stockStatus.available) return true;
    return false;
  };

  const getCartButtonText = () => {
    if (!selectedVariation) return 'Sélectionnez vos options';
    if (!stockStatus.available) return 'Produit indisponible';
    return 'Ajouter au panier';
  };

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

  const priceData = produit ? calculatePriceWithPromotion(produit.prix) : null;

  return (
    <>
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-white font-[Comic_Sans_MS,sans-serif]">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
            {/* Images */}
            <div className="order-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-pink-200">
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {filteredImages.length > 1 && (
                      <div className="flex lg:flex-col gap-2 order-2 lg:order-1 w-full lg:w-25 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-96">
                        {filteredImages.slice(0, 15).map((image, index) => (
                          <button
                            key={image.idImage}
                            onClick={() => handleImageSelect(image.url)}
                            className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === image.url
                              ? "border-pink-400 shadow-md"
                              : "border-gray-200 hover:border-pink-200"
                              }`}
                          >
                            <Image
                              src={`${image.url || '/images/placeholder.jpg'}`}
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
                          src={`${selectedImage || '/images/placeholder.jpg'}`}
                          alt={produit.nom}
                          fill
                          className="object-cover"
                        />
                        {priceData && <PromotionBadge pourcentageReduction={priceData.pourcentageReduction} />}

                        <div className="absolute top-3 right-3 z-10">
                          <div className={`${stockStatus.class} text-xs px-3 py-1 rounded-full shadow-md font-[Comic_Sans_MS,sans-serif]`}>
                            {stockStatus.text}
                          </div>
                        </div>

                        {filteredImages.length > 1 && (
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

                        {filteredImages.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 lg:hidden">
                            {filteredImages.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-pink-500' : 'bg-pink-200'
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
                            backgroundImage: `url(${`${selectedImage || '/images/placeholder.jpg'}`})`,
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
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-700 drop-shadow-lg leading-tight flex-1 font-[Comic_Sans_MS,sans-serif]">
                      {produit.nom}
                    </h1>

                    {priceData && hasPromotions && priceData.reduction > 0 ? (
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-l lg:text-2xl xl:text-3xl font-bold text-red-600">
                            {priceData.prixFinal.toFixed(2)} <span className="text-xs">TND</span>
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                            -{priceData.pourcentageReduction}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500 line-through">
                            {produit.prix.toFixed(2)} <span className="text-xs">TND</span>
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Économie: {priceData.reduction.toFixed(2)} <span className="text-xs">TND</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                        {produit.prix.toFixed(2)} <span className="text-xs">TND</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                      {produit.description}
                    </p>
                  </div>

                  {/* Sélecteurs de variations */}
                  {produit.variations && produit.variations.length > 0 && (
                    <div className="space-y-4 py-4 border-t border-b border-gray-200">
                      <h3 className="font-bold text-gray-800">Choisissez vos options :</h3>

                      {/* Sélection de couleur */}
                      {availableCouleurs.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Couleur *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableCouleurs.map((couleur) => {
                              const couleurVariations = produit.variations?.filter(
                                v => v.idCouleur === couleur.idCouleur
                              ) || [];
                              const hasStock = couleurVariations.some(v => v.quantiteStock > 0);

                              return (
                                <button
                                  key={couleur.idCouleur}
                                  onClick={() => {
                                    if (hasStock) {
                                      setSelectedCouleur(couleur.idCouleur);
                                      setSelectedTaille(null);
                                      setSelectedAge(null);
                                      setQuantity(1);

                                      // ✅ Réinitialiser l'image à la première image de cette couleur
                                      const imagesForColor = sortedImages.filter(
                                        img => img.idCouleur === couleur.idCouleur || img.idCouleur === null
                                      );
                                      if (imagesForColor.length > 0) {
                                        setSelectedImage(imagesForColor[0].url);
                                        setCurrentImageIndex(0);
                                      }
                                    }
                                  }}
                                  disabled={!hasStock}
                                  title={couleur.nom}
                                  className={`relative w-12 h-12 rounded-full border-4 transition-all duration-200 
                                    ${!hasStock
                                      ? 'opacity-50 cursor-not-allowed grayscale border-gray-300'
                                      : selectedCouleur === couleur.idCouleur
                                        ? 'scale-125 shadow-xl'
                                        : 'border-gray-300 hover:scale-110 hover:border-gray-400'
                                    }`}
                                  style={{
                                    backgroundColor: couleur.ref || '#CCCCCC',
                                  }}
                                >
                                  {!hasStock && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    </div>
                                  )}

                                  {hasStock && selectedCouleur === couleur.idCouleur && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sélection de taille */}
                      {availableTailles.length > 0 && selectedCouleur && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Taille
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableTailles.map((taille) => {
                              const tailleVariation = produit.variations?.find(
                                v => v.idCouleur === selectedCouleur && v.idTaille === taille.idTaille
                              );
                              const stock = tailleVariation ? tailleVariation.quantiteStock : 0;
                              const isDisabled = stock === 0;

                              return (
                                <button
                                  key={taille.idTaille}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      setSelectedTaille(taille.idTaille);
                                      setSelectedAge(null);
                                      setQuantity(1);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all relative
                                    ${isDisabled
                                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                      : (selectedTaille === taille.idTaille
                                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                      )
                                    }`
                                  }
                                >
                                  {taille.nom}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sélection d'âge */}
                      {availableAges.length > 0 && selectedCouleur && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tranche d'âge
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableAges.map((age) => {
                              const ageVariation = produit.variations?.find(
                                v => v.idCouleur === selectedCouleur &&
                                  (!selectedTaille || v.idTaille === selectedTaille) &&
                                  v.idAge === age.idAge
                              );
                              const stock = ageVariation ? ageVariation.quantiteStock : 0;
                              const isDisabled = stock === 0;

                              return (
                                <button
                                  key={age.idAge}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      setSelectedAge(age.idAge);
                                      setQuantity(1);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all relative
                                    ${isDisabled
                                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                      : (selectedAge === age.idAge
                                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                                      )
                                    }`
                                  }
                                >
                                  {age.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 py-4 border-b border-gray-200">
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
                  </div>

                  {produit.livraisonGratuite && (
                    <div className="py-3 sm:py-4 border-b border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 animate-bounce"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-sm sm:text-lg font-extrabold text-green-700 font-[Comic_Sans_MS,sans-serif]">
                                Livraison Gratuite ! 🎉
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section quantité et boutons */}
                  <div className="space-y-4">
                    {selectedVariation && stockStatus.available && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleDecrement}
                            disabled={quantity === 1}
                            className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>

                          <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="text-gray-700 w-20 h-10 text-center border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                            min="1"
                            max={selectedVariation.quantiteStock}
                          />

                          <button
                            onClick={handleIncrement}
                            disabled={quantity >= selectedVariation.quantiteStock}
                            className="w-10 h-10 rounded-lg border-2 border-pink-200 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || isCartButtonDisabled()}
                        className={`w-full font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg
                          ${isCartButtonDisabled()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                          }`}
                      >
                        {isAddingToCart ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                            </svg>
                            <span>{getCartButtonText()}</span>
                          </>
                        )}
                      </button>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleToggleFavorite}
                          disabled={isTogglingFavorite}
                          className={`flex-1 font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${isProductFavorite
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

                        <button
                          onClick={handleCopyLink}
                          className={`flex-1 font-extrabold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${linkCopied
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                            }`}
                        >
                          {linkCopied ? (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Lien copié !</span>
                              <span className="sm:hidden">Copié !</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span className="hidden sm:inline">Copier le lien</span>
                              <span className="sm:hidden">Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {produit.variations && produit.variations.length > 0 && !selectedVariation && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-yellow-800">
                          Veuillez sélectionner toutes les options requises pour ce produit.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section avec onglets pour Avis et Commentaires */}
          <div className="mt-12">
            <div className="border-b-2 border-pink-200 mb-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-extrabold text-base whitespace-nowrap transition-colors font-[Comic_Sans_MS,sans-serif] ${activeTab === tab.id
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

          {sameTypeProducts.length > 0 && <SameType offers={sameTypeProducts} />}
        </div>
        <Footer />
      </div>
    </>
  );
}
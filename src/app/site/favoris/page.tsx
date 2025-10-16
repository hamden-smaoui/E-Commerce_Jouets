"use client";
import { useState, useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import ProductCard from "@/components/ui/ProductCard";
import { ProduitVariation } from "@/services/produits-service";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { 
  HeartIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function Favoris() {
  const [sortBy, setSortBy] = useState("");
  const { favorites, loading, removeFromFavorites, clearFavorites } = useFavorites();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Si pas connecté, redirige vers /signIn
    if (status === "unauthenticated") {
      router.replace("/signIn");
    }
  }, [status, router]);

  const calculateTotalStock = (variations: ProduitVariation[] | undefined): number => {
    console.log("Calculating total stock for variations:", variations);
    if (!variations || variations.length === 0) return 0;
    return variations.reduce((total, variation) => total + (variation.quantiteStock || 0), 0);
  };

  // Map favorites to products for ProductCard  
  const products = favorites.map(fav => ({
    idProduit: fav.idProduit,
    nom: fav.produit?.nom || "Produit inconnu",
    prix: fav.produit?.prix || 0,
    description: fav.produit?.description || "",
    quantiteStock: calculateTotalStock(fav.produit?.variations), 
    marque: fav.produit?.marque,
    categorie: fav.produit?.categorie,
    images: fav.produit?.images || []
  }));

  const [sortedProducts, setSortedProducts] = useState(products);

  useEffect(() => {
    setSortedProducts(products);
    console.log("Updated sortedProducts:", products);
  }, [favorites]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);

    let sorted = [...products];

    switch (value) {
      case "a-z":
        sorted.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case "z-a":
        sorted.sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.prix - b.prix);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.prix - a.prix);
        break;
      default:
        sorted = products;
    }

    setSortedProducts(sorted);
  };

  const handleClearFavorites = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ? 💔')) {
      clearFavorites();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-red-50 to-white">
        <KidsCornerLoader 
          message="Chargement de vos favoris..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-white font-[Comic_Sans_MS,sans-serif]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <HeartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-l sm:text-2xl font-extrabold text-red-600 drop-shadow-lg">
                Mes Coups de Cœur
              </h1>
              {products.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {products.length} produit{products.length > 1 ? 's' : ''} favori{products.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleClearFavorites}
              className="flex items-center gap-1 sm:gap-2 text-white bg-red-500 hover:bg-red-600 transition-all px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span> vider</span>
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-red-200 to-pink-200 rounded-full flex items-center justify-center shadow-2xl">
                  <HeartIcon className="h-16 w-16 text-red-400" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                Aucun favori pour le moment 💭
              </h3>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">
                Découvrez notre sélection magique de produits et ajoutez vos coups de cœur ! ✨
              </p>
              <Link href="/site">
                <button className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-full hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 font-extrabold shadow-2xl flex items-center gap-2 mx-auto">
                  <SparklesIcon className="w-5 h-5" />
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top Bar with Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-xl border-2 border-red-200">
              <div className="flex items-center gap-3">
                
                <div>
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {products.length} produit{products.length > 1 ? 's' : ''} en favoris
                  </p>
                  <p className="text-xs text-gray-500">Vos préférés vous attendent !</p>
                </div>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  className="w-full sm:w-auto px-4 py-2 sm:py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium bg-white appearance-none cursor-pointer pr-10"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value=""> Trier par</option>
                  <option value="a-z"> A → Z</option>
                  <option value="z-a"> Z → A</option>
                  <option value="price-asc"> Prix croissant</option>
                  <option value="price-desc"> Prix décroissant</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.idProduit} product={product} />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="flex flex-col items-center gap-4">
              <Link href="/site" className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors font-extrabold bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105">
                <ArrowLeftIcon className="w-5 h-5" />
                Continuer vos achats
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
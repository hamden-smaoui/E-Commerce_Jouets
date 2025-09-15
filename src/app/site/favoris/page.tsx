"use client";
import { useState, useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import ProductCard from "@/components/ui/ProductCard";
import Footer from "@/components/ui/Footer";
import Link from 'next/link';
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { 
  HeartIcon, 
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';

export default function Favoris() {
  const [sortBy, setSortBy] = useState("");
  const { favorites, loading, removeFromFavorites, clearFavorites } = useFavorites();

  // Map favorites to products for ProductCard
  const products = favorites.map(fav => ({
    idProduit: fav.idProduit,
    nom: fav.produit?.nom || "Produit inconnu",
    prix: fav.produit?.prix || 0,
    description: fav.produit?.description || "",
    quantiteStock: fav.produit?.quantiteStock || 0,
    marque: fav.produit?.marque,
    categorie: fav.produit?.categorie,
    images: fav.produit?.images || []
  }));

  const [sortedProducts, setSortedProducts] = useState(products);

  useEffect(() => {
    setSortedProducts(products);
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
      clearFavorites();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <KidsCornerLoader 
          message="Chargement de vos favoris..."
          size="lg"
          showMessage={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        {/* Header */}
<div className="flex items-center justify-between mb-8 w-full">
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
      <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
      Mes Favoris
    </h1>
  </div>
  {products.length > 0 && (
    <button
      onClick={handleClearFavorites}
      className="flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-700 transition-colors px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-red-50 text-sm sm:text-base font-medium"
    >
      <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Vider</span>
    </button>
  )}
</div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-12 w-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun favori pour le moment</h3>
              <p className="text-gray-600 mb-8">Découvrez notre sélection de produits et ajoutez vos coups de cœur !</p>
              <Link href="/site">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium shadow-lg">
                  Découvrir nos produits
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top Bar with Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <p className="text-sm sm:text-base text-gray-600">
                  <span className="font-medium">{products.length}</span> produit{products.length > 1 ? 's' : ''} en favoris
                </p>
              </div>
              
              {/* Sort Dropdown */}
              <select
                className="select select-bordered select-sm sm:select-md w-full sm:w-auto"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="">Trier par</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.idProduit} product={product} />
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="flex justify-center">
              <Link href="/site" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors font-medium">
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
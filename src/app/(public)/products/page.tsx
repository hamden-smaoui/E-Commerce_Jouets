"use client";
import ProductCard from "@/components/ui/ProductCard";
import Filter, { FilterState } from "@/components/ui/Filter";
import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import Footer from "@/components/ui/Footer";
import ProduitsService, { ProduitResponse, ProduitVariation } from "@/services/produits-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import { useSearchParams } from 'next/navigation';
import { CubeIcon } from '@heroicons/react/24/solid';

interface ProductWithDetails extends ProduitResponse {
  image?: string;
  totalStock?: number;
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const searchParams = useSearchParams();
  const [currentFilters, setCurrentFilters] = useState<FilterState>(() => {
  const categoriesParam = searchParams.get('categories');
  const typesParam = searchParams.get('types');
  return {
    categories: categoriesParam ? [parseInt(categoriesParam)] : [],
    marques: [],
    types: typesParam ? [parseInt(typesParam)] : [],
    genres: [],
    prix: { min: 0, max: 1500 },
    age: { min: 0, max: 144 }, // ✅ RETOUR au format min/max
  };
});
  const PRODUCTS_PER_PAGE = 24;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilters, sortBy]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  const calculateTotalStock = (variations: ProduitVariation[] | undefined): number => {
    if (!variations || variations.length === 0) return 0;
    return variations.reduce((total, variation) => total + (variation.quantiteStock || 0), 0);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProduitsService.getAllProduits();
      const transformedProducts: ProductWithDetails[] = data.map((product: ProduitResponse) => ({
        ...product,
        image: product.images && product.images.length > 0 
          ? product.images.sort((a, b) => a.rang - b.rang)[0].url 
          : '/images/placeholder.jpg',
        totalStock: calculateTotalStock(product.variations),
      }));
      setProducts(transformedProducts);
    } catch (error) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };
const calculateProductLimits = useMemo(() => {
  if (products.length === 0) {
    return {
      minPrix: 0,
      maxPrix: 1500,
      minAge: 0,
      maxAge: 144
    };
  }

  const prices = products.map(p => p.prix).filter(p => p != null);
  const ages = products
    .map(p => p.age)
    .filter(age => age != null)
    .flatMap(age => {
      const minInMonths = age!.minTypeAge === 'ans' ? age!.minAge * 12 : age!.minAge;
      const maxInMonths = age!.maxTypeAge === 'ans' ? age!.maxAge * 12 : age!.maxAge;
      return [minInMonths, maxInMonths];
    });

  return {
    minPrix: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    maxPrix: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1500,
    minAge: ages.length > 0 ? Math.min(...ages) : 0,
    maxAge: ages.length > 0 ? Math.max(...ages) : 144
  };
}, [products]);
useEffect(() => {
  const categoriesParam = searchParams.get('categories');
  const typesParam = searchParams.get('types');
  setCurrentFilters({
    categories: categoriesParam ? [parseInt(categoriesParam)] : [],
    marques: [],
    types: typesParam ? [parseInt(typesParam)] : [],
    genres: [],
    prix: { min: calculateProductLimits.minPrix, max: calculateProductLimits.maxPrix },
    age: { min: calculateProductLimits.minAge, max: calculateProductLimits.maxAge },
  });
}, [searchParams, calculateProductLimits]);
// ✅ NOUVEAU - Détecter si un filtre d'âge est actif
const isAgeFilterActive = currentFilters.age.min !== calculateProductLimits.minAge || 
                         currentFilters.age.max !== calculateProductLimits.maxAge;

// ✅ MODIFIÉ - Compteur de filtres actifs (inclure l'âge si modifié)
const activeFiltersCount = currentFilters.categories.length + 
                           currentFilters.marques.length + 
                           currentFilters.types.length + 
                           currentFilters.genres.length +
                           (isAgeFilterActive ? 1 : 0); 

 const matchesAgeFilter = (product: ProductWithDetails): boolean => {
  // Si les limites sont aux valeurs par défaut, on affiche tous les produits
  if (currentFilters.age.min === calculateProductLimits.minAge && 
      currentFilters.age.max === calculateProductLimits.maxAge) {
    return true;
  }
  
  // Si le produit n'a pas d'âge défini, on ne l'affiche pas quand un filtre âge est actif
  if (!product.age) return false;
  
  // Convertir les âges du produit en mois
  const ageMinInMonths = product.age.minTypeAge === 'ans' 
    ? product.age.minAge * 12 
    : product.age.minAge;
  const ageMaxInMonths = product.age.maxTypeAge === 'ans' 
    ? product.age.maxAge * 12 
    : product.age.maxAge;
  
  // Vérifier si la tranche d'âge du produit chevauche le filtre
  return !(ageMaxInMonths < currentFilters.age.min || ageMinInMonths > currentFilters.age.max);
};


const filteredProducts = useMemo(() => {
  let filtered = [...products];
  
  if (currentFilters.categories.length > 0) {
    filtered = filtered.filter(product => 
      currentFilters.categories.includes(product.idCategorie)
    );
  }
  
  if (currentFilters.marques.length > 0) {
    filtered = filtered.filter(product => 
      currentFilters.marques.includes(product.idMarque)
    );
  }
  
  if (currentFilters.types.length > 0) {
    filtered = filtered.filter(product => 
      product.idType && currentFilters.types.includes(product.idType)
    );
  }
  
  if (currentFilters.genres.length > 0) {
    filtered = filtered.filter(product => 
      currentFilters.genres.includes(product.genre)
    );
  }
  
  filtered = filtered.filter(product => 
    product.prix >= currentFilters.prix.min && 
    product.prix <= currentFilters.prix.max
  );
  
  filtered = filtered.filter(matchesAgeFilter);
  
 if (sortBy) {
    switch (sortBy) {
      case 'a-z': 
        filtered.sort((a, b) => a.nom.localeCompare(b.nom)); 
        break;
      case 'z-a': 
        filtered.sort((a, b) => b.nom.localeCompare(a.nom)); 
        break;
      case 'price-asc': 
        filtered.sort((a, b) => a.prix - b.prix); 
        break;
      case 'price-desc': 
        filtered.sort((a, b) => b.prix - a.prix); 
        break;
      case 'stock-desc': 
        filtered.sort((a, b) => (b.totalStock || 0) - (a.totalStock || 0)); 
        break;
      case 'oldest': // ✅ NOUVEAU : Trier par plus ancien
        filtered.sort((a, b) => a.idProduit - b.idProduit); 
        break;
      default: 
        break;
    }
  }
  
  return filtered;
}, [products, currentFilters, sortBy, calculateProductLimits]);


  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
  }, []);

 const resetAllFilters = () => {
  setCurrentFilters({
    categories: [],
    marques: [],
    types: [],
    genres: [],
    prix: { min: calculateProductLimits.minPrix, max: calculateProductLimits.maxPrix },
    age: { min: calculateProductLimits.minAge, max: calculateProductLimits.maxAge },
  });
};




  

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

  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadProducts}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 relative font-[Comic_Sans_MS,sans-serif]">
      {/* Bouton filtre mobile */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="lg:hidden fixed right-4 top-1/2 transform -translate-y-1/2 bg-purple-600/70 backdrop-blur-sm text-white rounded-xl p-2 shadow-lg z-50 flex flex-col items-center justify-center w-12 h-12 hover:bg-purple-700/90 transition-all duration-200 hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold animate-pulse">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec filtres */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Filter 
                onFiltersChange={handleFiltersChange} 
                initialFilters={currentFilters}
                productLimits={calculateProductLimits} // ✅ AJOUTÉ

              />
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Header catalogue */}
            <div className="bg-white border-2 border-pink-200 rounded-2xl shadow-lg mb-8">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Résultats et statistiques */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                      <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div>
                      <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 mb-1 leading-tight rounded-xl px-2 py-1 inline-block">
                        Catalogue des produits
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {filteredProducts.length !== products.length ? (
                          <span>{filteredProducts.length} produits sur {products.length} au total</span>
                        ) : (
                          <span>{filteredProducts.length} produits disponibles</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Tri */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-bold">Trier par :</span>
                   <select
  value={sortBy}
  onChange={e => setSortBy(e.target.value)}
  className="rounded-lg border-2 border-pink-200 bg-pink-50 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-pink-600 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all"
>
  <option value="">Nouveautés</option> {/* ✅ MODIFIÉ : Plus clair */}
  <option value="a-z">Nom : A &rarr; Z</option>
  <option value="z-a">Nom : Z &rarr; A</option>
  <option value="price-asc">Prix : Croissant</option>
  <option value="price-desc">Prix : Décroissant</option>
  <option value="oldest">Plus anciens</option> {/* ✅ AJOUT : Option pour voir les anciens */}
</select>
                  </div>
                </div>
                {/* Clear All Filters Button for Mobile */}
                {activeFiltersCount > 0 && (
  <div className="mt-4 lg:hidden">
    <button
      onClick={resetAllFilters}
      className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-blue-400 text-white font-extrabold text-sm rounded-xl py-2 px-4 flex items-center justify-center gap-2 shadow-md hover:from-pink-500 hover:to-blue-500 hover:shadow-lg hover:scale-105  font-[Comic_Sans_MS,sans-serif]"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      Effacer tous les filtres
    </button>
  </div>
)}
              </div>
            </div>
            
            {/* Contenu des produits */}
            {filteredProducts.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
      <svg
        className="h-10 w-10 text-pink-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-pink-600 drop-shadow-lg mb-2 font-[Comic_Sans_MS,sans-serif]">
      Aucun produit trouvé
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres pour voir plus de résultats.
    </p>
    <button
      onClick={resetAllFilters}
      className="mt-4  sm:w-auto bg-gradient-to-r from-pink-400 to-blue-400 text-white font-extrabold text-sm rounded-xl py-2 px-4 flex items-center justify-center gap-2 shadow-md hover:from-pink-500 hover:to-blue-500 hover:shadow-lg hover:scale-105 font-[Comic_Sans_MS,sans-serif]"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      Réinitialiser les filtres
    </button>
  </div>
            ) : (
              <>
                {/* Grille de produits */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.idProduit} product={product} />
                  ))}
                </div>
                
                {/* Système de pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl shadow-sm border-2 border-pink-200 p-6 mt-2">
                    <div className="flex flex-col items-center gap-6">
                      {/* Navigation pagination */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="btn btn-sm btn-ghost disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 hover:text-pink-600 transition-colors font-bold"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Précédent
                        </button>
                        <div className="flex items-center gap-1 mx-2">
                          {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === '...' ? (
                                <span className="px-3 py-2 text-gray-400 text-sm">...</span>
                              ) : (
                                <button
                                  onClick={() => setCurrentPage(page as number)}
                                  className={`btn btn-sm transition-all duration-200 font-bold ${
                                    currentPage === page 
                                      ? 'bg-pink-500 text-white shadow-md scale-105' 
                                      : 'btn-ghost hover:btn-outline hover:bg-pink-200 hover:text-pink-600 hover:scale-105'
                                  }`}
                                >
                                  {page}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="btn btn-sm btn-ghost disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 hover:text-pink-600 transition-colors font-bold"
                        >
                          Suivant
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal filtres mobile */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowFilterModal(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[90vw] sm:w-96 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[60] shadow-sm">
              <h2 className="text-lg font-extrabold text-pink-600 flex items-center gap-2 font-[Comic_Sans_MS,sans-serif]">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-pink-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 pb-24">
              <Filter 
                onFiltersChange={handleFiltersChange} 
                initialFilters={currentFilters}
                hideTitle={true}
                  productLimits={calculateProductLimits} // ✅ AJOUTÉ
              />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-pink-200 p-4 shadow-lg">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full bg-gradient-to-r from-pink-400 to-blue-400 text-white font-extrabold rounded-xl py-3 text-lg hover:from-pink-500 hover:to-blue-500 transition-all shadow"
              >
                Voir {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
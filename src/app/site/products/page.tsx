"use client"
import ProductCard from "@/components/ui/ProductCard";
import Filter, { FilterState } from "@/components/ui/Filter";
import { useState, useEffect, useCallback, useMemo } from "react";
import Footer from "@/components/ui/Footer";
import ProduitsService, { Produit } from "@/services/produits-service";

interface ProductWithDetails extends Produit {
  image?: string;
  categorie?: {
    idCategorie: number;
    nom: string;
  };
  marque?: {
    idMarque: number;
    nom: string;
  };
  type?: {
    idType: number;
    nom: string;
  };
  images?: Array<{
    idImage: number;
    url: string;
    rang: number;
  }>;
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    categories: [],
    marques: [],
    types: [],
    genres: [],
    prix: { min: 0, max: 500 },
    age: { min: 0, max: 144 },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProduitsService.getAllProduits();
      
      const transformedProducts: ProductWithDetails[] = data.map((product: any) => ({
        ...product,
        image: product.images && product.images.length > 0 
          ? product.images.sort((a: any, b: any) => a.rang - b.rang)[0].url 
          : '/images/placeholder.jpg',
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const parseAgeRange = (trancheAge: string): { min: number; max: number } | null => {
    if (!trancheAge) return null;
    
    const monthsMatch = trancheAge.match(/(\d+)-(\d+)\s*mois/);
    if (monthsMatch) {
      return {
        min: parseInt(monthsMatch[1]),
        max: parseInt(monthsMatch[2])
      };
    }
    
    const yearsMatch = trancheAge.match(/(\d+)-(\d+)\s*ans?/);
    if (yearsMatch) {
      return {
        min: parseInt(yearsMatch[1]) * 12,
        max: parseInt(yearsMatch[2]) * 12
      };
    }
    
    const singleYearMatch = trancheAge.match (/(\d+)\s*ans?/);
    if (singleYearMatch) {
      const months = parseInt(singleYearMatch[1]) * 12;
      return { min: months, max: months + 11 };
    }
    
    return null;
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

    filtered = filtered.filter(product => 
      product.prix >= currentFilters.prix.min && 
      product.prix <= currentFilters.prix.max
    );

    if (currentFilters.age.min > 0 || currentFilters.age.max < 144) {
      filtered = filtered.filter(product => {
        if (!product.trancheAge) return true;
        
        const ageRange = parseAgeRange(product.trancheAge);
        if (!ageRange) return true;
        
        return !(ageRange.max < currentFilters.age.min || ageRange.min > currentFilters.age.max);
      });
    }

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
        default:
          break;
      }
    }

    return filtered;
  }, [products, currentFilters, sortBy]);

  const handleFiltersChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
    setVisibleProducts(10);
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setVisibleProducts(10);
  };

  const handleShowMore = () => {
    setVisibleProducts(prev => prev + 10);
  };

  // Compter les filtres actifs
  const activeFiltersCount = currentFilters.categories.length + 
                           currentFilters.marques.length + 
                           currentFilters.types.length + 
                           currentFilters.genres.length;

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Chargement des produits...</span>
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
    <div className="min-h-screen bg-white relative">
      {/* Mobile Filter Button (Vertical, Fixed on Right) */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="lg:hidden fixed right-4 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white rounded-lg p-2 shadow-lg z-50 flex flex-col items-center justify-center w-12 h-12 hover:bg-purple-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Filter onFiltersChange={handleFiltersChange} />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar with Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <p className="text-sm sm:text-base text-gray-600">
                  <span className="font-medium">{filteredProducts.length}</span> produits trouvés
                  {filteredProducts.length !== products.length && (
                    <span className="text-gray-400 ml-1">
                      (sur {products.length})
                    </span>
                  )}
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
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.86-6.111-2.291l.089-.089A7.961 7.961 0 0112 9c1.993 0 3.852.728 5.288 1.934l.708-.708A8.952 8.952 0 0112 8c-2.517 0-4.836.998-6.54 2.62a9.042 9.042 0 00-2.62 6.54C2.84 18.836 3.838 21.155 6.46 22.86z" />
                </svg>
                <p className="text-lg text-gray-500 mb-2">Aucun produit trouvé</p>
                <p className="text-gray-400">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.slice(0, visibleProducts).map((product) => (
                    <ProductCard key={product.idProduit} product={product} />
                  ))}
                </div>
                
                {visibleProducts < filteredProducts.length && (
                  <div className="flex justify-center mt-8">
                    <button 
                      className="btn btn-outline btn-primary btn-wide" 
                      onClick={handleShowMore}
                    >
                      Afficher {Math.min(10, filteredProducts.length - visibleProducts)} produits de plus
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          />
          
          {/* Modal */}
          <div className="absolute left-0 top-0 h-full w-[90vw] sm:w-96 max-w-[90vw] bg-white shadow-xl transform transition-transform duration-300 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-[60]">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Filter Content */}
            <div className="p-4 z-10">
              <Filter onFiltersChange={handleFiltersChange} />
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t p-4 z-[60]">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full btn btn-primary"
              >
                Voir {filteredProducts.length} produits
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
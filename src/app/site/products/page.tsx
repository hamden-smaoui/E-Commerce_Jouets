"use client"
import ProductCard from "@/components/ui/ProductCard";
import Filter, { FilterState } from "@/components/ui/Filter";
import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import Footer from "@/components/ui/Footer";
import ProduitsService, { Produit } from "@/services/produits-service";
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    categories: [],
    marques: [],
    types: [],
    genres: [],
    prix: { min: 0, max: 1500 },
    age: { min: 0, max: 144 },
  });

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    loadProducts();
  }, []);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilters, sortBy]);

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

  const getAgeInMonths = (minAge: string | null, maxAge: string | null, typeAge: 'mois' | 'ans' | null): { min: number; max: number } | null => {
    if (!minAge && !maxAge) return null;
    
    const min = minAge ? parseInt(minAge) : 0;
    const max = maxAge ? parseInt(maxAge) : 144;
    
    if (isNaN(min) || isNaN(max)) return null;
    
    return {
      min: typeAge === 'ans' ? min * 12 : min,
      max: typeAge === 'ans' ? max * 12 : max,
    };
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filtre par catégories
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        currentFilters.categories.includes(product.idCategorie)
      );
    }

    // Filtre par marques
    if (currentFilters.marques.length > 0) {
      filtered = filtered.filter(product => 
        currentFilters.marques.includes(product.idMarque)
      );
    }

    // Filtre par types
    if (currentFilters.types.length > 0) {
      filtered = filtered.filter(product => 
        product.idType && currentFilters.types.includes(product.idType)
      );
    }

    // Filtre par genres
    if (currentFilters.genres.length > 0) {
      filtered = filtered.filter(product => 
        currentFilters.genres.includes(product.genre)
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.prix >= currentFilters.prix.min && 
      product.prix <= currentFilters.prix.max
    );

    // Filtre par âge
    if (currentFilters.age.min > 0 || currentFilters.age.max < 144) {
      filtered = filtered.filter(product => {
        const ageRange = getAgeInMonths(product.minAge, product.maxAge, product.typeAge);
        if (!ageRange) return true;
        
        return !(ageRange.max < currentFilters.age.min || ageRange.min > currentFilters.age.max);
      });
    }

    // Tri
    if (sortBy) {
      switch (sortBy) {
        case 'a-z':
          filtered.sort((a, b) => a.nom.localeCompare(b.nom));
          break;
        case 'z-a':
          filtered.sort((a, b) => b.nom.localeCompare(b.nom));
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

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Fonction pour générer les numéros de pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const activeFiltersCount = currentFilters.categories.length + 
                           currentFilters.marques.length + 
                           currentFilters.types.length + 
                           currentFilters.genres.length;

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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Bouton filtre mobile */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="lg:hidden fixed right-4 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white rounded-lg p-3 shadow-lg z-50 flex flex-col items-center justify-center w-14 h-14 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar avec filtres */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Filter onFiltersChange={handleFiltersChange} />
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Header professionnel */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Résultats et statistiques */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {filteredProducts.length} Produits
                        </h1>
                        <p className="text-sm text-gray-500">
                          {filteredProducts.length !== products.length ? (
                            <span>sur {products.length} produits au total</span>
                          ) : (
                            <span>Catalogue complet</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                   
                  </div>

                  {/* Contrôles de tri */}
                  <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-700">Trier par :</span>
                    
                    
                    <select
                      className="select select-bordered select-sm bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 min-w-[200px] transition-all duration-200"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="">Par défaut</option>
                      <option value="a-z">Nom : A → Z</option>
                      <option value="z-a">Nom : Z → A</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                    </select>
                  </div>
                </div>
                
                
              </div>
            </div>
            
            {/* Contenu des produits */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.86-6.111-2.291l.089-.089A7.961 7.961 0 0112 9c1.993 0 3.852.728 5.288 1.934l.708-.708A8.952 8.952 0 0112 8c-2.517 0-4.836.998-6.54 2.62a9.042 9.042 0 00-2.62 6.54C2.84 18.836 3.838 21.155 6.46 22.86z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres pour voir plus de résultats.
                </p>
                <button 
                  onClick={() => setCurrentFilters({
                    categories: [],
                    marques: [],
                    types: [],
                    genres: [],
                    prix: { min: 0, max: 1500 },
                    age: { min: 0, max: 144 },
                  })}
                  className="btn btn-outline btn-primary mt-4"
                >
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col items-center gap-6">
                     
                      
                      {/* Navigation pagination */}
                      <div className="flex items-center gap-2">
                        {/* Bouton précédent */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="btn btn-sm btn-ghost disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Précédent
                        </button>
                        
                        {/* Numéros de pages */}
                        <div className="flex items-center gap-1 mx-2">
                          {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                              {page === '...' ? (
                                <span className="px-3 py-2 text-gray-400 text-sm">...</span>
                              ) : (
                                <button
                                  onClick={() => setCurrentPage(page as number)}
                                  className={`btn btn-sm transition-all duration-200 ${
                                    currentPage === page 
                                      ? 'btn-primary shadow-md' 
                                      : 'btn-ghost hover:btn-outline hover:btn-primary hover:scale-105'
                                  }`}
                                >
                                  {page}
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        
                        {/* Bouton suivant */}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="btn btn-sm btn-ghost disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:text-purple-600 transition-colors"
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
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 pb-24">
              <Filter onFiltersChange={handleFiltersChange} />
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full btn btn-primary btn-lg"
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
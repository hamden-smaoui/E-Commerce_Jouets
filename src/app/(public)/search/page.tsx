"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import SearchService, { SearchResult, SearchParams } from '@/services/search-service';
import KidsCornerLoader from '@/components/ui/KidsCornerLoader';
import Footer from '@/components/ui/Footer';
import { 
  MagnifyingGlassIcon,
  CubeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const marque = searchParams.get('marque') || '';
  const type = searchParams.get('type') || '';
 
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (query) {
      handleSearch(query, 1, {
        category,
        marque,
        type
      });
    }
    // eslint-disable-next-line
  }, [query, category, marque, type]);

  const handleSearch = async (searchQuery: string, page = 1, additionalFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: SearchParams = {
        q: searchQuery,
        page,
        limit: 12,
        ...additionalFilters,
      };

      const searchResults = await SearchService.searchProducts(searchParams);
      
      setResults(searchResults);
      setCurrentPage(page);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (query) {
      handleSearch(query, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToCatalog = () => {
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <KidsCornerLoader message="Recherche en cours..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header simplifié */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Titre à gauche avec icône */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Resultat de recherche
              </h1>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {results && (
          <>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600 text-base sm:text-lg">
                    <span className="font-semibold text-gray-900">{results.pagination.totalItems}</span> résultat(s) pour 
                    <span className="font-semibold text-purple-600 ml-1">"{results.searchTerm}"</span>
                  </p>
                </div>

                {/* Statistiques de recherche */}
                {results.searchStats && (
                  <div className="mt-4 md:mt-0">
                    <div className="flex flex-wrap gap-2 text-sm">
                      {results.searchStats.byCategory.slice(0, 3).map((stat, index) => (
                        <div key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {stat.category}: {stat.count}
                        </div>
                      ))}
                      {results.searchStats.byBrand.slice(0, 2).map((stat, index) => (
                        <div key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {stat.brand}: {stat.count}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {results.data.length > 0 ? (
                <>
                  {/* Grille des produits - responsive pour mobile */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {results.data.map((product) => (
                      <div key={product.idProduit} className="transform hover:scale-105 transition-transform duration-200">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* Bouton "Voir tous nos produits" sous la grille */}
                  <div className="flex justify-center mt-4 mb-6">
                    <button
                      onClick={goToCatalog}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md text-base sm:text-lg"
                    >
                      <BookOpenIcon className="h-5 w-5" />
                      <span className="text-sm sm:text-base">Voir tous nos produits</span>
                    </button>
                  </div>

                  {/* Pagination améliorée */}
                  {results.pagination.totalPages > 1 && (
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!results.pagination.hasPrev}
                          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Précédent
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: results.pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page === 1 || 
                              page === results.pagination.totalPages || 
                              Math.abs(page - currentPage) <= 2
                            )
                            .map((page, index, array) => (
                              <div key={page} className="flex items-center">
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-2 text-gray-500">...</span>
                                )}
                                <button
                                  onClick={() => handlePageChange(page)}
                                  className={`px-4 py-2 rounded-lg transition-colors ${
                                    page === currentPage
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            ))}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!results.pagination.hasNext}
                          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Nous n'avons trouvé aucun jouet correspondant à votre recherche. 
                    Essayez avec des mots-clés différents ou consultez notre catalogue complet.
                  </p>
                  
                  {/* Bouton vers le catalogue */}
                  <button
                    onClick={goToCatalog}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md text-base sm:text-lg"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    <span className="text-sm sm:text-base">Voir tous nos produits</span>
                  </button>
                  
                  {/* Suggestions de recherche */}
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div className="max-w-md mx-auto mt-8">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Suggestions de recherche:
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {results.suggestions.slice(0, 6).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (suggestion.filter) {
                                const params = new URLSearchParams({ q: suggestion.query });
                                Object.entries(suggestion.filter).forEach(([key, value]) => {
                                  params.append(key, value as string);
                                });
                                window.location.href = `/search?${params.toString()}`;
                              } else {
                                window.location.href = `/search?q=${encodeURIComponent(suggestion.query)}`;
                              }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full hover:from-purple-200 hover:to-pink-200 transition-colors text-sm"
                          >
                            {suggestion.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md mr-4"
              >
                Réessayer
              </button>
              <button
                onClick={goToCatalog}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
              >
                Voir le catalogue
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
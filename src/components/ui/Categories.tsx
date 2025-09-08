"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";

const categoryColors = [
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-purple-500 to-purple-600",
  "bg-gradient-to-r from-pink-500 to-pink-600",
  "bg-gradient-to-r from-green-500 to-green-600",
  "bg-gradient-to-r from-yellow-500 to-yellow-600",
  "bg-gradient-to-r from-red-500 to-red-600",
  "bg-gradient-to-r from-teal-500 to-teal-600",
  "bg-gradient-to-r from-indigo-500 to-indigo-600",
  "bg-gradient-to-r from-orange-500 to-orange-600",
  "bg-gradient-to-r from-cyan-500 to-cyan-600",
];

interface CategorieWithTypes {
  idCategorie: number;
  nom: string;
  types?: Array<{
    idType: number;
    nom: string;
    description: string | null;
  }>;
}

interface CategoriesProps {
  categories: CategorieWithTypes[];
}

export default function Categories({ categories }: CategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const router = useRouter(); 
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeCategoryPosition, setActiveCategoryPosition] = useState<{ left: number; width: number } | null>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vérifier si scroll est nécessaire
  const checkScrollNeed = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const needsScrolling = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    setNeedsScroll(needsScrolling);
    
    // Mettre à jour les boutons de navigation pour PC
    if (!isMobile && needsScrolling) {
      updateNavigationButtons();
    }
  }, [isMobile]);

  // Mettre à jour l'état des boutons de navigation
  const updateNavigationButtons = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    setCanScrollLeft(scrollContainer.scrollLeft > 0);
    setCanScrollRight(
      scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth
    );
  }, []);
 const navigateToProducts = (categoryId: number, typeId?: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('categories', categoryId.toString());
    
    if (typeId) {
      searchParams.set('types', typeId.toString());
    }
    
    router.push(`/site/products?${searchParams.toString()}`);
  };
  // Navigation pour PC
  const scrollToDirection = (direction: 'left' | 'right') => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollAmount = 300;
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });

    setTimeout(updateNavigationButtons, 300);
  };

  // Calculer la position du dropdown
  const calculateDropdownPosition = (categoryId: number) => {
    const categoryElement = categoryRefs.current[categoryId];
    const containerElement = containerRef.current;
    
    if (!categoryElement || !containerElement) return null;

    const containerRect = containerElement.getBoundingClientRect();
    const categoryRect = categoryElement.getBoundingClientRect();
    
    return {
      left: categoryRect.left - containerRect.left + (categoryRect.width / 2),
      width: categoryRect.width
    };
  };

  // Gestion du scroll manuel
  const handleManualScroll = useCallback(() => {
    if (!isMobile) {
      updateNavigationButtons();
    }
  }, [isMobile, updateNavigationButtons]);

  // Initialisation
  useEffect(() => {
    if (categories.length > 0) {
      const timer = setTimeout(checkScrollNeed, 100);
      
      const handleResize = () => {
        checkScrollNeed();
        if (!isMobile) updateNavigationButtons();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [categories, checkScrollNeed, isMobile, updateNavigationButtons]);

  // Event listeners pour le scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleManualScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleManualScroll);
    };
  }, [handleManualScroll]);

 const handleCategoryClick = (e: React.MouseEvent, category: CategorieWithTypes) => {
    if (category.types && category.types.length > 0) {
      e.preventDefault();
      
      if (activeCategory === category.idCategorie) {
        setActiveCategory(null);
        setActiveCategoryPosition(null);
      } else {
        setActiveCategory(category.idCategorie);
        const position = calculateDropdownPosition(category.idCategorie);
        setActiveCategoryPosition(position);
      }
    } else {
      // Si pas de types, rediriger directement
      e.preventDefault();
      navigateToProducts(category.idCategorie);
    }
  };

  const handleChevronClick = (e: React.MouseEvent, category: CategorieWithTypes) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeCategory === category.idCategorie) {
      setActiveCategory(null);
      setActiveCategoryPosition(null);
    } else {
      setActiveCategory(category.idCategorie);
      const position = calculateDropdownPosition(category.idCategorie);
      setActiveCategoryPosition(position);
    }
  };

  const handleCategoryHover = (category: CategorieWithTypes) => {
    if (!isMobile && category.types && category.types.length > 0) {
      setActiveCategory(category.idCategorie);
      const position = calculateDropdownPosition(category.idCategorie);
      setActiveCategoryPosition(position);
    }
  };

 
const getDropdownStyles = (category: CategorieWithTypes) => {
    if (isMobile) {
      // Pour mobile : toujours au centre de l'écran
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '350px',
        zIndex: 9999,
      };
    } else {
      // Pour desktop : sous le bouton comme avant
      return activeCategoryPosition ? {
        position: 'absolute' as const,
        top: 'calc(100% + 12px)',
        left: `${activeCategoryPosition.left}px`,
        transform: 'translateX(-50%)',
        width: '320px',
        zIndex: 100,
      } : {};
    }
  };
  // Fermer dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
        setActiveCategoryPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!categories?.length) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center">
          <KidsCornerLoader message="Aucune catégorie disponible..." size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
     

        {/* Conteneur principal */}
        <div ref={containerRef} className="relative" >
          {/* Boutons de navigation pour PC */}
          {!isMobile && needsScroll && (
            <>
              <button
                onClick={() => scrollToDirection('left')}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg transition-all duration-200 ${
                  canScrollLeft 
                    ? 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5 mx-auto" />
              </button>
              
              <button
                onClick={() => scrollToDirection('right')}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg transition-all duration-200 ${
                  canScrollRight 
                    ? 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-xl' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5 mx-auto" />
              </button>
            </>
          )}

          {/* Container de scroll */}
          <div className={`${!isMobile && needsScroll ? 'px-12' : ''}`}>
            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className={`flex space-x-3 sm:space-x-4 pb-2 ${!needsScroll ? 'justify-center' : ''}`}>
                {categories.map((category, index) => (
                  <div
                    key={category.idCategorie}
                    ref={(el) => {categoryRefs.current[category.idCategorie] = el}}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => handleCategoryHover(category)}
                  >
                    <button
                      onClick={(e) => handleCategoryClick(e, category)}
                      className={`
                        inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-4
                        text-white font-semibold text-sm sm:text-base
                        rounded-2xl shadow-lg hover:shadow-xl 
                        transform hover:scale-105 hover:-translate-y-1
                        transition-all duration-300 ease-out
                        hover:brightness-110 active:scale-95
                        whitespace-nowrap backdrop-blur-sm
                        border border-white/20
                        ${categoryColors[index % categoryColors.length]}
                      `}
                    >
                      <span>{category.nom}</span>
                      {category.types && category.types.length > 0 && (
                        <ChevronDownIcon
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                            activeCategory === category.idCategorie ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
{isMobile && activeCategory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={() => {
            setActiveCategory(null);
            setActiveCategoryPosition(null);
          }}
        />
      )}
          {/* Dropdown des types */}
{categories.map((category) => {
        const isOpen = activeCategory === category.idCategorie;
        if (!category.types || category.types.length === 0 || !isOpen) return null;

        // Pour desktop, vérifier activeCategoryPosition
        if (!isMobile && !activeCategoryPosition) return null;

        return (
          <div
            key={`dropdown-${category.idCategorie}`}
            style={getDropdownStyles(category)}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-md">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 text-base lg:text-lg">
                    {category.nom}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveCategoryPosition(null);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Liste des options */}
              <div className={`${category.types.length > 4 ? 'max-h-80 overflow-y-auto' : ''} custom-scrollbar`}>
                {/* Option pour voir tous les produits */}
                <button
                  onClick={() => {
                    navigateToProducts(category.idCategorie);
                    setActiveCategory(null);
                    setActiveCategoryPosition(null);
                  }}
                  className="w-full text-left block px-5 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200 group border-b border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                        Voir tous les produits
                      </div>
                      <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600">
                        Parcourir toute la catégorie {category.nom.toLowerCase()}
                      </p>
                    </div>
                    <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Types spécifiques */}
                {category.types.map((type, typeIndex) => (
                  <button
                    key={type.idType}
                    onClick={() => {
                      navigateToProducts(category.idCategorie, type.idType);
                      setActiveCategory(null);
                      setActiveCategoryPosition(null);
                    }}
                    className={`
                      w-full text-left block px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                      transition-all duration-200 group
                      ${typeIndex !== category.types!.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {type.nom}
                        </div>
                        {type.description && (
                          <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2 group-hover:text-gray-600">
                            {type.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

          {/* Indicateur de scroll pour mobile */}
          {isMobile && needsScroll && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/80 rounded-full px-4 py-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>Glissez pour naviguer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          )}
        </div>
      

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e0, #a0aec0);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a0aec0, #718096);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
    </div>
  );
}
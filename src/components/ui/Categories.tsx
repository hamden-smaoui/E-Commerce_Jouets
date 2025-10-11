"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDownIcon, ArrowRightIcon,ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";

const categoryColors = [
  "bg-gradient-to-r from-blue-400 to-blue-500",
  "bg-gradient-to-r from-pink-400 to-pink-500",
  "bg-gradient-to-r from-yellow-300 to-yellow-400",
  "bg-gradient-to-r from-green-400 to-green-500",
  "bg-gradient-to-r from-purple-400 to-purple-500",
  "bg-gradient-to-r from-red-400 to-red-500",
  "bg-gradient-to-r from-cyan-400 to-cyan-500",
  "bg-gradient-to-r from-orange-400 to-orange-500",
  "bg-gradient-to-r from-teal-400 to-teal-500",
  "bg-gradient-to-r from-indigo-400 to-indigo-500",
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if scroll needed
  const checkScrollNeed = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    setNeedsScroll(scrollContainer.scrollWidth > scrollContainer.clientWidth);
    if (!isMobile) updateNavigationButtons();
  }, [isMobile]);

  // Update nav button state
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
    if (typeId) searchParams.set('types', typeId.toString());
    router.push(`/site/products?${searchParams.toString()}`);
  };

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

  // Scroll event handling
  const handleManualScroll = useCallback(() => {
    if (!isMobile) updateNavigationButtons();
  }, [isMobile, updateNavigationButtons]);

  // Initial scroll setup
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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener('scroll', handleManualScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleManualScroll);
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
      e.preventDefault();
      navigateToProducts(category.idCategorie);
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
      return activeCategoryPosition ? {
        position: 'absolute' as const,
        top: 'calc(100% + 14px)',
        left: `${activeCategoryPosition.left}px`,
        transform: 'translateX(-50%)',
        width: '320px',
        zIndex: 100,
      } : {};
    }
  };

  // Close dropdown on outside click
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
      <div className="py-8 bg-gradient-to-r from-pink-50 via-yellow-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <KidsCornerLoader message="Aucune catégorie disponible..." size="sm" />
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        

        <div ref={containerRef} className="relative">
          {/* Desktop nav arrows */}
          {/* Desktop nav arrows */}
{!isMobile && needsScroll && (
  <>
    <button
      onClick={() => scrollToDirection('left')}
      disabled={!canScrollLeft}
      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white shadow-2xl ${
        canScrollLeft
          ? 'bg-pink-300/90 hover:bg-pink-400/90 text-white'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
      style={{
        filter: canScrollLeft ? "drop-shadow(0 2px 12px #f472b6aa)" : undefined,
        outline: "none",
      }}
      aria-label="Catégorie précédente"
    >
              <ArrowLeftIcon className="h-8 w-8 text-white" aria-label="left arrow" />
    </button>
    <button
      onClick={() => scrollToDirection('right')}
      disabled={!canScrollRight}
      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white shadow-2xl ${
        canScrollRight
          ? 'bg-sky-300/90 hover:bg-sky-400/90 text-white'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
      style={{
        filter: canScrollRight ? "drop-shadow(0 2px 12px #38bdf8aa)" : undefined,
        outline: "none",
      }}
      aria-label="Catégorie suivante"
    >
              <ArrowLeftIcon className="h-8 w-8 text-white" aria-label="right arrow" />
    </button>
  </>
)}

          {/* Scrollable categories */}
          <div className={`${!isMobile && needsScroll ? 'px-12' : ''}`}>
            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className={`flex space-x-3 sm:space-x-5 pb-3 ${!needsScroll ? 'justify-center' : ''}`}>
                {categories.map((category, index) => (
                  <div
                    key={category.idCategorie}
                    ref={(el) => { categoryRefs.current[category.idCategorie] = el }}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => handleCategoryHover(category)}
                  >
                    <button
  onClick={(e) => handleCategoryClick(e, category)}
  className={`
    inline-flex items-center gap-2 
    px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4
    text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl
    hover:shadow-xl sm:hover:shadow-2xl hover:scale-105 hover:-translate-y-1
    transition-all duration-300 ease-out
    border-2 border-white/30
    whitespace-nowrap font-extrabold font-[Comic_Sans_MS,sans-serif]
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

          {/* Mobile: overlay for dropdown */}
          {isMobile && activeCategory && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              onClick={() => {
                setActiveCategory(null);
                setActiveCategoryPosition(null);
              }}
            />
          )}

          {/* Dropdown */}
          {categories.map((category) => {
            const isOpen = activeCategory === category.idCategorie;
            if (!category.types || category.types.length === 0 || !isOpen) return null;
            if (!isMobile && !activeCategoryPosition) return null;
            return (
              <div
                key={`dropdown-${category.idCategorie}`}
                style={getDropdownStyles(category)}
              >
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-pink-100 overflow-hidden backdrop-blur-md min-w-[220px]">
                  {/* Playful bar */}
                  <div className="w-full h-2 bg-gradient-to-r from-pink-300 via-yellow-200 to-blue-200" />
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-pink-600 text-base">{category.nom}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(null);
                        setActiveCategoryPosition(null);
                      }}
                      className="p-1 hover:bg-pink-50 rounded-full transition-colors"
                      aria-label="Fermer"
                    >
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className={`${category.types.length > 4 ? 'max-h-80 overflow-y-auto' : ''} custom-scrollbar`}>
                    {/* All products */}
                    <button
                      onClick={() => {
                        navigateToProducts(category.idCategorie);
                        setActiveCategory(null);
                        setActiveCategoryPosition(null);
                      }}
                      className="w-full text-left block px-5 py-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50 transition-all duration-200 group border-b border-gray-100"
                    >
                      <div className="font-semibold text-blue-500 group-hover:text-pink-500 transition-colors">
                        Voir tous les produits
                      </div>
                      <div className="text-xs text-gray-500">
                        Parcourir toute la catégorie {category.nom.toLowerCase()}
                      </div>
                    </button>
                    {/* Specific types */}
                    {category.types.map((type, typeIndex) => (
                      <button
                        key={type.idType}
                        onClick={() => {
                          navigateToProducts(category.idCategorie, type.idType);
                          setActiveCategory(null);
                          setActiveCategoryPosition(null);
                        }}
                        className={`
                          w-full text-left block px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50
                          transition-all duration-200 group
                          ${typeIndex !== category.types!.length - 1 ? 'border-b border-gray-100' : ''}
                        `}
                      >
                        <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {type.nom}
                        </div>
                        {type.description && (
                          <div className="text-xs text-gray-500 mt-2 line-clamp-2 group-hover:text-gray-700">
                            {type.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {display: none;}
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none;}
        .custom-scrollbar::-webkit-scrollbar { width: 6px;}
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 6px;}
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fbcfe8, #a7f3d0);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #f9a8d4, #6ee7b7);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const userInteracted = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDirection = useRef(1);

  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [clickedCategory, setClickedCategory] = useState<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkIfScrollNeeded = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const needsScroll = scrollContainer.scrollWidth > scrollContainer.clientWidth;
    setShouldAutoScroll(needsScroll);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const timer = setTimeout(checkIfScrollNeeded, 100);

      const handleResize = () => checkIfScrollNeeded();
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [categories, checkIfScrollNeeded]);

  const startAutoScroll = useCallback(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !shouldAutoScroll || hoveredCategory || clickedCategory || userInteracted.current) return;

    autoScrollRef.current = setInterval(() => {
      if (!userInteracted.current && scrollContainer && !hoveredCategory && !clickedCategory) {
        const scrollSpeed = 0.5;
        scrollContainer.scrollLeft += scrollSpeed * scrollDirection.current;

        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) {
          scrollDirection.current = -1;
        } else if (scrollContainer.scrollLeft <= 1) {
          scrollDirection.current = 1;
        }
      }
    }, 16);
  }, [shouldAutoScroll, hoveredCategory, clickedCategory]);

  const stopAutoScroll = useCallback(() => {
    userInteracted.current = true;

    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    resumeTimeoutRef.current = setTimeout(() => {
      userInteracted.current = false;
      if (!hoveredCategory && !clickedCategory) {
        startAutoScroll();
      }
    }, 4000);
  }, [hoveredCategory, clickedCategory, startAutoScroll]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !categories.length) return;

    scrollContainer.scrollLeft = 0;

    if (shouldAutoScroll) {
      const timer = setTimeout(() => startAutoScroll(), 1000);

      const events = ['wheel', 'touchstart', 'mousedown', 'scroll'] as const;
      events.forEach(event => {
        scrollContainer.addEventListener(event, stopAutoScroll, { passive: true });
      });

      return () => {
        clearTimeout(timer);
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        events.forEach(event => {
          scrollContainer?.removeEventListener(event, stopAutoScroll);
        });
      };
    }
  }, [categories, shouldAutoScroll, startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    if (hoveredCategory || clickedCategory) {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    } else if (!userInteracted.current && shouldAutoScroll) {
      startAutoScroll();
    }
  }, [hoveredCategory, clickedCategory, shouldAutoScroll, startAutoScroll]);

  const handleCategoryClick = (e: React.MouseEvent, category: CategorieWithTypes) => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    userInteracted.current = true;

    if (isMobile && category.types && category.types.length > 0) {
      e.preventDefault();
      setClickedCategory(clickedCategory === category.idCategorie ? null : category.idCategorie);
    }
  };

  const handleChevronClick = (e: React.MouseEvent, category: CategorieWithTypes) => {
    e.preventDefault();
    e.stopPropagation();

    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    userInteracted.current = true;

    setClickedCategory(clickedCategory === category.idCategorie ? null : category.idCategorie);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setClickedCategory(null);
        setHoveredCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!categories.length) {
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
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            Catégories
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Découvrez nos différentes catégories
          </p>
        </div>

        <div className="relative">
          <div
            ref={containerRef}
            className="relative"
            onMouseEnter={() => {
              if (shouldAutoScroll && !isMobile) stopAutoScroll();
            }}
            onMouseLeave={() => {
              if (shouldAutoScroll && !hoveredCategory && !clickedCategory && !isMobile) {
                userInteracted.current = false;
                setTimeout(() => startAutoScroll(), 500);
              }
            }}
          >
            {shouldAutoScroll && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-[5] pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent z-[5] pointer-events-none" />
              </>
            )}

            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div
                className={`flex space-x-3 sm:space-x-4 pb-2 ${!shouldAutoScroll ? 'justify-center' : 'inline-flex'}`}
              >
                {categories.map((category, index) => (
                  <div
                    key={category.idCategorie}
                    className="relative flex-shrink-0 snap-center"
                    onMouseEnter={() => {
                      if (!isMobile && category.types && category.types.length > 0) {
                        setHoveredCategory(category.idCategorie);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) {
                        setHoveredCategory(null);
                      }
                    }}
                  >
                    <a
                      href={`/category/${category.idCategorie}`}
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
                        <button
                          type="button"
                          onClick={(e) => handleChevronClick(e, category)}
                          className="p-1 -m-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <ChevronDownIcon
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                              (hoveredCategory === category.idCategorie || clickedCategory === category.idCategorie) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {categories.map((category, index) => {
            const isOpen = (hoveredCategory === category.idCategorie && !isMobile) || clickedCategory === category.idCategorie;

            if (!category.types || category.types.length === 0 || !isOpen) return null;

            return (
              <div
                key={`dropdown-${category.idCategorie}`}
                className="absolute top-full mt-3 w-72 sm:w-80 z-[100]"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-md">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          Types disponibles
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {category.types.length} type{category.types.length > 1 ? 's' : ''} disponible{category.types.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {(isMobile || clickedCategory === category.idCategorie) && (
                        <button
                          type="button"
                          onClick={() => setClickedCategory(null)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    className={`${category.types.length > 5 ? 'max-h-80 overflow-y-auto' : ''} custom-scrollbar`}
                  >
                    {category.types.map((type, typeIndex) => (
                      <a
                        key={type.idType}
                        href={`/category/${category.idCategorie}/type/${type.idType}`}
                        className={`
                          block px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
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
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {categories.length > 3 && (
            <div className="flex justify-center mt-4">
              <div className="text-xs text-gray-500 bg-white/70 rounded-full px-3 py-1">
                ← Faites glisser pour naviguer →
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .categories-container {
          -webkit-overflow-scrolling: touch;
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
        @media (max-width: 640px) {
          .category-item {
            min-width: fit-content;
          }
        }
      `}</style>
    </div>
  );
}
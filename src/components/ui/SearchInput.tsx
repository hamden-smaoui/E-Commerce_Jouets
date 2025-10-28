// components/ui/SearchInput.tsx - Version améliorée
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  ClockIcon,
  TagIcon,
  BuildingStorefrontIcon,
  CubeIcon
} from "@heroicons/react/24/outline";
import SearchService, { SearchSuggestion } from "@/services/search-service";
import { debounce } from "lodash";
import * as fbq from "@/lib/fpixel";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "Rechercher des jouets, catégories, marques...", 
  className = "",
  onSearch 
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      setIsLoading(true);
      try {
        const searchSuggestions = await SearchService.getSearchSuggestions(searchQuery);
        setSuggestions(searchSuggestions);
      } catch (error) {
        console.error("Erreur suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (isOpen) {
      debouncedGetSuggestions(query);
    }
  }, [query, isOpen, debouncedGetSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (!isOpen && value.length >= 0) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    debouncedGetSuggestions(query);
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsOpen(false);
    setQuery(searchQuery);
    // 🔥 TRACKER L'ÉVÉNEMENT META PIXEL
  fbq.event('Search', {
    search_string: searchQuery.trim()
  });
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    let searchQuery = suggestion.query;
    let searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
    
    if (suggestion.filter) {
      const params = new URLSearchParams({ q: searchQuery });
      
      if (suggestion.filter.category) {
        params.append('category', suggestion.filter.category);
      }
      if (suggestion.filter.marque) {
        params.append('marque', suggestion.filter.marque);
      }
      if (suggestion.filter.type) {
        params.append('type', suggestion.filter.type);
      }
      
      searchUrl = `/search?${params.toString()}`;
    }
    
    setIsOpen(false);
    setQuery(searchQuery);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(searchUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionClick(suggestions[selectedIndex]);
    } else {
      handleSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'category':
        return <TagIcon className="w-4 h-4 text-purple-600" />;
      case 'brand':
        return <BuildingStorefrontIcon className="w-4 h-4 text-blue-600" />;
      case 'type':
        return <CubeIcon className="w-4 h-4 text-green-600" />;
      case 'product':
        return <MagnifyingGlassIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'category': return 'Catégorie';
      case 'brand': return 'Marque';
      case 'type': return 'Type';
      case 'product': return 'Produit';
      case 'recent': return 'Récent';
      default: return '';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-10 text-gray-700 bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 shadow-sm"
            autoComplete="off"
          />
          
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p>Recherche en cours...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors group ${
                    index === selectedIndex ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="truncate">{suggestion.text}</span>
                      {suggestion.type !== 'recent' && suggestion.type !== 'product' && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {getSuggestionTypeLabel(suggestion.type)}
                        </span>
                      )}
                    </div>
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {suggestion.count} résultat{suggestion.count > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              ))}
              
              {suggestions.some(s => s.type === 'recent') && (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      SearchService.clearRecentSearches();
                      setSuggestions(prev => prev.filter(s => s.type !== 'recent'));
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Effacer l'historique de recherche
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>
                {query.length > 0 ? 'Aucune suggestion trouvée' : 'Commencez à taper pour voir les suggestions'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
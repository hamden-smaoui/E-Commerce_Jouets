// services/search-service.ts - Version améliorée
const API_BASE_URL = 'http://localhost:3001/api/jouets';

export interface SearchParams {
  q: string;
  category?: string;
  marque?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  suggestions: SearchSuggestion[];
  searchTerm: string;
  searchStats: {
    byCategory: Array<{ category: string; count: number }>;
    byBrand: Array<{ brand: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
  };
}

export interface SearchSuggestion {
  type: 'recent' | 'popular' | 'category' | 'product' | 'brand' | 'type';
  text: string;
  query: string;
  count?: number;
  filter?: {
    category?: string;
    marque?: string;
    type?: string;
  };
}

class SearchService {
  private recentSearches: string[] = [];
  private maxRecentSearches = 5;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recent_searches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    }
  }

  async searchProducts(params: SearchParams): Promise<SearchResult> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE_URL}/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const result = await response.json();
      
      // Sauvegarder la recherche récente
      this.addToRecentSearches(params.q);
      
      return result;
    } catch (error) {
      throw new Error(`Erreur de recherche: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (query.length < 2) {
      return this.getRecentSearches();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search-suggestions?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const suggestions = await response.json();
        
        // Combiner avec les recherches récentes qui matchent
        const recentMatches = this.getRecentSearches().filter(recent => 
          recent.text.toLowerCase().includes(query.toLowerCase())
        );
        
        return [...recentMatches, ...suggestions];
      }
    } catch (error) {
      console.error('Erreur suggestions:', error);
    }

    return this.getRecentSearches().filter(recent => 
      recent.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Nouvelle méthode pour effectuer une recherche intelligente
  async smartSearch(query: string): Promise<SearchResult> {
    // Détecter si la recherche correspond à une catégorie, marque ou type spécifique
    const searchParams: SearchParams = { q: query };
    
    // Tu peux ajouter ici une logique pour détecter automatiquement
    // si le terme correspond à une catégorie, marque ou type connu
    
    return this.searchProducts(searchParams);
  }

  private addToRecentSearches(query: string) {
    if (!query || query.length < 2) return;
    
    this.recentSearches = this.recentSearches.filter(search => search !== query);
    this.recentSearches.unshift(query);
    
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }
  }

  private getRecentSearches(): SearchSuggestion[] {
    return this.recentSearches.map(search => ({
      type: 'recent' as const,
      text: search,
      query: search
    }));
  }

  clearRecentSearches() {
    this.recentSearches = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recent_searches');
    }
  }
}

export default new SearchService();
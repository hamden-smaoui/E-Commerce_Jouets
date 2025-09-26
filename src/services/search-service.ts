import api from './api';

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
      if (stored) this.recentSearches = JSON.parse(stored);
    }
  }

  async searchProducts(params: SearchParams): Promise<SearchResult> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    const response = await api.get<SearchResult>(`/produits/search?${searchParams}`);
    this.addToRecentSearches(params.q);
    return response.data;
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (query.length < 2) {
      return this.getRecentSearches();
    }
    try {
      const response = await api.get<SearchSuggestion[]>(`/produits/search-suggestions?q=${encodeURIComponent(query)}`);
      const suggestions = response.data;
      const recentMatches = this.getRecentSearches().filter(recent =>
        recent.text.toLowerCase().includes(query.toLowerCase())
      );
      return [...recentMatches, ...suggestions];
    } catch {
      return this.getRecentSearches().filter(recent =>
        recent.text.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async smartSearch(query: string): Promise<SearchResult> {
    return this.searchProducts({ q: query });
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
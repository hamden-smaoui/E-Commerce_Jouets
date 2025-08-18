export interface FilterState {
  categories: number[];
  marques: number[];
  types: number[];
  genres: string[];
  prix: { min: number; max: number };
  age: { min: number; max: number };
}

export interface FilterProps {
  onFiltersChange?: (filters: FilterState) => void;
}
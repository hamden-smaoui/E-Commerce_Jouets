"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import CategoriesService, { Categorie } from "@/services/categories-service";
import MarquesService, { Marque } from "@/services/marques-service";
import TypesService, { Type, TypeResponse } from "@/services/types-service";
import DualRangeSlider from './DualRangeSlider';

export interface FilterState {
  categories: number[];
  marques: number[];
  types: number[];
  genres: ("fille" | "garçon" | "enfant")[];
  prix: { min: number; max: number };
  age: { min: number; max: number };
}

interface FilterProps {
  onFiltersChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  hideTitle?: boolean;
  // ✅ NOUVEAU - Recevoir les limites réelles depuis Products
  productLimits?: {
    minPrix: number;
    maxPrix: number;
    minAge: number;
    maxAge: number;
  };
}

const Filter: React.FC<FilterProps> = ({ 
  onFiltersChange, 
  initialFilters, 
  hideTitle,
  productLimits // ✅ NOUVEAU
}) => {
  // ✅ Utiliser les limites réelles ou des valeurs par défaut
  const limits = productLimits || {
    minPrix: 0,
    maxPrix: 1500,
    minAge: 0,
    maxAge: 144
  };

  const [categories, setCategories] = useState<number[]>(initialFilters?.categories || []);
  const [marques, setMarques] = useState<number[]>(initialFilters?.marques || []);
  const [types, setTypes] = useState<number[]>(initialFilters?.types || []);
  const [genres, setGenres] = useState<("fille" | "garçon" | "enfant")[]>(initialFilters?.genres || []);
  const [prixMin, setPrixMin] = useState<number>(initialFilters?.prix?.min ?? limits.minPrix);
  const [prixMax, setPrixMax] = useState<number>(initialFilters?.prix?.max ?? limits.maxPrix);
  const [ageMin, setAgeMin] = useState<number>(initialFilters?.age?.min ?? limits.minAge);
  const [ageMax, setAgeMax] = useState<number>(initialFilters?.age?.max ?? limits.maxAge);

  const [showCategories, setShowCategories] = useState(false);
  const [showMarques, setShowMarques] = useState(false);
  const [showTypes, setShowTypes] = useState(false);
  const [showGenres, setShowGenres] = useState(false);

  const [categoriesList, setCategoriesList] = useState<Categorie[]>([]);
  const [marquesList, setMarquesList] = useState<Marque[]>([]);
  const [typesList, setTypesList] = useState<TypeResponse[]>([]);
  const [availableTypes, setAvailableTypes] = useState<Type[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMarques, setLoadingMarques] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const categoryRef = useRef<HTMLDivElement>(null);
  const marqueRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const onFiltersChangeRef = useRef(onFiltersChange);
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  }, [onFiltersChange]);

  const genresList: ("fille" | "garçon" | "enfant")[] = ["enfant", "fille", "garçon"];

  // ✅ NOUVEAU - Mettre à jour les valeurs quand les limites changent
  useEffect(() => {
    if (productLimits) {
      setPrixMin(prev => Math.max(prev, productLimits.minPrix));
      setPrixMax(prev => Math.min(prev, productLimits.maxPrix));
      setAgeMin(prev => Math.max(prev, productLimits.minAge));
      setAgeMax(prev => Math.min(prev, productLimits.maxAge));
    }
  }, [productLimits]);

  useEffect(() => {
    if (initialFilters) {
      setCategories(initialFilters.categories || []);
      setMarques(initialFilters.marques || []);
      setTypes(initialFilters.types || []);
      setGenres(initialFilters.genres || []);
      if (initialFilters.prix) {
        setPrixMin(initialFilters.prix.min);
        setPrixMax(initialFilters.prix.max);
      }
      if (initialFilters.age) {
        setAgeMin(initialFilters.age.min);
        setAgeMax(initialFilters.age.max);
      }
    }
  }, [initialFilters]);

  useEffect(() => {
    loadCategories();
    loadMarques();
    loadTypes();
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      setAvailableTypes(typesList);
    } else {
      const filteredTypes = typesList.filter(type => 
        type?.categories?.some(cat => categories.includes(cat.idCategorie))
      );
      setAvailableTypes(filteredTypes);
      if (isInitialized) {
        setTypes(prevTypes => 
          prevTypes.filter(typeId => 
            filteredTypes.some(type => type.idType === typeId)
          )
        );
      }
    }
  }, [categories, typesList, isInitialized]);

  const notifyFiltersChange = useCallback(() => {
    const filters: FilterState = {
      categories,
      marques,
      types,
      genres,
      prix: { min: prixMin, max: prixMax },
      age: { min: ageMin, max: ageMax },
    };
    onFiltersChangeRef.current?.(filters);
  }, [categories, marques, types, genres, prixMin, prixMax, ageMin, ageMax]);

  useEffect(() => {
    const timer = setTimeout(() => {
      notifyFiltersChange();
    }, 300);
    return () => clearTimeout(timer);
  }, [notifyFiltersChange]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await CategoriesService.getAllCategories();
      setCategoriesList(data);
    } catch (error) {
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadMarques = async () => {
    try {
      setLoadingMarques(true);
      const data = await MarquesService.getAllMarques();
      setMarquesList(data);
    } catch (error) {
      console.error('Erreur chargement marques:', error);
    } finally {
      setLoadingMarques(false);
    }
  };

  const loadTypes = async () => {
    try {
      setLoadingTypes(true);
      const data = await TypesService.getAllTypes();
      setTypesList(data);
      setIsInitialized(true);
    } catch (error) {
      console.error('Erreur chargement types:', error);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setShowCategories(false);
      if (marqueRef.current && !marqueRef.current.contains(event.target as Node)) setShowMarques(false);
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setShowTypes(false);
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) setShowGenres(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMultiSelect = useCallback((value: number | string, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter((prev: any) => 
      prev.includes(value) ? prev.filter((item: any) => item !== value) : [...prev, value]
    );
  }, []);

  const removeSelection = useCallback((value: number | string, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter((prev: any) => prev.filter((item: any) => item !== value));
  }, []);

  const convertAgeToText = (months: number): string => {
    if (months < 12) return `${months} mois`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths === 0 ? `${years} an${years > 1 ? "s" : ""}` : `${years}a ${remainingMonths}m`;
  };

  const resetAllFilters = useCallback(() => {
    setCategories([]);
    setMarques([]);
    setTypes([]);
    setGenres([]);
    setPrixMin(limits.minPrix);
    setPrixMax(limits.maxPrix);
    setAgeMin(limits.minAge);
    setAgeMax(limits.maxAge);
  }, [limits]);

  const getSelectedNames = (selectedIds: number[], itemsList: any[], nameKey: string) => {
    return selectedIds.map(id => {
      const item = itemsList.find(item => item[`id${nameKey}`] === id);
      return item?.nom || '';
    }).filter(Boolean);
  };

  const totalSelections = categories.length + marques.length + types.length + genres.length;

  const Dropdown = ({
    label,
    color,
    items,
    selected,
    setter,
    show,
    setShow,
    refEl,
    loading,
    idKey,
    isString = false
  }: any) => (
    <div className="mb-6 relative" ref={refEl}>
      <h3 className={`text-xs font-bold mb-2 text-${color}-600 font-[Comic_Sans_MS,sans-serif]`}>{label}</h3>
      <div
        className={`relative flex items-center cursor-pointer rounded-lg border-2 border-gray-200 hover:border-${color}-400 transition-all`}
        onClick={() => !loading && setShow(!show)}
      >
        <div className={`input input-bordered input-sm w-full truncate pr-8 bg-white/80 ${loading ? 'opacity-50' : ''} font-[Comic_Sans_MS,sans-serif]`}>
          {loading ? (
            'Chargement...'
          ) : selected.length > 0 ? (
            selected.length === 1 
              ? (isString ? selected[0] : items.find((item: any) => item[idKey] === selected[0])?.nom || '')
              : `${selected.length} sélectionnés`
          ) : (
            `Sélectionner ${label.toLowerCase()}`
          )}
        </div>
        <svg
          className={`absolute right-2 h-4 w-4 transform transition-transform pointer-events-none ${show ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {show && !loading && (
        <div className="absolute z-50 bg-white border rounded-lg shadow-lg w-full max-h-40 overflow-y-auto mt-1">
          {items.map((item: any) => {
            const itemId = isString ? item : item[idKey];
            const itemName = isString ? item : item.nom;
            return (
              <label key={itemId} className="flex items-center space-x-2 cursor-pointer hover:bg-pink-50 p-2 border-b border-gray-100 last:border-b-0">
                <input
                  type="checkbox"
                  checked={selected.includes(itemId)}
                  onChange={() => handleMultiSelect(itemId, setter)}
                  className={`checkbox checkbox-${color} checkbox-sm`}
                />
                <span className="text-sm flex-1 font-[Comic_Sans_MS,sans-serif]">{itemName}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full p-4 bg-white/80 shadow-xl rounded-2xl border-2 border-pink-200 font-[Comic_Sans_MS,sans-serif]">
      {!hideTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-pink-600 drop-shadow-lg flex items-center font-[Comic_Sans_MS,sans-serif]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </h2>
          {totalSelections > 0 && (
            <button onClick={resetAllFilters} className="text-xs text-red-500 hover:text-red-700 underline font-bold">
              Effacer tout
            </button>
          )}
        </div>
      )}

      <div>
        <Dropdown 
          label="Catégories" 
          color="pink" 
          items={categoriesList} 
          selected={categories} 
          setter={setCategories} 
          show={showCategories} 
          setShow={setShowCategories} 
          refEl={categoryRef}
          loading={loadingCategories}
          idKey="idCategorie"
        />
        
        <Dropdown 
          label="Marques" 
          color="blue" 
          items={marquesList} 
          selected={marques} 
          setter={setMarques} 
          show={showMarques} 
          setShow={setShowMarques} 
          refEl={marqueRef}
          loading={loadingMarques}
          idKey="idMarque"
        />
        
        <Dropdown 
          label="Type de jeu" 
          color="purple" 
          items={availableTypes} 
          selected={types} 
          setter={setTypes} 
          show={showTypes} 
          setShow={setShowTypes} 
          refEl={typeRef}
          loading={loadingTypes}
          idKey="idType"
        />

        {/* ✅ MODIFIÉ - Utiliser les limites réelles */}
        <DualRangeSlider
          min={limits.minPrix}
          max={limits.maxPrix}
          step={1}
          minValue={prixMin}
          maxValue={prixMax}
          onChange={(min, max) => {
            setPrixMin(min);
            setPrixMax(max);
          }}
          label="Prix (TND)"
          color="orange"
          valueFormatter={(v: number) => `${v} TND`}
        />

        {/* ✅ MODIFIÉ - Utiliser les limites réelles */}
        <DualRangeSlider
          min={limits.minAge}
          max={limits.maxAge}
          step={1}
          minValue={ageMin}
          maxValue={ageMax}
          onChange={(min, max) => {
            setAgeMin(min);
            setAgeMax(max);
          }}
          label="Âge"
          color="yellow"
          valueFormatter={convertAgeToText}
        />
        
        <Dropdown 
          label="Genre" 
          color="indigo" 
          items={genresList} 
          selected={genres} 
          setter={setGenres} 
          show={showGenres} 
          setShow={setShowGenres} 
          refEl={genreRef}
          loading={false}
          idKey=""
          isString={true}
        />
      </div>

      {totalSelections > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold mb-2 text-pink-600 font-[Comic_Sans_MS,sans-serif]">Filtres actifs :</h3>
          <div className="flex flex-wrap gap-1">
            {getSelectedNames(categories, categoriesList, 'Categorie').map((name) => (
              <div key={name} className="badge badge-primary gap-1 text-xs">
                {name}
                <button 
                  className="btn btn-xs btn-circle btn-ghost" 
                  onClick={() => {
                    const id = categoriesList.find(cat => cat.nom === name)?.idCategorie;
                    if (id) removeSelection(id, setCategories);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {getSelectedNames(marques, marquesList, 'Marque').map((name) => (
              <div key={name} className="badge badge-info gap-1 text-xs">
                {name}
                <button 
                  className="btn btn-xs btn-circle btn-ghost" 
                  onClick={() => {
                    const id = marquesList.find(marque => marque.nom === name)?.idMarque;
                    if (id) removeSelection(id, setMarques);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {getSelectedNames(types, availableTypes, 'Type').map((name) => (
              <div key={name} className="badge badge-success gap-1 text-xs">
                {name}
                <button 
                  className="btn btn-xs btn-circle btn-ghost" 
                  onClick={() => {
                    const id = availableTypes.find(type => type.nom === name)?.idType;
                    if (id) removeSelection(id, setTypes);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {genres.map((genre) => (
              <div key={genre} className="badge badge-warning gap-1 text-xs">
                {genre}
                <button 
                  className="btn btn-xs btn-circle btn-ghost" 
                  onClick={() => removeSelection(genre, setGenres)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
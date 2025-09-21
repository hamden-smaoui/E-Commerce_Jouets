'use client';

import React from 'react';
import Select from 'react-select';
import { Couleur, Taille, Age } from '@/services/produits-service';

interface Variant {
  idCouleur: number;
  idTaille?: number;
  idAge?: number;
  quantiteStock: number;
}

interface VariationsManagerProps {
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  couleurs: Couleur[];
  tailles: Taille[];
  ages: Age[];
}

const VariationsManager: React.FC<VariationsManagerProps> = ({
  variants,
  onVariantsChange,
  couleurs,
  tailles,
  ages,
}) => {
  const addVariant = () => {
    if (couleurs.length === 0) {
      alert('Aucune couleur disponible. Veuillez d\'abord ajouter des couleurs.');
      return;
    }

    const newVariant: Variant = {
      idCouleur: couleurs[0].idCouleur,
      quantiteStock: 0,
    };
    onVariantsChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, updatedVariant: Partial<Variant>) => {
    const newVariants = variants.map((variant, i) =>
      i === index ? { ...variant, ...updatedVariant } : variant
    );
    onVariantsChange(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  const isVariantDuplicate = (variant: Variant, currentIndex: number): boolean => {
    return variants.some((v, index) => 
      index !== currentIndex &&
      v.idCouleur === variant.idCouleur &&
      v.idTaille === variant.idTaille &&
      v.idAge === variant.idAge
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-700">Variations du produit</h4>
        <button
          type="button"
          onClick={addVariant}
          className="btn btn-sm btn-primary"
        >
          + Ajouter une variation
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Aucune variation définie</p>
          <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter une variation" pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => {
            const isDuplicate = isVariantDuplicate(variant, index);
            
            return (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  isDuplicate ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                {isDuplicate && (
                  <div className="text-sm text-red-600 mb-2 font-medium">
                    ⚠️ Cette variation existe déjà
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Couleur (obligatoire) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Couleur *
                    </label>
                    <Select
                      options={couleurs.map(c => ({ value: c.idCouleur, label: c.nom }))}
                      value={couleurs.find(c => c.idCouleur === variant.idCouleur) 
                        ? { value: variant.idCouleur, label: couleurs.find(c => c.idCouleur === variant.idCouleur)!.nom }
                        : null
                      }
                      onChange={(option) => {
                        updateVariant(index, { idCouleur: option?.value || couleurs[0].idCouleur });
                      }}
                      className="text-sm"
                      placeholder="Sélectionner..."
                    />
                  </div>

                  {/* Taille (optionnel) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Taille
                    </label>
                    <Select
                      options={tailles.map(t => ({ value: t.idTaille, label: t.nom }))}
                      value={variant.idTaille && tailles.find(t => t.idTaille === variant.idTaille)
                        ? { value: variant.idTaille, label: tailles.find(t => t.idTaille === variant.idTaille)!.nom }
                        : null
                      }
                      onChange={(option) => {
                        updateVariant(index, { idTaille: option?.value || undefined });
                      }}
                      className="text-sm"
                      placeholder="Optionnel..."
                      isClearable
                    />
                  </div>

                  {/* Âge (optionnel) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tranche d'âge
                    </label>
                    <Select
                      options={ages.map(a => ({ value: a.idAge, label: a.label }))}
                      value={variant.idAge && ages.find(a => a.idAge === variant.idAge)
                        ? { value: variant.idAge, label: ages.find(a => a.idAge === variant.idAge)!.label }
                        : null
                      }
                      onChange={(option) => {
                        updateVariant(index, { idAge: option?.value || undefined });
                      }}
                      className="text-sm"
                      placeholder="Optionnel..."
                      isClearable
                    />
                  </div>

                  {/* Stock */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.quantiteStock}
                        onChange={(e) => {
                          updateVariant(index, { quantiteStock: parseInt(e.target.value) || 0 });
                        }}
                        className="input input-sm input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="btn btn-sm btn-error btn-outline"
                        title="Supprimer cette variation"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {variants.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Stock total: {variants.reduce((sum, v) => sum + v.quantiteStock, 0)} unités</strong>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {variants.length} variation{variants.length > 1 ? 's' : ''} définie{variants.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationsManager;
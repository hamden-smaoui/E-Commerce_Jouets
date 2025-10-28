'use client';

import React from 'react';
import { FactureResponse ,ProduitVariation} from '@/services/facture-service';
import FacturesService from '@/services/facture-service';
import { useStoreInfo } from "@/hooks/useStoreInfo";

interface FactureViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  facture: FactureResponse | null;
  onEdit: (facture: FactureResponse) => void;
  onDownloadPDF: (id: number, numeroFacture: string) => void;
}

const FactureViewModal: React.FC<FactureViewModalProps> = ({
  isOpen,
  onClose,
  facture,
  onEdit,
  onDownloadPDF,
}) => {
  const { storeInfo } = useStoreInfo();

  if (!facture) return null;
const formatVariation = (variation?: ProduitVariation) => {
  if (!variation) return '';
  const parts = [];
  if (variation.couleur) parts.push(variation.couleur.nom);
  if (variation.taille) parts.push(variation.taille.nom);
  if (variation.age) parts.push(variation.age.label);
  return parts.length > 0 ? parts.join(' / ') : '';
};
  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Facture {facture.numeroFacture}</h3>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() => onDownloadPDF(facture.idFacture, facture.numeroFacture)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Télécharger PDF
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onEdit(facture)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modifier
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Fermer
            </button>
          </div>
        </div>

        {/* Aperçu de la facture */}
        <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          {/* En-tête avec logo */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-4">
              {/* Logo si disponible */}
              {storeInfo?.logo1 && (
                <img 
                  src={`${storeInfo.logo1}`}
                  alt="Logo" 
                  className="w-20 h-20 object-contain"
                />
              )}
              <div>
                <div className="text-gray-600">
                  <p className="font-semibold">{facture.entrepriseNom}</p>
                  <p>{facture.entrepriseAdresse}</p>
                  <p>Tél: {facture.entrepriseTelephone}</p>
                  <p>Email: {facture.entrepriseEmail}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">N° {facture.numeroFacture}</p>
              <p className="text-sm text-gray-600">
                Date: {FacturesService.formatDate(facture.dateFacture)}
              </p>
              {facture.dateEcheance && (
                <p className="text-sm text-gray-600">
                  Échéance: {FacturesService.formatDate(facture.dateEcheance)}
                </p>
              )}
              <div className="mt-2">
                <span
                  className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: FacturesService.getStatusColor(facture.statut) }}
                >
                  {FacturesService.getStatusLabel(facture.statut)}
                </span>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">FACTURER À:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">{facture.clientNom}</p>
              {facture.clientEmail && <p>{facture.clientEmail}</p>}
              {facture.clientTelephone && <p>{facture.clientTelephone}</p>}
              {facture.clientAdresse && <p>{facture.clientAdresse}</p>}
            </div>
          </div>

         {/* Détails de la commande */}
{facture.commande?.lignesCommandes && (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-3">DÉTAILS:</h3>
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Description</th>
            <th className="text-right">Qté</th>
            <th className="text-right">Prix unit. HT</th>
            <th className="text-right">Prix HT</th>
            <th className="text-right">TVA</th>
            <th className="text-right">Prix TTC</th>
          </tr>
        </thead>
        <tbody>
          {facture.commande.lignesCommandes.map((ligne, index) => {
            const prixUnitaireTTC = ligne.prixUnitaireFinal ?? 0;
            
            // Calculer tous les montants
            const tauxTVADecimal = 1 + facture.tauxTVA / 100;
            const prixUnitaireHT = prixUnitaireTTC / tauxTVADecimal;
            const totalLigneHT = prixUnitaireHT * ligne.quantite;
            const montantTVALigne = (totalLigneHT * facture.tauxTVA) / 100;
            const totalLigneTTC = totalLigneHT + montantTVALigne;

            return (
              <tr key={index}>
                <td>
                  <div>
                    <div className="font-semibold">{ligne.produit?.nom}</div>
                    <div className="text-xs text-gray-500 italic">
                      {formatVariation(ligne.variation)}
                    </div>
                    <div className="text-sm text-gray-500">{ligne.produit?.description}</div>
                  </div>
                </td>
                <td className="text-right">{ligne.quantite}</td>
                <td className="text-right">
                  {FacturesService.formatAmount(prixUnitaireHT)}
                </td>
                <td className="text-right">
                  {FacturesService.formatAmount(totalLigneHT)}
                </td>
                <td className="text-right">
                  {facture.tauxTVA}%
                </td>
                <td className="text-right font-semibold">
                  {FacturesService.formatAmount(totalLigneTTC)}
                </td>
              </tr>
            );
          })}

          {/* LIGNE FRAIS DE LIVRAISON */}
          {facture.commande.fraisLivraison !== undefined && facture.commande.fraisLivraison !== null && (
            <tr className="border-t-2 border-gray-300">
              <td>
                <div>
                  <div className="font-semibold">Frais de livraison</div>
                  {facture.commande.fraisLivraison === 0 && (
                    <div className="text-xs text-green-600 italic">Livraison gratuite 🎉</div>
                  )}
                </div>
              </td>
              <td className="text-right">-</td>
              <td className="text-right">
                {facture.commande.fraisLivraison === 0 
                  ? '0.000 DT' 
                  : FacturesService.formatAmount(
                      facture.commande.fraisLivraison / (1 + facture.tauxTVA / 100)
                    )
                }
              </td>
              <td className="text-right">
                {facture.commande.fraisLivraison === 0 
                  ? '0.000 DT' 
                  : FacturesService.formatAmount(
                      facture.commande.fraisLivraison / (1 + facture.tauxTVA / 100)
                    )
                }
              </td>
              <td className="text-right">{facture.tauxTVA}%</td>
              <td className="text-right font-semibold">
                {FacturesService.formatAmount(facture.commande.fraisLivraison)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

          {/* SECTION CODE PROMO */}
          {facture.commande && (facture.commande.codePromoGlobal || (facture.commande.reductionCodePromo && facture.commande.reductionCodePromo > 0)) && (
            <div className="mb-8">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Code Promo Appliqué</h3>
                {facture.commande.codePromoGlobal && (
                  <p className="text-sm text-green-600 mb-1">
                    <span className="font-medium">Code utilisé:</span> 
                    <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded font-mono text-xs">
                      {facture.commande.codePromoGlobal}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Totaux */}
<div className="flex justify-end">
  <div className="w-64">
    {(() => {
      // Calculer le sous-total HT des produits
      const tauxTVADecimal = 1 + facture.tauxTVA / 100;
      
      // Sous-total HT des produits
      const produitsHT = facture.commande?.lignesCommandes?.reduce((acc, ligne) => {
        const prixUnitaireTTC = ligne.prixUnitaireFinal ?? 0;
        const prixUnitaireHT = prixUnitaireTTC / tauxTVADecimal;
        return acc + (prixUnitaireHT * ligne.quantite);
      }, 0) ?? 0;

      // Frais de livraison HT
      const fraisLivraisonTTC = facture.commande?.fraisLivraison ?? 0;
      const fraisLivraisonHT = fraisLivraisonTTC / tauxTVADecimal;

      // Sous-total HT AVANT réduction
      const sousTotalHTAvantReduction = produitsHT + fraisLivraisonHT;

      // Réduction code promo (en TTC, on doit la convertir en HT)
      const reductionTTC = facture.commande?.reductionCodePromo ?? 0;
      const reductionHT = reductionTTC / tauxTVADecimal;

      // Total HT APRÈS réduction
      const totalHTApresReduction = sousTotalHTAvantReduction - reductionHT;

      // TVA calculée sur le total HT après réduction
      const montantTVA = (totalHTApresReduction * facture.tauxTVA) / 100;

      // Total TTC
      const totalTTC = totalHTApresReduction + montantTVA;

      return (
        <>
          {/* Sous-total HT (produits + livraison) */}
          <div className="flex justify-between py-2">
            <span>Sous-total HT:</span>
            <span>{FacturesService.formatAmount(sousTotalHTAvantReduction)}</span>
          </div>

          {/* Affichage de la réduction du code promo */}
          {reductionTTC > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>Réduction code promo:</span>
              <span>-{FacturesService.formatAmount(reductionHT)}</span>
            </div>
          )}

          {/* Total HT après réduction (optionnel, pour plus de clarté) */}
          {reductionTTC > 0 && (
            <div className="flex justify-between py-2 font-medium border-t border-gray-200 pt-2">
              <span>Total HT après réduction:</span>
              <span>{FacturesService.formatAmount(totalHTApresReduction)}</span>
            </div>
          )}

          {/* TVA */}
          <div className="flex justify-between py-2">
            <span>TVA ({facture.tauxTVA}%):</span>
            <span>{FacturesService.formatAmount(montantTVA)}</span>
          </div>

          {/* Total TTC */}
          <div className="border-t border-gray-300 mt-2 pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL TTC:</span>
              <span>{FacturesService.formatAmount(totalTTC)}</span>
            </div>
          </div>
        </>
      );
    })()}
  </div>
</div>

          {/* Notes */}
          {facture.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">NOTES:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{facture.notes}</p>
              </div>
            </div>
          )}

          {/* Informations de paiement */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Conditions de paiement:</p>
              <p>Paiement à réception de facture</p>
              {facture.entrepriseSiret && <p>SIRET: {facture.entrepriseSiret}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureViewModal;
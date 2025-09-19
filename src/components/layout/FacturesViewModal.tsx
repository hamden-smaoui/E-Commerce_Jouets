'use client';

import React from 'react';
import { FactureResponse } from '@/services/facture-service';
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
                  src={`http://localhost:3001${storeInfo.logo1}`}
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
                      <th className="text-right">Prix unit.</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facture.commande.lignesCommandes.map((ligne, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <div className="font-semibold">{ligne.produit.nom}</div>
                            <div className="text-sm text-gray-500">{ligne.produit.description}</div>
                          </div>
                        </td>
                        <td className="text-right">{ligne.quantite}</td>
                        <td className="text-right">{FacturesService.formatAmount(ligne.prixUnitaireFinal)}</td>
                        <td className="text-right font-semibold">
                          {FacturesService.formatAmount(ligne.sousTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Sous-total HT:</span>
                <span>{FacturesService.formatAmount(facture.montantHT)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>TVA ({facture.tauxTVA}%):</span>
                <span>{FacturesService.formatAmount(facture.montantTVA)}</span>
              </div>
              <div className="border-t border-gray-300 mt-2 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL TTC:</span>
                  <span>{FacturesService.formatAmount(facture.montantTotal)}</span>
                </div>
              </div>
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
// components/commandes/CommandeDetailsModal.tsx
'use client';

import React from 'react';
import { CommandeResponse } from '@/services/commandes-service';

interface CommandeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commande: CommandeResponse | null;
  onEdit: (commande: CommandeResponse) => void;
}

const CommandeDetailsModal: React.FC<CommandeDetailsModalProps> = ({
  isOpen,
  onClose,
  commande,
  onEdit,
}) => {
  const formatPrice = (prix: any): string => {
    if (prix === null || prix === undefined || prix === '' || isNaN(Number(prix))) {
      return '0.00 TND';
    }
    return `${Number(prix).toFixed(2)} TND`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
const formatVariation = (ligne: any) => {
  if (!ligne.variation) return '';
  const { couleur, taille, age } = ligne.variation;
  const parts = [];
  if (couleur) parts.push(couleur.nom);
  if (taille) parts.push(taille.nom);
  if (age) parts.push(age.label);
  return parts.length > 0 ? parts.join(' / ') : '';
};
  const getStatusBadge = (statut: string): string => {
    const badges = {
      'en attente': 'badge-warning',
      'en traitement': 'badge-info',
      'expédiée': 'badge-primary',
      'livrée': 'badge-success',
      'annulée': 'badge-error',
    };
    return badges[statut as keyof typeof badges] || 'badge-neutral';
  };

  const getPromotionBadge = (typePromotion: string): string => {
    const badges = {
      'pourcentage': 'badge-success',
      'montant_fixe': 'badge-info',
      'frais_livraison': 'badge-warning',
      'achat_x_obtenez_y': 'badge-primary',
    };
    return badges[typePromotion as keyof typeof badges] || 'badge-neutral';
  };

  const hasPromotions = (commande: CommandeResponse): boolean => {
    const hasProductPromotions = commande.lignesCommandes?.some(ligne => 
      ligne.reductionUnitaire && ligne.reductionUnitaire > 0
    ) || false;
    
    const hasGlobalPromotion = commande.promotionGlobale || commande.codePromoGlobal;
    
    return hasProductPromotions || !!hasGlobalPromotion;
  };

  if (!commande) return null;

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="font-bold text-xl">
            Détails de la Commande #{commande.idCommande}
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost self-end sm:self-auto"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Information Cards - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {/* Client Information */}
          <div className="card bg-base-200 col-span-1">
            <div className="card-body p-4">
              <h4 className="card-title text-base mb-3">Informations Client</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nom:</strong> {commande.clientPrenom} {commande.clientNom}</p>
                <p><strong>Email:</strong> {commande.clientEmail || 'N/A'}</p>
                <p><strong>Téléphone:</strong> {commande.clientTelephone}</p>
                <div className="mt-3">
                  <p className="font-semibold">Adresse:</p>
                  <div className="ml-2 text-xs opacity-80 bg-base-300 p-2 rounded mt-1">
                    {commande.clientAdresseRue}<br/>
                    {commande.clientAdresseVille}, {commande.clientAdresseCodePostal}<br/>
                    {commande.clientAdressePays}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="card bg-base-200 col-span-1">
            <div className="card-body p-4">
              <h4 className="card-title text-base mb-3">Informations Commande</h4>
              <div className="space-y-3 text-sm">
                <p><strong>Date:</strong> <br className="sm:hidden"/><span className="text-xs">{formatDate(commande.dateCommande)}</span></p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <strong>Statut:</strong>
                  <span className={`badge ${getStatusBadge(commande.statut)} badge-sm`}>
                    {commande.statut}
                  </span>
                </div>
                <p><strong>Montant Total:</strong> 
                  <span className="font-bold text-primary text-lg ml-2 block sm:inline">
                    {formatPrice(commande.montantTotal)}
                  </span>
                </p>
                <p><strong>Frais de livraison:</strong> 
                  {typeof commande?.fraisLivraison === 'number' && commande.fraisLivraison > 0 
                    ? formatPrice(commande.fraisLivraison)
                    : 'Livraison gratuite'
                  }
                </p>
                <div>
                  <strong>Notes:</strong> 
                  <p className="text-xs mt-1 bg-base-300 p-2 rounded">
                    {commande?.notesLivraison || 'Aucune note'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promotions & Savings */}
          {(hasPromotions(commande) || commande.calculDetails) && (
            <div className="card bg-success/10 border border-success/20 col-span-1 lg:col-span-2 xl:col-span-1">
              <div className="card-body p-4">
                <h4 className="card-title text-base text-success mb-3">Économies & Promotions</h4>
                <div className="space-y-2 text-sm">
                  {commande.calculDetails && (
                    <>
                      {commande.calculDetails.montantOriginal !== commande.calculDetails.montantFinal && (
                        <div className="bg-success/20 p-2 rounded">
                          <p><strong>Prix original:</strong> {formatPrice(commande.calculDetails.montantOriginal)}</p>
                          <p><strong>Économies totales:</strong> 
                            <span className="text-success font-bold ml-2 text-lg">
                              -{formatPrice(commande.calculDetails.economiesTotal)}
                            </span>
                          </p>
                        </div>
                      )}
                      
                      {commande.calculDetails.economiesProduits > 0 && (
                        <p><strong>Réductions produits:</strong> 
                          <span className="text-success ml-2">
                            -{formatPrice(commande.calculDetails.economiesProduits)}
                          </span>
                        </p>
                      )}
                      
                      {commande.calculDetails.economiesCodePromo > 0 && (
                        <p><strong>Code promo:</strong> 
                          <span className="text-success ml-2">
                            -{formatPrice(commande.calculDetails.economiesCodePromo)}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                  
                  {commande.codePromoGlobal && (
                    <div className="badge badge-success badge-sm">
                      Code: {commande.codePromoGlobal}
                    </div>
                  )}
                  
                  {commande.promotionGlobale && (
                    <div className="mt-2 p-2 bg-success/20 rounded">
                      <p className="font-bold text-xs">{commande.promotionGlobale.nom}</p>
                      <p className="text-xs opacity-70">{commande.promotionGlobale.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items - Responsive Table */}
        <div className="mt-6">
          <h4 className="font-bold text-lg mb-4">Articles Commandés</h4>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Quantité</th>
                  <th>Sous-total</th>
                  <th>Promotion</th>
                </tr>
              </thead>
              <tbody>
                {commande.lignesCommandes?.map((ligne, index) => (
                  <tr key={index} className={ligne.reductionUnitaire && ligne.reductionUnitaire > 0 ? 'bg-success/5' : ''}>
                   <td>
        <div className="flex items-center gap-3">
          {ligne.produit?.images && ligne.produit.images.length > 0 && (
            <div className="avatar">
              <div className="mask mask-squircle w-12 h-12">
                <img 
                  src={`${ligne.produit.images[0].url}`} 
                  alt={ligne.produit.nom} 
                />
              </div>
            </div>
          )}
          <div>
            <div className="font-bold text-sm">{ligne.produit?.nom || 'N/A'}</div>
            <div className="text-xs text-gray-500 italic">{formatVariation(ligne)}</div>
          </div>
        </div>
      </td>
                    <td>
                      <div>
                        <div className="font-bold">{formatPrice(ligne.prixUnitaireFinal || ligne.prixUnitaire)}</div>
                        {ligne.prixUnitaireOriginal && ligne.prixUnitaireOriginal !== (ligne.prixUnitaireFinal || ligne.prixUnitaire) && (
                          <div className="text-xs">
                            <span className="line-through text-gray-500">
                              {formatPrice(ligne.prixUnitaireOriginal)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center font-bold">{ligne.quantite}</td>
                    <td>
                      <div className="font-bold">{formatPrice(ligne.sousTotal)}</div>
                      {typeof ligne.reductionUnitaire === 'number' && ligne.reductionUnitaire > 0 && (
                        <div className="text-xs text-success">
                          Économie: -{formatPrice(ligne.reductionUnitaire * ligne.quantite)}
                        </div>
                      )}
                    </td>
                    <td>
                      {ligne.promotionAppliquee ? (
                        <div className="space-y-1">
                          <div className={`badge ${getPromotionBadge(ligne.promotionAppliquee.typePromotion)} badge-sm`}>
                            {ligne.promotionAppliquee.nom}
                          </div>
                          <div className="text-xs opacity-70">
                            {ligne.promotionAppliquee.description}
                          </div>
                        </div>
                      ) : ligne.reductionUnitaire && ligne.reductionUnitaire > 0 ? (
                        <div className="badge badge-success badge-sm">
                          Promotion appliquée
                        </div>
                      ) : (
                        <span className="text-xs opacity-50">Aucune</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {commande.lignesCommandes?.map((ligne, index) => (
              <div key={index} className={`card bg-base-200 ${ligne.reductionUnitaire && ligne.reductionUnitaire > 0 ? 'border border-success/30' : ''}`}>
                <div className="card-body p-4">
                  <div className="flex gap-3">
                    {ligne.produit?.images && ligne.produit.images.length > 0 && (
                      <div className="avatar flex-shrink-0">
                        <div className="mask mask-squircle w-16 h-16">
                          <img 
                            src={`${ligne.produit.images[0].url}`} 
                            alt={ligne.produit.nom} 
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                     <div className="font-bold text-sm mb-2">{ligne.produit?.nom || 'N/A'}</div>
                      <div className="text-xs text-gray-500 italic">{formatVariation(ligne)}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="opacity-70">Prix: </span>
                          <span className="font-bold">{formatPrice(ligne.prixUnitaireFinal || ligne.prixUnitaire)}</span>
                          {ligne.prixUnitaireOriginal && ligne.prixUnitaireOriginal !== (ligne.prixUnitaireFinal || ligne.prixUnitaire) && (
                            <div className="line-through text-gray-500">
                              {formatPrice(ligne.prixUnitaireOriginal)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="opacity-70">Qté: </span>
                          <span className="font-bold">{ligne.quantite}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="opacity-70">Sous-total: </span>
                          <span className="font-bold text-primary">{formatPrice(ligne.sousTotal)}</span>
                          {typeof ligne.reductionUnitaire === 'number' && ligne.reductionUnitaire > 0 && (
                            <div className="text-success mt-1">
                              Économie: -{formatPrice(ligne.reductionUnitaire * ligne.quantite)}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Promotions sur mobile */}
                      {ligne.promotionAppliquee && (
                        <div className="mt-2">
                          <div className={`badge ${getPromotionBadge(ligne.promotionAppliquee.typePromotion)} badge-sm`}>
                            {ligne.promotionAppliquee.nom}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif des montants - Responsive */}
        {commande.calculDetails && (
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-base-200 p-4 rounded-lg">
                <h5 className="font-bold mb-3 text-center lg:text-left">Récapitulatif</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total produits:</span>
                    <span>{formatPrice(commande.calculDetails.montantFinal)}</span>
                  </div>
                  
                  {commande.calculDetails.economiesProduits > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Réductions produits:</span>
                      <span>-{formatPrice(commande.calculDetails.economiesProduits)}</span>
                    </div>
                  )}
                  
                  {commande.calculDetails.economiesCodePromo > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Code promo:</span>
                      <span>-{formatPrice(commande.calculDetails.economiesCodePromo)}</span>
                    </div>
                  )}
                  
                  {commande.calculDetails.fraisLivraison > 0 && (
                    <div className="flex justify-between">
                      <span>Frais de livraison:</span>
                      <span>{formatPrice(commande.calculDetails.fraisLivraison)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(commande.calculDetails.montantTotal)}</span>
                  </div>
                  
                  {commande.calculDetails.economiesTotal > 0 && (
                    <div className="flex justify-between text-success font-bold text-center p-2 bg-success/20 rounded">
                      <span>Vous avez économisé:</span>
                      <span>{formatPrice(commande.calculDetails.economiesTotal)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="modal-action flex-col sm:flex-row gap-2">
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => {
              onEdit(commande);
              onClose();
            }}
          >
            Modifier cette commande
          </button>
          <button 
            className="btn w-full sm:w-auto" 
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandeDetailsModal;
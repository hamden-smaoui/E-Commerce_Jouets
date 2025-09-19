import React from 'react';
import FacturesService, { FactureResponse } from '@/services/facture-service';
interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  facture: FactureResponse | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, title, facture }) => {
  if (!isOpen || !facture) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <div className="modal-header flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Informations de la Facture</h3>
            <p><strong>Numéro:</strong> {FacturesService.formatFactureNumber(facture.numeroFacture)}</p>
            <p><strong>Date:</strong> {FacturesService.formatDate(facture.dateFacture)}</p>
            <p><strong>Date d'échéance:</strong> {facture.dateEcheance ? FacturesService.formatDate(facture.dateEcheance) : 'N/A'}</p>
            <p><strong>Statut:</strong> <span style={{ color: FacturesService.getStatusColor(facture.statut) }}>{FacturesService.getStatusLabel(facture.statut)}</span></p>
            <p><strong>Montant HT:</strong> {FacturesService.formatAmount(facture.montantHT)}</p>
            <p><strong>TVA ({facture.tauxTVA}%):</strong> {FacturesService.formatAmount(facture.montantTVA)}</p>
            <p><strong>Montant Total:</strong> {FacturesService.formatAmount(facture.montantTotal)}</p>
            <p><strong>Notes:</strong> {facture.notes || 'Aucun'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Client</h3>
            <p><strong>Nom:</strong> {facture.clientNom}</p>
            <p><strong>Email:</strong> {facture.clientEmail || 'N/A'}</p>
            <p><strong>Téléphone:</strong> {facture.clientTelephone || 'N/A'}</p>
            <p><strong>Adresse:</strong> {facture.clientAdresse || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Entreprise</h3>
            <p><strong>Nom:</strong> {facture.entrepriseNom}</p>
            <p><strong>Adresse:</strong> {facture.entrepriseAdresse || 'N/A'}</p>
            <p><strong>Téléphone:</strong> {facture.entrepriseTelephone || 'N/A'}</p>
            <p><strong>Email:</strong> {facture.entrepriseEmail || 'N/A'}</p>
            <p><strong>SIRET:</strong> {facture.entrepriseSiret || 'N/A'}</p>
          </div>
          {facture.commande && (
            <div>
              <h3 className="text-lg font-semibold">Détails de la Commande</h3>
              <p><strong>ID Commande:</strong> {facture.commande.idCommande}</p>
              <p><strong>Date Commande:</strong> {FacturesService.formatDate(facture.commande.dateCommande)}</p>
              <p><strong>Montant Total:</strong> {FacturesService.formatAmount(facture.commande.montantTotal)}</p>
              {facture.commande.client && (
                <div>
                  <h4 className="text-md font-semibold mt-2">Client de la Commande</h4>
                  <p><strong>Nom:</strong> {facture.commande.client.prenom} {facture.commande.client.nom}</p>
                  <p><strong>Email:</strong> {facture.commande.client.email}</p>
                  <p><strong>Téléphone:</strong> {facture.commande.client.telephone}</p>
                </div>
              )}
              {facture.commande.lignesCommandes && facture.commande.lignesCommandes.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mt-2">Lignes de Commande</h4>
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facture.commande.lignesCommandes.map((ligne) => (
                        <tr key={ligne.idLigneCommande}>
                          <td>
                            <div className="font-bold">{ligne.produit.nom}</div>
                            <div className="text-sm opacity-50">{ligne.produit.description}</div>
                          </td>
                          <td>{ligne.quantite}</td>
                          <td>{FacturesService.formatAmount(ligne.prixUnitaireFinal)}</td>
                          <td>{FacturesService.formatAmount(ligne.sousTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </dialog>
  );
};
export default ViewModal;
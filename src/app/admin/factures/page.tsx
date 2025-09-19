'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import FactureStatsCards from '@/components/layout/FactureStatsCards';
import FactureViewModal from '@/components/layout/FacturesViewModal';
import FacturesService, { FactureResponse, FactureFormData, FactureStats } from '@/services/facture-service';

interface FormData {
  idFacture?: number;
  numeroFacture?: string;
  idCommande: number;
  dateFacture: string;
  dateEcheance?: string;
  montantHT: number;
  montantTVA: number;
  montantTotal: number;
  tauxTVA: number;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'en_retard' | 'annulée';
  clientNom: string;
  clientEmail?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  entrepriseNom: string;
  entrepriseAdresse?: string;
  entrepriseTelephone?: string;
  entrepriseEmail?: string;
  entrepriseSiret?: string;
  notes?: string;
}

interface Field<T> {
  name: keyof T;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
  hint?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    title?: string;
    validate?: (value: any, allData: any) => string;
    step?: number;
  };
  render?: (props: { value: any; onChange: (value: any) => void }) => React.ReactElement;
  hidden?: boolean;
  disabled?: boolean;
}

const Factures: React.FC = () => {
  const [factures, setFactures] = useState<FactureResponse[]>([]);
  const [stats, setStats] = useState<FactureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<FactureResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    numeroFacture: '',
    idCommande: 0,
    dateFacture: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    montantHT: 0,
    montantTVA: 0,
    montantTotal: 0,
    tauxTVA: 19,
    statut: 'brouillon',
    clientNom: '',
    clientEmail: '',
    clientTelephone: '',
    clientAdresse: '',
    entrepriseNom: 'Jouets Paradise',
    entrepriseAdresse: '',
    entrepriseTelephone: '',
    entrepriseEmail: '',
    entrepriseSiret: '',
    notes: '',
  });
  const [selectedFactures, setSelectedFactures] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedFactures, fetchedStats] = await Promise.all([
        FacturesService.getAllFactures(),
        FacturesService.getFactureStats(),
      ]);
      setFactures(fetchedFactures);
      setStats(fetchedStats);
      setLoading(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(message);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFactures = factures.filter((facture) => {
    const matchesSearch =
      facture &&
      ((facture.numeroFacture && facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (facture.clientNom && facture.clientNom.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (facture.clientEmail && facture.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || facture.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const customSelectStyles = {
    menu: (provided: any) => ({
      ...provided,
      maxHeight: '150px',
      overflowY: 'auto',
      zIndex: 10000,
    }),
    control: (provided: any) => ({
      ...provided,
      minHeight: '40px',
      borderRadius: '4px',
    }),
  };

  const columns = [
    {
      header: 'Numéro',
      render: (item: FactureResponse) => (
        <div className="font-mono text-sm">
          {FacturesService.formatFactureNumber(item.numeroFacture)}
        </div>
      ),
    },
    {
      header: 'Date',
      render: (item: FactureResponse) => FacturesService.formatDate(item.dateFacture),
    },
    {
      header: 'Client',
      render: (item: FactureResponse) => (
        <div>
          <div className="font-bold">{item.clientNom}</div>
          <div className="text-sm opacity-50">{item.clientEmail || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Montant',
      render: (item: FactureResponse) => (
        <div className="text-right">
          <div className="font-bold">{FacturesService.formatAmount(item.montantTotal)}</div>
          <div className="text-sm opacity-50">HT: {FacturesService.formatAmount(item.montantHT)}</div>
        </div>
      ),
    },
    {
      header: 'Statut',
      render: (item: FactureResponse) => (
        <span
          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
          style={{ backgroundColor: FacturesService.getStatusColor(item.statut) }}
        >
          {FacturesService.getStatusLabel(item.statut)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (item: FactureResponse) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-info btn-outline"
            onClick={() => handleView(item)}
            title="Consulter"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            className="btn btn-sm btn-success btn-outline"
            onClick={() => handleDownloadPDF(item.idFacture, item.numeroFacture)}
            title="Télécharger PDF"
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
          </button>
        </div>
      ),
    },
  ];
  // Updated factureFields to include enterprise fields for editing
  const factureFields: Field<FormData>[] = [
    {
      name: 'idCommande',
      label: 'ID Commande',
      type: 'number',
      placeholder: 'ID de la commande',
      validation: {
        required: true,
        min: 1,
        title: 'ID de commande requis',
      },
    },
    {
      name: 'dateFacture',
      label: 'Date de facture',
      type: 'date',
      validation: {
        required: true,
        title: 'Date de facture requise',
      },
    },
    {
      name: 'dateEcheance',
      label: "Date d'échéance",
      type: 'date',
      validation: {
        required: false,
        title: "Date d'échéance optionnelle",
      },
    },
    {
      name: 'clientNom',
      label: 'Nom du client',
      type: 'text',
      placeholder: 'Nom complet du client',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 100,
        title: 'Nom du client requis',
      },
    },
    {
      name: 'clientEmail',
      label: 'Email du client',
      type: 'email',
      placeholder: 'client@example.com',
      validation: {
        required: false,
        pattern: '^[^@]+@[^@]+\\.[^@]+$',
        title: 'Format email valide requis',
      },
    },
    {
      name: 'clientTelephone',
      label: 'Téléphone du client',
      type: 'tel',
      placeholder: '+216 XX XXX XXX',
      validation: {
        required: false,
        minLength: 8,
        maxLength: 20,
        title: 'Numéro de téléphone valide',
      },
    },
    {
      name: 'clientAdresse',
      label: 'Adresse du client',
      type: 'textarea',
      placeholder: 'Adresse complète du client',
      validation: {
        required: false,
        maxLength: 500,
        title: 'Adresse du client',
      },
    },
    {
      name: 'entrepriseNom',
      label: 'Nom de l\'entreprise',
      type: 'text',
      placeholder: 'Nom de votre entreprise',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 100,
        title: 'Nom de l\'entreprise requis',
      },
    },
    {
      name: 'entrepriseAdresse',
      label: 'Adresse de l\'entreprise',
      type: 'textarea',
      placeholder: 'Adresse complète de l\'entreprise',
      validation: {
        required: false,
        maxLength: 500,
        title: 'Adresse de l\'entreprise',
      },
    },
    {
      name: 'entrepriseTelephone',
      label: 'Téléphone de l\'entreprise',
      type: 'tel',
      placeholder: '+216 XX XXX XXX',
      validation: {
        required: false,
        minLength: 8,
        maxLength: 20,
        title: 'Numéro de téléphone valide',
      },
    },
    {
      name: 'entrepriseEmail',
      label: 'Email de l\'entreprise',
      type: 'email',
      placeholder: 'contact@example.com',
      validation: {
        required: false,
        pattern: '^[^@]+@[^@]+\\.[^@]+$',
        title: 'Format email valide requis',
      },
    },
    {
      name: 'entrepriseSiret',
      label: 'SIRET/Matricule fiscal',
      type: 'text',
      placeholder: 'Votre SIRET ou matricule fiscal',
      validation: {
        required: false,
        maxLength: 50,
        title: 'SIRET optionnel',
      },
    },
    {
      name: 'montantHT',
      label: 'Montant HT (TND)',
      type: 'number',
      placeholder: '0.00',
      validation: {
        required: true,
        min: 0,
        step: 0.01,
        title: 'Montant HT requis',
      },
    },
    {
      name: 'tauxTVA',
      label: 'Taux TVA (%)',
      type: 'number',
      placeholder: '19',
      validation: {
        required: true,
        min: 0,
        max: 100,
        title: 'Taux TVA requis',
      },
    },
    {
      name: 'statut',
      label: 'Statut',
      type: 'custom',
      render: ({ value, onChange }) => (
        <Select
          options={[
            { value: 'brouillon', label: 'Brouillon' },
            { value: 'envoyée', label: 'Envoyée' },
            { value: 'payée', label: 'Payée' },
            { value: 'en_retard', label: 'En retard' },
            { value: 'annulée', label: 'Annulée' },
          ]}
          value={{
            value: value,
            label: FacturesService.getStatusLabel(value),
          }}
          onChange={(selectedOption) => {
            const newValue = selectedOption ? selectedOption.value : 'brouillon';
            setFormData((prev) => ({
              ...prev,
              statut: newValue as any,
            }));
            onChange(newValue);
          }}
          className="w-full"
          styles={customSelectStyles}
        />
      ),
      validation: {
        required: true,
        title: 'Statut requis',
      },
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Notes additionnelles...',
      validation: {
        required: false,
        maxLength: 1000,
        title: 'Notes optionnelles',
      },
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      const montantTVA = (data.montantHT * data.tauxTVA) / 100;
      const montantTotal = data.montantHT + montantTVA;

      const factureData: FactureFormData = {
        ...data,
        montantTVA,
        montantTotal,
      };

      const newFacture = await FacturesService.createFacture(factureData);
      setFactures([newFacture, ...factures]);
      setIsAddModalOpen(false);
      await fetchData();
      setNotification({
        type: 'success',
        message: 'Facture créée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors de la création: ${message}`,
      });
    }
  };

 
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedFactures) {
        await FacturesService.deleteFacture(id);
      }
      setFactures(factures.filter((f) => !selectedFactures.includes(f.idFacture)));
      setSelectedFactures([]);
      setIsDeleteModalOpen(false);
      await fetchData();
      setNotification({
        type: 'success',
        message: 'Facture(s) supprimée(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors de la suppression: ${message}`,
      });
    }
  };

  const handleView = async (facture: FactureResponse) => {
    try {
      const fullFacture = await FacturesService.getFactureById(facture.idFacture);
      setSelectedFacture(fullFacture);
      setIsViewModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement: ${message}`,
      });
    }
  };

  const handleDownloadPDF = async (id: number, numeroFacture: string) => {
    try {
      const blob = await FacturesService.downloadFacturePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Facture-${numeroFacture}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({
        type: 'success',
        message: 'PDF téléchargé avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du téléchargement: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedFactures([...selectedFactures, id]);
    } else {
      setSelectedFactures(selectedFactures.filter((factureId) => factureId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFactures(filteredFactures.map((facture) => facture.idFacture));
    } else {
      setSelectedFactures([]);
    }
  };

  const handleAdd = () => {
    const newFormData: FormData = {
      numeroFacture: '',
      idCommande: 0,
      dateFacture: new Date().toISOString().split('T')[0],
      dateEcheance: '',
      montantHT: 0,
      montantTVA: 0,
      montantTotal: 0,
      tauxTVA: 19,
      statut: 'brouillon',
      clientNom: '',
      clientEmail: '',
      clientTelephone: '',
      clientAdresse: '',
      entrepriseNom: 'Jouets Paradise',
      entrepriseAdresse: '',
      entrepriseTelephone: '',
      entrepriseEmail: '',
      entrepriseSiret: '',
      notes: '',
    };
    setFormData(newFormData);
    setIsAddModalOpen(true);
  };

 const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idFacture) return;

      // Parse numbers to ensure they're not strings from form
      const parsedMontantHT = parseFloat(data.montantHT.toString()) || 0;
      const parsedTauxTVA = parseFloat(data.tauxTVA.toString()) || 19;
      const montantTVA = (parsedMontantHT * parsedTauxTVA) / 100;
      const parsedMontantTotal = parseFloat((parsedMontantHT + montantTVA).toFixed(2)) || 0;

      // Format dates to ISO for backend
      const isoDateFacture = new Date(data.dateFacture).toISOString();
      const isoDateEcheance = data.dateEcheance ? new Date(data.dateEcheance).toISOString() : null;

      // Prepare update data (exclude idFacture and numeroFacture for partial update)
      const updatePayload: Partial<FactureFormData> = {
        idCommande: parseInt(data.idCommande.toString()) || 0, // Ensure number
        dateFacture: isoDateFacture,
        dateEcheance: isoDateEcheance || undefined,
        montantHT: parsedMontantHT,
        montantTVA: parseFloat(montantTVA.toFixed(2)),
        montantTotal: parsedMontantTotal,
        tauxTVA: parsedTauxTVA,
        statut: data.statut,
        clientNom: data.clientNom || '',
        clientEmail: data.clientEmail || '',
        clientTelephone: data.clientTelephone || '',
        clientAdresse: data.clientAdresse || '',
        entrepriseNom: data.entrepriseNom || 'Jouets Paradise',
        entrepriseAdresse: data.entrepriseAdresse || '',
        entrepriseTelephone: data.entrepriseTelephone || '',
        entrepriseEmail: data.entrepriseEmail || '',
        entrepriseSiret: data.entrepriseSiret || '',
        notes: data.notes || '',
      };

      console.log('Sending update payload to service:', updatePayload); // Log the exact payload

      const updatedFacture = await FacturesService.updateFacture(data.idFacture, updatePayload);
      setFactures(factures.map((f) => (f.idFacture === data.idFacture ? updatedFacture : f)));
      setIsEditModalOpen(false);
      await fetchData();
      setNotification({
        type: 'success',
        message: 'Facture modifiée avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Edit error details:', error); // Log full error for debugging
      setNotification({
        type: 'error',
        message: `Erreur lors de la modification: ${message}`,
      });
    }
  };

  // Updated handleEdit to set enterprise fields properly
  const handleEdit = (facture: FactureResponse) => {
    const editFormData: FormData = {
      idFacture: facture.idFacture,
      numeroFacture: facture.numeroFacture,
      idCommande: facture.idCommande,
      dateFacture: facture.dateFacture.split('T')[0],
      dateEcheance: facture.dateEcheance ? facture.dateEcheance.split('T')[0] : '',
      montantHT: parseFloat(facture.montantHT.toString()) || 0, // Ensure number
      montantTVA: parseFloat(facture.montantTVA.toString()) || 0,
      montantTotal: parseFloat(facture.montantTotal.toString()) || 0,
      tauxTVA: parseFloat(facture.tauxTVA.toString()) || 19,
      statut: facture.statut,
      clientNom: facture.clientNom,
      clientEmail: facture.clientEmail || '',
      clientTelephone: facture.clientTelephone || '',
      clientAdresse: facture.clientAdresse || '',
      entrepriseNom: facture.entrepriseNom || 'Jouets Paradise',
      entrepriseAdresse: facture.entrepriseAdresse || '',
      entrepriseTelephone: facture.entrepriseTelephone || '',
      entrepriseEmail: facture.entrepriseEmail || '',
      entrepriseSiret: facture.entrepriseSiret || '',
      notes: facture.notes || '',
    };
    setFormData(editFormData);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-error">{error}</div>;
  }

  return (
    <div className="p-6 w-full h-screen flex  flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />

      {/* Stats Cards */}
      {stats && <FactureStatsCards stats={stats} loading={loading} />}

      

      <HeaderCardComponent
        title="Gestion des Factures"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedFactures}
        onEdit={() => {
          const facture = factures.find((f) => f.idFacture === selectedFactures[0]);
          if (facture) handleEdit(facture);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
  <div className="flex-1 min-h-[50vh] sm:min-h-[60vh] overflow-auto">

      <TableComponent
        data={filteredFactures}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedFactures}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedFactures([id]);
          handleDelete();
        }}
        idField="idFacture"
      />
</div>
      {/* Modals */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedFactures.length}
        entityName="facture(s)"
      />

      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer une Nouvelle Facture"
        fields={factureFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Créer"
      />

       <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier la Facture"
        fields={factureFields.map((field) =>
          field.name === 'numeroFacture' ? { ...field, disabled: true } : field
        )}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
      <FactureViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        facture={selectedFacture}
        onEdit={handleEdit}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default Factures;
'use client';

import React, { useEffect, useState } from 'react';
import NewsletterService, { NewsletterEntry, NewsletterFormData } from '@/services/newsletter-service';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import Notification from '@/components/layout/Notification';
import FormModal from '@/components/layout/FormModal';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import { useSession } from "next-auth/react";

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

const newsletterFields: Field<NewsletterFormData>[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Adresse email',
    validation: {
      required: true,
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      title: 'Adresse email valide requise',
    }
  }
];

const NewsletterAdmin: React.FC = () => {
  const [entries, setEntries] = useState<NewsletterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewsletterFormData>({ email: '' });
  const { data: session, status } = useSession();
  const token = session?.customToken;
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const data = await NewsletterService.getAllEntries(token);
        setEntries(data);
      } catch (error: any) {
        setNotification({ type: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filtered = entries.filter(entry =>
    entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selected) {
        const entry = entries.find(e => e.idNewsletter === id);
        if (entry) await NewsletterService.unsubscribe(entry.email,token);
      }
      setEntries(entries.filter(e => !selected.includes(e.idNewsletter)));
      setSelected([]);
      setIsDeleteModalOpen(false);
      setNotification({ type: 'success', message: 'Suppression réussie.' });
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message });
    }
  };

  const handleAddSubmit = async (data: NewsletterFormData) => {
    try {
      const entry = await NewsletterService.subscribe({ email: data.email });
      setEntries([...entries, entry]);
      setIsAddModalOpen(false);
      setFormData({ email: '' });
      setNotification({ type: 'success', message: 'Ajouté avec succès !' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    }
  };

  const columns = [
    { header: 'Email', render: (item: NewsletterEntry) => <span>{item.email}</span> },
    { header: 'Date inscription', render: (item: NewsletterEntry) => <span>{new Date(item.dateInscription).toLocaleString('fr-FR')}</span> },
  ];

  return (
    <div className="p-6 w-full min-h-[80vh] flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      
      <HeaderCardComponent
        title="Inscriptions Newsletter"
        searchTerm={searchTerm}
        onSearchChange={e => setSearchTerm(e.target.value)}
        selectedItems={selected}
        onDelete={handleDelete}
        onAdd={() => setIsAddModalOpen(true)}
      />
      
      <TableComponent
        data={filtered}
        columns={columns}
        loading={loading}
        error={notification?.type === 'error' ? notification.message : null}
        selectedItems={selected}
        handleCheckboxChange={(e, id) => {
          if (e.target.checked) setSelected([...selected, id]);
          else setSelected(selected.filter(x => x !== id));
        }}
        handleSelectAll={e => {
          if (e.target.checked) setSelected(filtered.map(e => e.idNewsletter));
          else setSelected([]);
        }}
        onEdit={() => {}}
        onDelete={(id) => {
          setSelected([id]);
          handleDelete();
        }}
        idField="idNewsletter"
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selected.length}
        entityName="inscription(s)"
      />

      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une inscription Newsletter"
        fields={newsletterFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
    </div>
  );
};

export default NewsletterAdmin;
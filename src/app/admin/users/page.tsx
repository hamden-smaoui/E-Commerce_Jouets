'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import TableComponent from '@/components/layout/TableComponent';
import HeaderCardComponent from '@/components/layout/HeaderCardComponent';
import FormModal from '@/components/layout/FormModal';
import Notification from '@/components/layout/Notification';
import ConfirmDeleteModal from '@/components/layout/ConfirmDeleteModal';
import UsersService from '@/services/users-service';

// Define TypeScript interface for Commande (Order) from the backend
interface Commande {
  idCommande: number;
  dateCommande: string;
  statut: string;
}

// Define TypeScript interface matching the Sequelize Utilisateur model
interface User {
  idUtilisateur: number;
  prenom: string;
  nom: string;
  email: string | null;
  motDePasse?: string;
  telephone: string;
  adresseRue: string | null;
  adresseVille: string | null;
  adresseCodePostal: string | null;
  adressePays: string | null;
  role: 'admin' | 'client';
  commandes?: Commande[];
}

// Define FormData interface for form handling
interface FormData {
  idUtilisateur: number | null;
  prenom: string;
  nom: string;
  email: string | null;
  motDePasse?: string;
  telephone: string;
  adresseRue: string | null;
  adresseVille: string | null;
  adresseCodePostal: string | null;
  adressePays: string | null;
  role: 'admin' | 'client' | null;
}

// Define Field interface for FormModal
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

// Users component
const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idUtilisateur: null,
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    adresseRue: '',
    adresseVille: '',
    adresseCodePostal: '',
    adressePays: 'Tunisie',
    role: null,
  });
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await UsersService.getAllUsers();
        setUsers(fetchedUsers);
        setLoading(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user &&
      ((user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.prenom && user.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const columns = [
    {
      header: "Nom de l'utilisateur",
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold">{item.nom || 'N/A'} {item.prenom || ''}</div>
            <div className="text-sm opacity-50">{item.email || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Rôle',
      render: (item: User) => (item.role === 'admin' ? 'Administrateur' : 'Client'),
    },
    {
      header: 'Téléphone',
      render: (item: User) => item.telephone || 'N/A',
    },
    {
      header: 'Adresse',
      render: (item: User) =>
        `${item.adresseRue || ''}, ${item.adresseVille || ''}, ${item.adresseCodePostal || ''}, ${item.adressePays || ''}`
          .trim()
          .replace(/^,+|,+$/g, '') || 'N/A',
    },
    {
      header: 'Commandes',
      render: (item: User) => (item.commandes ? item.commandes.length : 0),
    },
  ];

  const userFields: Field<FormData>[] = [
    {
      name: 'prenom',
      label: 'Prénom',
      type: 'text',
      placeholder: 'Prénom',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '[A-Za-z\\s]*',
        title: 'Seules les lettres et les espaces sont autorisés',
      },
      hint: '2-50 caractères, lettres et espaces',
    },
    {
      name: 'nom',
      label: 'Nom',
      type: 'text',
      placeholder: 'Nom',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: '[A-Za-z\\s]*',
        title: 'Seules les lettres et les espaces sont autorisés',
      },
      hint: '2-50 caractères, lettres et espaces',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Email',
      validation: {
        required: false,
        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
        title: 'Entrez une adresse email valide',
      },
      hint: 'Adresse email valide (optionnel)',
    },
    {
      name: 'motDePasse',
      label: 'Mot de passe',
      type: 'password',
      placeholder: 'Mot de passe',
      validation: {
        required: false,
        minLength: 6,
        title: 'Minimum 6 caractères',
      },
      hint: 'Minimum 6 caractères (optionnel pour modification)',
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'tel',
      placeholder: 'Téléphone',
      validation: {
        required: true,
        pattern: '[0-9]{8}',
        title: 'Numéro de téléphone tunisien à 8 chiffres',
      },
      hint: 'Numéro à 8 chiffres',
    },
    {
      name: 'adresseRue',
      label: 'Rue',
      type: 'text',
      placeholder: 'Rue',
      validation: {
        required: false,
        minLength: 2,
        maxLength: 100,
        title: 'Entrez une adresse valide',
      },
      hint: '2-100 caractères (optionnel)',
    },
    {
      name: 'adresseVille',
      label: 'Ville',
      type: 'text',
      placeholder: 'Ville',
      validation: {
        required: false,
        minLength: 2,
        maxLength: 50,
        title: 'Entrez une ville valide',
      },
      hint: '2-50 caractères (optionnel)',
    },
    {
      name: 'adresseCodePostal',
      label: 'Code Postal',
      type: 'text',
      placeholder: 'Code Postal',
      validation: {
        required: false,
        pattern: '[0-9]{4}',
        title: 'Code postal à 4 chiffres',
      },
      hint: 'Code postal à 4 chiffres (optionnel)',
    },
    {
      name: 'adressePays',
      label: 'Pays',
      type: 'text',
      placeholder: 'Pays',
      validation: {
        required: false,
        title: 'Entrez un pays valide',
      },
      hint: 'Pays (par défaut: Tunisie)',
    },
    {
      name: 'role',
      label: 'Rôle',
      type: 'custom',
      render: ({ value, onChange }) => (
        <div>
          <Select
            options={[
              { value: 'admin', label: 'Administrateur' },
              { value: 'client', label: 'Client' },
            ]}
            value={
              value.role
                ? { value: value.role, label: value.role === 'admin' ? 'Administrateur' : 'Client' }
                : null
            }
            onChange={(selectedOption) =>
              onChange({ role: selectedOption ? selectedOption.value as 'admin' | 'client' : null })
            }
            placeholder="Sélectionnez un rôle"
            className="w-full"
            isClearable
          />
        </div>
      ),
      validation: { required: true, title: 'Sélectionnez un rôle' },
      hint: "Choisissez un rôle pour l'utilisateur",
    },
  ];

  const handleAddSubmit = async (data: FormData) => {
    try {
      // Omit motDePasse if empty
      const payload = { ...data };
      if (!payload.motDePasse) {
        delete payload.motDePasse;
      }
      const newUser = await UsersService.createUser(payload);
      setUsers([...users, newUser]);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Utilisateur ajouté avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de l'ajout de l'utilisateur: ${message}`,
      });
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    try {
      if (!data.idUtilisateur) {
        setNotification({
          type: 'error',
          message: 'Aucun utilisateur sélectionné pour modification.',
        });
        return;
      }
      // Omit motDePasse if empty
      const payload = { ...data };
      if (!payload.motDePasse) {
        delete payload.motDePasse;
      }
      const updatedUser = await UsersService.updateUser(data.idUtilisateur, payload);
      setUsers(users.map((user) => (user.idUtilisateur === data.idUtilisateur ? updatedUser : user)));
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Utilisateur modifié avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la modification de l'utilisateur: ${message}`,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedUsers) {
        await UsersService.deleteUser(id);
      }
      setUsers(users.filter((user) => !selectedUsers.includes(user.idUtilisateur)));
      setSelectedUsers([]);
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Utilisateur(s) supprimé(s) avec succès !',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur ! Échec de la suppression de l'utilisateur: ${message}`,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user.idUtilisateur));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleAdd = () => {
    setFormData({
      idUtilisateur: null,
      prenom: '',
      nom: '',
      email: '',
      motDePasse: '',
      telephone: '',
      adresseRue: '',
      adresseVille: '',
      adresseCodePostal: '',
      adressePays: 'Tunisie',
      role: null,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = async (user: User) => {
    try {
      const fetchedUser = await UsersService.getUserById(user.idUtilisateur);
      setFormData({
        idUtilisateur: fetchedUser.idUtilisateur,
        prenom: fetchedUser.prenom || '',
        nom: fetchedUser.nom || '',
        email: fetchedUser.email || '',
        motDePasse: '',
        telephone: fetchedUser.telephone || '',
        adresseRue: fetchedUser.adresseRue || '',
        adresseVille: fetchedUser.adresseVille || '',
        adresseCodePostal: fetchedUser.adresseCodePostal || '',
        adressePays: fetchedUser.adressePays || 'Tunisie',
        role: fetchedUser.role,
      });
      setIsEditModalOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setNotification({
        type: 'error',
        message: `Erreur lors du chargement des données de l'utilisateur: ${message}`,
      });
    }
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
    <div className="p-6 w-full h-screen flex flex-col relative">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <HeaderCardComponent
        title="Liste des Utilisateurs"
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        selectedItems={selectedUsers}
        onEdit={() => {
          const user = users.find((u) => u.idUtilisateur === selectedUsers[0]);
          if (user) handleEdit(user);
        }}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <TableComponent
        data={filteredUsers}
        columns={columns}
        loading={loading}
        error={error}
        selectedItems={selectedUsers}
        handleCheckboxChange={handleCheckboxChange}
        handleSelectAll={handleSelectAll}
        onEdit={handleEdit}
        onDelete={(id: number) => {
          setSelectedUsers([id]);
          handleDelete();
        }}
        idField="idUtilisateur"
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedUsers.length}
        entityName="utilisateur(s)"
      />
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un Nouvel Utilisateur"
        fields={userFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddSubmit}
        submitButtonText="Ajouter"
      />
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier un Utilisateur"
        fields={userFields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditSubmit}
        submitButtonText="Modifier"
      />
    </div>
  );
};

export default Users;
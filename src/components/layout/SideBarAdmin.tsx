'use client';

import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Package, Truck, ShoppingCart, MessageSquare, Tag, Building, Folder, Shield, Percent, Ticket } from 'lucide-react';

interface SideBarProps {
  children: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = ({ children }) => {
  const { url } = useParams();
  const pathname = usePathname();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content items-center">
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <li>
            <Link
              href={`/admin/dashboard`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/dashboard'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Home size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/storeInfo`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/storeInfo'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Building size={20} />
              Informations
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/users`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/users'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Users size={20} />
              Utilisateurs
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/categories`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/categories'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Folder size={20} />
              Categories
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/types`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/types'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Tag size={20} />
              Types
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/marques`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/marques'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Shield size={20} />
              Marques
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/produits`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/produits'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Package size={20} />
              Produits
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/fournisseurs`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/fournisseurs'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Truck size={20} />
              Fournisseurs
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/commandes`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/commandes'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <ShoppingCart size={20} />
              Commandes
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/reclamations`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/reclamations'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <MessageSquare size={20} />
              Réclamations
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/promotions`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/promotions'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Percent size={20} />
              Promotions
            </Link>
          </li>
          <li>
            <Link
              href={`/admin/codes-promo`}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                pathname === '/admin/codes-promo'
                  ? 'text-blue-600 font-bold border-blue-600 border-b-2'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Ticket size={20} />
              Codes Promo
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
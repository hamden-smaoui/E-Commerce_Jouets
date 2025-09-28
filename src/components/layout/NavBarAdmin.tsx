'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Home,
} from 'lucide-react';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { useStoreInfo } from '@/hooks/useStoreInfo';

const NavBarCentre: React.FC = () => {
  const router = useRouter();
  const { url } = useParams();
  const { data: session, status } = useSession();
  const user = session?.userData;
  const isAuthenticated = status === "authenticated";
  const { storeInfo } = useStoreInfo();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gestion du click en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsDropdownOpen(false);
    router.push(`/signIn`);
  };

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 md:px-6">
      <div className="navbar-start">
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
          <Menu size={24} />
        </label>
        <div className="navbar-start">
          <Link href="/site" className="flex items-center">
            {storeInfo?.logo1 ? (
              <div className="relative h-10 w-auto">
                <Image 
                  src={`http://localhost:3001${storeInfo.logo1}`}
                  alt={storeInfo.nom || "Logo"}
                  height={40}
                  width={120}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <img src="/images/logoBamby.png" alt="Logo" className="h-10 w-auto" />
            )}
          </Link>
        </div>
      </div>

      <div className="navbar-end flex items-center gap-2 md:gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            tabIndex={0}
            onClick={toggleDropdown}
            className="btn btn-ghost"
            title={isAuthenticated ? "Mon compte" : "Se connecter"}
          >
            <div className="flex items-center space-x-1">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              {isAuthenticated && user && (
                <span className="text-sm font-medium text-gray-700 hidden xl:block">
                  {user?.prenom} 
                </span>
              )}
            </div>
          </button>

          {isDropdownOpen && (
            <ul className="absolute right-0 mt-2 p-2 shadow-xl bg-white rounded-lg w-56 border border-gray-200 z-[1000]">
              {isAuthenticated && user ? (
                <>
                  <li className="px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link 
                      href={`/site/profile`} 
                      className="flex items-center py-2 hover:bg-purple-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserCircleIcon className="h-5 w-5 text-gray-500 mr-3" />
                      Mon profil
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/site/commandes`} 
                      className="flex items-center py-2 hover:bg-purple-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ShoppingCartIcon className="h-5 w-5 text-gray-500 mr-3" />
                      Mes commandes
                    </Link>
                  </li>
                  {user?.role === "admin" && (
                    <li>
                      <Link 
                        href={`/admin/dashboard`} 
                        className="flex items-center py-2 hover:bg-purple-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5 text-gray-500 mr-3" />
                        Administration
                      </Link>
                    </li>
                  )}
                  <li className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center py-2 w-full text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                      Se déconnecter
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href={`/signIn`} 
                      className="flex items-center py-2 hover:bg-purple-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 mr-3" />
                      Se connecter
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/signUp`} 
                      className="flex items-center py-2 hover:bg-purple-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 text-gray-500 mr-3" />
                      S'inscrire
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBarCentre;
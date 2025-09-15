"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import SearchInput from '../ui/SearchInput';

import {
  EnvelopeIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../hooks/useAuth";
import CartDropdown from "./CartDropdown";

interface User {
  prenom?: string;
  nom?: string;
  email?: string;
  role?: string;
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { storeInfo } = useStoreInfo();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { totalItems } = useCart();
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node) &&
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/site/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4 py-2">
      <div className="flex flex-col w-full md:flex-row md:items-center">
        {/* First Line: Logo and Icons on Mobile */}
        <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
         <Link href="/site" className="flex items-center">
            {storeInfo?.logo1 ? (
              <div className="relative h-8 w-auto sm:h-10">
                <Image 
                  src={`http://localhost:3001${storeInfo.logo1}`}
                  alt={storeInfo.nom || "Logo"}
                  height={40}
                  width={120}
                  className="h-8 w-auto sm:h-12 object-contain"
                  priority
                />
              </div>
            ) : (
              <img src="/images/logo.png" alt="Toy Universe Logo" className="h-8 w-auto sm:h-10" />
            )}
          </Link>
          <div className="flex space-x-2 md:hidden">
            <Link href="/site/contact" className="btn btn-ghost btn-circle btn-sm" title="Contact">
              <EnvelopeIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="indicator">
  <span className="indicator-item badge badge-primary badge-xs">
    {favorites.length}
  </span>
  <Link href="/site/favoris" className="btn btn-ghost btn-circle btn-sm" title="Favoris">
    <HeartIcon className="h-5 w-5 text-gray-600" />
  </Link>
</div>
            <CartDropdown />
            <div className="relative" ref={mobileDropdownRef}>
              <button
                tabIndex={0}
                onClick={toggleDropdown}
                className="btn btn-ghost btn-circle btn-sm"
                title={isAuthenticated ? "Mon compte" : "Se connecter"}
              >
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                
                </div>
              </button>
              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 p-2 shadow-xl bg-white rounded-lg w-56 border border-gray-200 z-[1000]">
                  {isAuthenticated ? (
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
                        <Link href="/site/profile" className="flex items-center py-2 hover:bg-purple-50">
                          <UserCircleIcon className="h-5 w-5 text-gray-500 mr-3" />
                          Mon profil
                        </Link>
                      </li>
                      <li>
                        <Link href="/site/profile?tab=orders" className="flex items-center py-2 hover:bg-purple-50">
                          <ShoppingCartIcon className="h-5 w-5 text-gray-500 mr-3" />
                          Mes commandes
                        </Link>
                      </li>
                      {user?.role === "admin" && (
                        <li>
                          <Link href="/admin" className="flex items-center py-2 hover:bg-purple-50">
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
                        <Link href="/signIn" className="flex items-center py-2 hover:bg-purple-50">
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 mr-3" />
                          Se connecter
                        </Link>
                      </li>
                      <li>
                        <Link href="/signUp" className="flex items-center py-2 hover:bg-purple-50">
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

        <div className="relative w-full mt-2 md:mt-0 md:flex-1 md:mx-4">
  <SearchInput 
    placeholder="Rechercher vos jouets..."
    className="w-full"
  />
</div>

        <div className="hidden md:flex space-x-2 md:ml-2">
          <Link href="/site/contact" className="btn btn-ghost btn-circle" title="Contact">
            <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </Link>
          <div className="indicator">
  <span className="indicator-item badge badge-primary badge-xs">
    {favorites.length}
  </span>
  <Link href="/site/favoris" className="btn btn-ghost btn-circle" title="Favoris">
    <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
  </Link>
</div>
          <CartDropdown />
          <div className="relative" ref={desktopDropdownRef}>
            <button
              tabIndex={0}
              onClick={toggleDropdown}
              className="btn btn-ghost"
              title={isAuthenticated ? "Mon compte" : "Se connecter"}
            >
              <div className="flex items-center space-x-1">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                {isAuthenticated && (
                  <span className="text-sm font-medium text-gray-700 hidden xl:block">
                    {user?.prenom} 
                  </span>
                )}
              </div>
            </button>
            {isDropdownOpen && (
              <ul className="absolute right-0 mt-2 p-2 shadow-xl bg-white rounded-lg w-56 border border-gray-200 z-[1000]">
                {isAuthenticated ? (
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
                      <Link href="/site/profile" className="flex items-center py-2 hover:bg-purple-50">
                        <UserCircleIcon className="h-5 w-5 text-gray-500 mr-3" />
                        Mon profil
                      </Link>
                    </li>
                    <li>
                      <Link href="/site/profile?tab=orders" className="flex items-center py-2 hover:bg-purple-50">
                        <ShoppingCartIcon className="h-5 w-5 text-gray-500 mr-3" />
                        Mes commandes
                      </Link>
                    </li>
                    {user?.role === "admin" && (
                      <li>
                        <Link href="/admin" className="flex items-center py-2 hover:bg-purple-50">
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
                      <Link href="/signIn" className="flex items-center py-2 hover:bg-purple-50">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 mr-3" />
                        Se connecter
                      </Link>
                    </li>
                    <li>
                      <Link href="/signUp" className="flex items-center py-2 hover:bg-purple-50">
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
    </div>
  );
}
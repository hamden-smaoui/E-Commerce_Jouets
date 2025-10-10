"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import SearchInput from '../ui/SearchInput';
import authService from "@/services/auth-service";

import {
  EnvelopeIcon,
  HeartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import CartDropdown from "./CartDropdown";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.userData;
  const isAuthenticated = status === "authenticated";
  const { storeInfo } = useStoreInfo();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { favorites } = useFavorites();

  // LOGO LOADING STATE
  const [logoLoading, setLogoLoading] = useState(true); // Loader visible at first
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    console.log("userdata:", user, "session:", session, "status:", status);
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

  const handleLogout = async () => {
    try {
      // 1. Appelle le backend pour supprimer le refresh token
      await authService.logout();
      
      // 2. Déconnecte NextAuth
      await signOut({ redirect: false });
      
      // 3. Redirige
      window.location.href = "/signIn";
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4 py-2 font-[Comic_Sans_MS,sans-serif]">
      <div className="flex flex-col w-full md:flex-row md:items-center">
        {/* First Line: Logo and Icons on Mobile */}
        <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
          <Link href="/site" className="flex items-center">
            {/* Logo Loader then Logo then Default fallback */}
            <div className="relative h-16 w-auto sm:h-20 min-w-[80px]">
              {logoLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              )}
              {storeInfo?.logo1 && !logoError ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${storeInfo.logo1}`}
                  alt={storeInfo.nom || "Logo"}
                  height={80}
                  width={240}
                  className={`h-16 w-auto sm:h-20 object-contain transition-opacity duration-500 ${logoLoading ? "opacity-0" : "opacity-100"}`}
                  priority
                  onLoad={() => setLogoLoading(false)}
                  onError={() => {
                    setLogoLoading(false);
                    setLogoError(true);
                  }}
                />
              ) : (
                // Default logo fallback (only if logoError is true or logo1 is missing)
                !logoLoading && (
                  <img
                    src="/images/logoBamby.png"
                    alt="Bamby Joy"
                    className="h-16 w-auto sm:h-20 object-contain transition-opacity duration-500 opacity-100"
                  />
                )
              )}
            </div>
          </Link>
          <div className="flex space-x-2 md:hidden">
            <Link href="/site/contact" className="btn btn-ghost btn-circle btn-sm bg-pink-100 hover:bg-pink-200 transition-all" title="Contact">
              <EnvelopeIcon className="h-5 w-5 text-pink-600 drop-shadow-lg" />
            </Link>
            <div className="indicator">
              <span className="indicator-item badge badge-primary badge-xs">
                {favorites.length}
              </span>
              <Link href="/site/favoris" className="btn btn-ghost btn-circle btn-sm bg-blue-100 hover:bg-blue-200 transition-all" title="Favoris">
                <HeartIcon className="h-5 w-5 text-blue-500 drop-shadow-lg" />
              </Link>
            </div>
            <CartDropdown />
            <div className="relative" ref={mobileDropdownRef}>
              <button
                tabIndex={0}
                onClick={toggleDropdown}
                className="btn btn-ghost btn-circle btn-sm bg-yellow-100 hover:bg-yellow-200 transition-all"
                title={isAuthenticated ? "Mon compte" : "Se connecter"}
              >
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-5 w-5 text-yellow-500 drop-shadow-lg" />
                </div>
              </button>
              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 p-2 shadow-xl bg-white rounded-lg w-56 border border-gray-200 z-[1000]">
                  {isAuthenticated ? (
                    <>
                      <li className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-extrabold text-pink-600 text-lg drop-shadow-lg">
                              {user?.prenom} {user?.nom}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </li>
                      <li>
                        <Link href="/site/profile" className="flex items-center py-2 hover:bg-pink-50 font-bold text-blue-600">
                          <UserCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
                          Mon profil
                        </Link>
                      </li>
                      <li>
                        <Link href="/site/profile?tab=orders" className="flex items-center py-2 hover:bg-yellow-50 font-bold text-yellow-600">
                          <ShoppingCartIcon className="h-5 w-5 text-yellow-500 mr-3" />
                          Mes commandes
                        </Link>
                      </li>
                      {user?.role === "admin" && (
                        <li>
                          <Link href="/admin" className="flex items-center py-2 hover:bg-purple-50 font-bold text-purple-600">
                            <Cog6ToothIcon className="h-5 w-5 text-purple-500 mr-3" />
                            Administration
                          </Link>
                        </li>
                      )}
                      <li className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center py-2 w-full text-red-600 hover:bg-red-50 font-extrabold"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                          Se déconnecter
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link href="/signIn" className="flex items-center py-2 hover:bg-blue-50 font-bold text-blue-600">
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-blue-500 mr-3" />
                          Se connecter
                        </Link>
                      </li>
                      <li>
                        <Link href="/signUp" className="flex items-center py-2 hover:bg-pink-50 font-bold text-pink-600">
                          <UserIcon className="h-5 w-5 text-pink-500 mr-3" />
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

        {/* Search Bar */}
        <div className="relative w-full mt-2 md:mt-0 md:flex-1 md:mx-4">
          <SearchInput 
            placeholder="Rechercher vos jouets..."
            className="w-full rounded-xl bg-pink-50 shadow-inner border-2 border-pink-100 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-2 md:ml-2">
          <Link href="/site/contact" className="btn btn-ghost btn-circle bg-pink-100 hover:bg-pink-200 shadow-md hover:scale-105 transition-all" title="Contact">
            <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 drop-shadow-lg" />
          </Link>
          <div className="indicator">
            <span className="indicator-item badge badge-primary badge-xs">
              {favorites.length}
            </span>
            <Link href="/site/favoris" className="btn btn-ghost btn-circle bg-blue-100 hover:bg-blue-200 shadow-md hover:scale-105 transition-all" title="Favoris">
              <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 drop-shadow-lg" />
            </Link>
          </div>
          <CartDropdown />
          <div className="relative" ref={desktopDropdownRef}>
            <button
              tabIndex={0}
              onClick={toggleDropdown}
              className="btn btn-ghost bg-yellow-100 hover:bg-yellow-200 shadow-md hover:scale-105 transition-all"
              title={isAuthenticated ? "Mon compte" : "Se connecter"}
            >
              <div className="flex items-center space-x-1">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 drop-shadow-lg" />
                {isAuthenticated && (
                  <span className="text-lg font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 drop-shadow-lg hidden xl:block">
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
                          <p className="font-extrabold text-pink-600 text-lg drop-shadow-lg">
                            {user?.prenom} {user?.nom}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <Link href="/site/profile" className="flex items-center py-2 hover:bg-pink-50 font-bold text-blue-600">
                        <UserCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
                        Mon profil
                      </Link>
                    </li>
                    <li>
                      <Link href="/site/profile?tab=orders" className="flex items-center py-2 hover:bg-yellow-50 font-bold text-yellow-600">
                        <ShoppingCartIcon className="h-5 w-5 text-yellow-500 mr-3" />
                        Mes commandes
                      </Link>
                    </li>
                    {user?.role === "admin" && (
                      <li>
                        <Link href="/admin" className="flex items-center py-2 hover:bg-purple-50 font-bold text-purple-600">
                          <Cog6ToothIcon className="h-5 w-5 text-purple-500 mr-3" />
                          Administration
                        </Link>
                      </li>
                    )}
                    <li className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center py-2 w-full text-red-600 hover:bg-red-50 font-extrabold"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Se déconnecter
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/signIn" className="flex items-center py-2 hover:bg-blue-50 font-bold text-blue-600">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-blue-500 mr-3" />
                        Se connecter
                      </Link>
                    </li>
                    <li>
                      <Link href="/signUp" className="flex items-center py-2 hover:bg-pink-50 font-bold text-pink-600">
                        <UserIcon className="h-5 w-5 text-pink-500 mr-3" />
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
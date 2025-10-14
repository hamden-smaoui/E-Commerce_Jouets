"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  EnvelopeIcon,
  HeartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useFavorites } from "@/hooks/useFavorites";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import authService from "@/services/auth-service";
import CartDropdown from "./CartDropdown";
import SearchInput from '../ui/SearchInput';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.userData;
  const isAuthenticated = status === "authenticated";
  const { storeInfo } = useStoreInfo();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      // Logout du backend
      await authService.logout();
      sessionStorage.removeItem('accessToken');
      
      // Logout de NextAuth
      await signOut({ redirect: false });
      
      setIsDropdownOpen(false);
      router.push("/signIn");
      router.refresh();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      sessionStorage.removeItem('accessToken');
      setIsDropdownOpen(false);
      router.push("/signIn");
    }
  };

  if (status === "loading") {
    return (
      <div className="navbar bg-base-100 shadow-md px-4 py-2">
        <div className="animate-pulse flex space-x-4">
          <div className="h-16 w-32 bg-gray-200 rounded"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar bg-base-100 shadow-md px-4 py-2 font-[Comic_Sans_MS,sans-serif]">
      <div className="flex flex-col w-full md:flex-row md:items-center">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
          <Link href="/site" className="flex items-center">
            <div className="relative h-16 w-auto sm:h-20 min-w-[80px]">
              {storeInfo?.logo1 ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${storeInfo.logo1}`}
                  alt={storeInfo.nom || "Logo"}
                  height={80}
                  width={240}
                  className="h-16 w-auto sm:h-20 object-contain"
                  priority
                />
              ) : (
                <img
                  src="/images/logoBamby.png"
                  alt="Bamby Joy"
                  className="h-16 w-auto sm:h-20 object-contain"
                />
              )}
            </div>
          </Link>

          {/* Mobile Icons */}
          <div className="flex space-x-2 md:hidden">
            <Link href="/site/contact" className="btn btn-ghost btn-circle btn-sm bg-pink-100 hover:bg-pink-200" title="Contact">
              <EnvelopeIcon className="h-5 w-5 text-pink-600" />
            </Link>
            <div className="indicator">
              <span className="indicator-item badge badge-primary badge-xs">
                {favorites.length}
              </span>
              <Link href="/site/favoris" className="btn btn-ghost btn-circle btn-sm bg-blue-100 hover:bg-blue-200" title="Favoris">
                <HeartIcon className="h-5 w-5 text-blue-500" />
              </Link>
            </div>
            <CartDropdown />
            
            {/* Mobile User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="btn btn-ghost btn-circle btn-sm bg-yellow-100 hover:bg-yellow-200"
                title={isAuthenticated ? "Mon compte" : "Se connecter"}
              >
                <UserIcon className="h-5 w-5 text-yellow-500" />
              </button>
              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 p-2 shadow-xl bg-white rounded-lg w-56 border border-gray-200 z-[1000]">
                  {isAuthenticated && user ? (
                    <>
                      <li className="px-4 py-2 border-b border-gray-100">
                        <p className="font-extrabold text-pink-600 text-lg">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                      </li>
                      <li>
                        <button
                          className="flex items-center py-2 hover:bg-pink-50 font-bold text-blue-600 w-full text-left"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push("/site/profile");
                          }}
                        >
                          <UserCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
                          Mon profil
                        </button>
                      </li>
                      <li>
                        <button
                          className="flex items-center py-2 hover:bg-yellow-50 font-bold text-yellow-600 w-full text-left"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push("/site/profile?tab=orders");
                          }}
                        >
                          <ShoppingCartIcon className="h-5 w-5 text-yellow-500 mr-3" />
                          Mes commandes
                        </button>
                      </li>
                      {user.role === "admin" && (
                        <li>
                          <button
                            className="flex items-center py-2 hover:bg-purple-50 font-bold text-purple-600 w-full text-left"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              router.push("/admin");
                            }}
                          >
                            <Cog6ToothIcon className="h-5 w-5 text-purple-500 mr-3" />
                            Administration
                          </button>
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
                        <button
                          className="flex items-center py-2 hover:bg-blue-50 font-bold text-blue-600 w-full text-left"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push("/signIn");
                          }}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-blue-500 mr-3" />
                          Se connecter
                        </button>
                      </li>
                      <li>
                        <button
                          className="flex items-center py-2 hover:bg-pink-50 font-bold text-pink-600 w-full text-left"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push("/signUp");
                          }}
                        >
                          <UserIcon className="h-5 w-5 text-pink-500 mr-3" />
                          S'inscrire
                        </button>
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
            className="w-full rounded-xl bg-pink-50 shadow-inner border-2 border-pink-100 focus:border-blue-300"
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
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="btn btn-ghost bg-yellow-100 hover:bg-yellow-200 shadow-md hover:scale-105 transition-all"
              title={isAuthenticated ? "Mon compte" : "Se connecter"}
            >
              <div className="flex items-center space-x-1">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 drop-shadow-lg" />
                {isAuthenticated && user && (
                  <span className="text-lg font-extrabold font-[Comic_Sans_MS,sans-serif] text-pink-600 drop-shadow-lg hidden xl:block">
                    {user.prenom}
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
                          <p className="font-extrabold text-pink-600 text-lg drop-shadow-lg">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <button
                        className="flex items-center py-2 hover:bg-pink-50 font-bold text-blue-600 w-full text-left"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/site/profile");
                        }}
                      >
                        <UserCircleIcon className="h-5 w-5 text-blue-400 mr-3" />
                        Mon profil
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center py-2 hover:bg-yellow-50 font-bold text-yellow-600 w-full text-left"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/site/profile?tab=orders");
                        }}
                      >
                        <ShoppingCartIcon className="h-5 w-5 text-yellow-500 mr-3" />
                        Mes commandes
                      </button>
                    </li>
                    {user.role === "admin" && (
                      <li>
                        <button
                          className="flex items-center py-2 hover:bg-purple-50 font-bold text-purple-600 w-full text-left"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push("/admin");
                          }}
                        >
                          <Cog6ToothIcon className="h-5 w-5 text-purple-500 mr-3" />
                          Administration
                        </button>
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
                      <button
                        className="flex items-center py-2 hover:bg-blue-50 font-bold text-blue-600 w-full text-left"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/signIn");
                        }}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-blue-500 mr-3" />
                        Se connecter
                      </button>
                    </li>
                    <li>
                      <button
                        className="flex items-center py-2 hover:bg-pink-50 font-bold text-pink-600 w-full text-left"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/signUp");
                        }}
                      >
                        <UserIcon className="h-5 w-5 text-pink-500 mr-3" />
                        S'inscrire
                      </button>
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
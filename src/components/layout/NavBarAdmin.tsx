'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Home,
  CalendarCheck,
  BookOpen,
  Tags,
  CalendarDays
} from 'lucide-react';

const NavBarCentre: React.FC = () => {
  const router = useRouter();
  const { url } = useParams();

  const userInfo = {
    name: 'John',
    prenom: 'Doe',
    role: 'Admin', 
    image_profile: '/images/image-profile.svg',
  };

  const centreName = 'Mon Centre Statique';

  const navLinks = [
    { label: 'Accueil', path: `/${url}/acceuil`, icon: <Home size={18} /> },
   
  ];

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 md:px-6">
      <div className="navbar-start">
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
          <Menu size={24} />
        </label>
       
          <div className="navbar-start">
        <a href="/site" className="flex items-center">
          <img src="/images/logo.png" alt="Toy Universe Logo" className="h-10 w-auto" />
        </a>
      </div>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`btn btn-ghost btn-sm ${pathname === link.path ? 'btn-active' : ''}`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end flex items-center gap-2 md:gap-4">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost online placeholder flex items-center gap-2 pr-2 w-full lg:w-auto"
          >
            <div className="text-sm hidden lg:block text-left leading-tight truncate">
              <span className="font-semibold block truncate">{`${userInfo.name} ${userInfo.prenom}`}</span>
              <span className="block text-xs text-gray-500 truncate">{userInfo.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                alt="Photo de profil"
                src={userInfo.image_profile}
                onError={(e) => { e.currentTarget.src = '/default-profile.png'; }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[100] mt-3 w-60 p-2 shadow-lg border border-base-300"
          >
            <div className="lg:hidden">
              <li className="p-2">
                <span className="font-bold text-base block truncate">{`${userInfo.name} ${userInfo.prenom}`}</span>
                <span className="text-xs text-gray-500 block truncate">{userInfo.role}</span>
              </li>
              <div className="divider my-1"></div>
              {navLinks.map((link) => (
                <li key={`dropdown-${link.path}`}>
                  <Link href={link.path} className={`flex items-center gap-2 ${pathname === link.path ? 'active' : ''}`}>
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
              <div className="divider my-1"></div>
            </div>
            <li>
              <Link href={`/${url}/profile`} className="flex items-center gap-2">
                <UserCircle size={18} /> Profile
              </Link>
            </li>
            {userInfo.role !== 'Etudiant' && (
              <li>
                <Link href={`/${url}/dashboard`} className="flex items-center gap-2">
                  <Settings size={18} /> Paramétrages
                </Link>
              </li>
            )}
            <div className="divider my-1"></div>
            <li>
              <a
                onClick={() => {
                  router.push(`/${url}/loginCentre`);
                }}
                className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content cursor-pointer"
              >
                <LogOut size={18} /> Déconnexion
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBarCentre;

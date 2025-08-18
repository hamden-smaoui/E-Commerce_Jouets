
import { EnvelopeIcon, UserIcon, HeartIcon, ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md px-4 py-2">
      <div className="flex flex-col w-full md:flex-row md:items-center">
        {/* First Line: Logo and Icons on Mobile */}
        <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
          {/* Logo */}
          <a href="/site" className="flex items-center">
            <img src="/images/logo.png" alt="Toy Universe Logo" className="h-8 w-auto sm:h-10" />
          </a>
          {/* Navigation Icons (Visible on Mobile and Desktop) */}
          <div className="flex space-x-2 md:hidden md:ml-2">
            <a href="/site/contact" className="btn btn-ghost btn-circle" title="Contact">
              <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
            <button className="btn btn-ghost btn-circle" title="Profil">
              <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="indicator">
              <span className="indicator-item badge badge-primary badge-xs">0</span>
              <a href="/site/favoris" className="btn btn-ghost btn-circle" title="Favoris">
                <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
            <div className="indicator">
              <span className="indicator-item badge badge-warning badge-xs">1</span>
              <a href="/site/cart" className="btn btn-ghost btn-circle" title="Panier">
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Second Line: Search Bar on Mobile */}
        <div className="relative w-full mt-2 md:mt-0 md:flex-1 md:mx-4">
          <input
            type="text"
            placeholder="Rechercher vos jouets..."
            className="input input-bordered w-full p-2 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
        </div>

        {/* Navigation Icons (Visible on Desktop) */}
        <div className="hidden md:flex space-x-2 md:ml-2">
          <a href="/site/contact" className="btn btn-ghost btn-circle" title="Contact">
            <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </a>
          <button className="btn btn-ghost btn-circle" title="Profil">
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <div className="indicator">
            <span className="indicator-item badge badge-primary badge-xs">0</span>
            <a href="/site/favoris" className="btn btn-ghost btn-circle" title="Favoris">
              <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
          <div className="indicator">
            <span className="indicator-item badge badge-warning badge-xs">1</span>
            <a href="/site/cart" className="btn btn-ghost btn-circle" title="Panier">
              <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

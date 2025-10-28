"use client";
import Link from "next/link";
import { LockClosedIcon } from "@heroicons/react/24/solid";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <LockClosedIcon className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-2">Accès non autorisé</h1>
        <p className="text-gray-700 mb-6">
          Vous n'avez pas les droits pour accéder à cette page.
        </p>
        <Link href="/">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface FacebookAuthButtonProps {
  mode: 'signin' | 'signup';
}

export default function FacebookAuthButton({ mode }: FacebookAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      await signIn('facebook', { 
        callbackUrl: '',
        redirect: true 
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFacebookAuth}
      disabled={loading}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connexion...
        </div>
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {mode === 'signin' ? 'Se connecter' : 'S\'inscrire'} avec Facebook
        </div>
      )}
    </button>
  );
}
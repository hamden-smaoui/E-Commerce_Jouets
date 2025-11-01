"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";
import KidsCornerLoader from "@/components/ui/KidsCornerLoader";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import authService from "@/services/auth-service";

function SignInContent() {
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({ emailOrPhone: "", motDePasse: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: session, status } = useSession();
  
  // ✅ Récupérer le callbackUrl
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
      toast.success(message);
    }
  }, [searchParams]);

  // ✅ Rediriger si déjà connecté
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email ou téléphone requis";
    }
    if (!formData.motDePasse) {
      newErrors.motDePasse = "Le mot de passe est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await authService.loginWithBackend(formData.emailOrPhone, formData.motDePasse);
      
      const result = await signIn("credentials", {
        emailOrPhone: formData.emailOrPhone,
        password: formData.motDePasse,
        callbackUrl: callbackUrl, // ✅ Utiliser le callbackUrl
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = result.error || "Email ou mot de passe incorrect";
        setErrors({ submit: errorMessage });
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success('Connexion réussie!');
        router.push(callbackUrl); // ✅ Rediriger vers callbackUrl
        router.refresh();
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      const errorMessage = error?.message || "Une erreur est survenue";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/images/logoBamby.png" alt="Bamby Joy Logo" width={120} height={120} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
        </div>
        
        {/* ✅ Message si redirection */}
        {callbackUrl !== '/' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold text-center">
              📍 Connectez-vous pour continuer
            </p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ou Téléphone
              </label>
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base ${
                  errors.emailOrPhone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="votre.email@example.com ou 12345678"
              />
              {errors.emailOrPhone && <p className="mt-1 text-sm text-red-600">{errors.emailOrPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base ${
                    errors.motDePasse ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.motDePasse && (
                <p className="mt-1 text-sm text-red-600">{errors.motDePasse}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>
            <div className="mt-6">
              <GoogleAuthButton mode="signin" />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore inscrit ?{" "}
              {/* ✅ Transmettre aussi le callbackUrl au lien d'inscription */}
              <Link 
                href={callbackUrl !== '/' ? `/signUp?returnUrl=${encodeURIComponent(callbackUrl)}` : "/signUp"} 
                className="text-purple-600 hover:text-purple-800 font-semibold"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<KidsCornerLoader message="Chargement..." size="lg" showMessage={true} />}>
      <SignInContent />
    </Suspense>
  );
}
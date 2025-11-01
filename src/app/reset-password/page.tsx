"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, KeyIcon } from "@heroicons/react/24/solid";
import authService from '@/services/auth-service';
import { toast } from 'react-hot-toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Le code de vérification est requis";
    } else if (formData.code.length !== 6) {
      newErrors.code = "Le code doit contenir 6 caractères";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Le nouveau mot de passe est requis";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      });
      
      toast.success("Mot de passe réinitialisé avec succès!");
      router.push("/signIn?message=Mot de passe réinitialisé! Vous pouvez maintenant vous connecter.");
      
    } catch (err: any) {
      console.error("Erreur reset password:", err);
      const errorMessage = err?.response?.data?.message || "Code invalide ou expiré";
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
          <p className="text-gray-600">
            Entrez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="votre.email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  maxLength={6}
                  className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono text-lg tracking-widest ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="123456"
                />
              </div>
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Minimum 6 caractères"
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
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-700 w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirmez le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/signIn" className="text-purple-600 hover:text-purple-800 font-medium">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
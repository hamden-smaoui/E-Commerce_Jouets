'use client';
import React, { useState } from 'react';
import NewsletterService from '@/services/newsletter-service';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'success'|'error'|'already'|'loading'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Veuillez entrer un email valide.');
      return;
    }
    try {
      await NewsletterService.subscribe({ email: email.trim() });
      setStatus('success');
      setMessage('Merci ! Vous êtes bien inscrit à la newsletter.');
      setEmail('');
    } catch (error: any) {
      if (error.message && error.message.includes('déjà inscrit')) {
        setStatus('already');
        setMessage('Cet email est déjà inscrit.');
      } else {
        setStatus('error');
        setMessage(error.message || 'Erreur lors de l\'inscription.');
      }
    }
  };

  return (
    <form className="mb-8" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Votre email"
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border-2 border-blue-300 text-white placeholder-blue-200 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 shadow-inner"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-pink-400 to-blue-400 text-white font-bold rounded-lg hover:from-pink-500 hover:to-blue-500 transition-all duration-300 whitespace-nowrap shadow"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Envoi...' : "S'inscrire"}
        </button>
      </div>
      {status !== 'idle' && (
        <div className={`mt-2 text-sm ${status === 'success' ? 'text-green-300' : status === 'already' ? 'text-yellow-200' : 'text-red-300'}`}>
          {message}
        </div>
      )}
    </form>
  );
}
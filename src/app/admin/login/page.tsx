'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-line bg-ink-2 p-8 md:p-10 rounded-sm space-y-6 shadow-2xl relative">
        
        {/* Decorative branding bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-ember" />

        {/* Title branding */}
        <div className="space-y-1 text-center">
          <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Secure Access</span>
          <h1 className="text-xl md:text-2xl font-display font-medium text-parchment tracking-wide">
            SITKA SURFACES ADMIN
          </h1>
          <p className="text-stone-dim text-xs leading-relaxed">
            Please log in with your administrative credentials to manage content and leads.
          </p>
        </div>

        {error && (
          <div className="bg-ember/15 border border-ember/30 text-ember-light p-3.5 rounded-sm text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
              placeholder="e.g. admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-ember text-parchment py-3.5 mt-2 rounded-sm text-[10px] font-mono tracking-wider uppercase hover:bg-ember-light transition-colors duration-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> {isSubmitting ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link href="/" className="text-[10px] text-stone-dim hover:text-parchment underline transition-colors">
            Return to public website
          </Link>
        </div>

      </div>
    </div>
  );
}

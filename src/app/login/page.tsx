'use client';

import React, { useState } from 'react';
import { ChefHat, Mail, Lock, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Mascot Logo */}
      <div className="relative mb-8 flex justify-center items-center">
        <div className="absolute inset-0 bg-orange-400 blur-3xl opacity-20 rounded-full w-40 h-40"></div>
        <div className="relative z-10 w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-200">
          <ChefHat className="text-white w-14 h-14" />
          <div className="absolute -bottom-2 -right-2 text-2xl">🐤</div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-orange-200/60 dark:border-zinc-800 p-8">
        <h1 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100 mb-2">
          Welcome Back!
        </h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">
          Sign in to access your personalized EatWise profile.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="chompoo@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <LogIn className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Don&apos;t have an account?{' '}
            <a href="/" className="text-orange-500 hover:text-orange-600 font-bold transition-colors">
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

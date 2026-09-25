'use client';

import React from 'react';
import { ChefHat, Moon, Sun, User, LogIn, LogOut } from 'lucide-react';
import { UserProfile, AppState } from '@/types';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  userProfile: UserProfile | null;
  appState: AppState;
  onNavigateHome: () => void;
  onEditProfile: () => void;
}

export default function Header({ theme, toggleTheme, userProfile, appState, onNavigateHome, onEditProfile }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-orange-200/50 dark:border-zinc-800 sticky top-0 z-50 p-4 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2 cursor-pointer text-orange-500 font-black text-2xl tracking-tight"
        >
          <ChefHat size={32} strokeWidth={2.5} /> EatWise
          <span className="text-zinc-800 dark:text-zinc-100">.ai</span>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-orange-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
          </button>

          {/* Edit Profile Button */}
          {userProfile && appState !== 'onboarding' && (
            <button
              onClick={onEditProfile}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 rounded-2xl border border-orange-500/30 transition-colors"
            >
              <User size={15} /> {userProfile.name ? userProfile.name : 'Profile'}
            </button>
          )}

          {/* Auth Button */}
          {session ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <LogOut size={15} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold bg-orange-500 text-white hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 transition-colors"
            >
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

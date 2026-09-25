'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import Onboarding from '@/components/onboarding';
import MealRequestForm from '@/components/meal-request-form';
import LoadingScreen from '@/components/loading-screen';
import Results from '@/components/results';
import { generateRecommendations } from '@/lib/mock-data';
import { AppState, MealRequest, RecommendationResult, UserProfile } from '@/types';
import { useSession } from 'next-auth/react';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [appState, setAppState] = useState<AppState>('init');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentRequest, setCurrentRequest] = useState<MealRequest | null>(null);
  const [resultsData, setResultsData] = useState<RecommendationResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  // Initialize saved profile & theme on mount
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('eatwise_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    const initProfile = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const dbProfile = await res.json();
            setUserProfile(dbProfile);
            
            // Check if they have completed the form (e.g. age exists)
            if (dbProfile.age && dbProfile.height && dbProfile.weight) {
              setAppState('home');
            } else {
              setAppState('onboarding');
            }
            return;
          }
        } catch (e) {}
      }
      
      // If unauthenticated or no profile found in DB, force onboarding
      // (Optionally clear old localStorage to prevent the "ghost profile" bug)
      localStorage.removeItem('eatwise_profile_v3');
      setAppState('onboarding');
      setUserProfile(null);
    };

    if (mounted) {
      initProfile();
    }
  }, [status, mounted]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('eatwise_theme', nextTheme);
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('eatwise_profile_v3', JSON.stringify(profile));
    setAppState('home');
  };

  const handleMealSubmit = async (request: MealRequest) => {
    setCurrentRequest(request);
    setAppState('loading');

    const result = await generateRecommendations(userProfile!, request);
    setResultsData(result);
    setAppState('results');
  };

  const handleRegenerate = async () => {
    setAppState('loading');
    const result = await generateRecommendations(userProfile!, currentRequest!);
    setResultsData(result);
    setAppState('results');
  };

  if (!mounted || appState === 'init') return null;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-amber-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300 selection:bg-orange-500 selection:text-white">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          userProfile={userProfile}
          appState={appState}
          onNavigateHome={() => userProfile && setAppState('home')}
          onEditProfile={() => setAppState('onboarding')}
        />

        <main className="py-6 px-4">
          {appState === 'onboarding' && (
            <Onboarding onComplete={handleProfileSave} initialProfile={userProfile} />
          )}

          {appState === 'home' && (
            <MealRequestForm onSubmit={handleMealSubmit} userProfile={userProfile} />
          )}

          {appState === 'loading' && (
            <LoadingScreen userName={userProfile?.name} currentRequest={currentRequest} />
          )}

          {appState === 'results' && resultsData && currentRequest && (
            <Results
              data={resultsData}
              userProfile={userProfile}
              currentRequest={currentRequest}
              onRegenerate={handleRegenerate}
              onEditSearch={() => setAppState('home')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

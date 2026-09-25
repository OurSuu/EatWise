'use client';

import React, { useState } from 'react';
import { ChevronRight, User, Activity, Target, MapPin, Star, Mail, Lock } from 'lucide-react';
import ChefMango from './chef-mango';
import { UserProfile } from '@/types';
import { signIn, useSession } from 'next-auth/react';
import { GENDER_OPTIONS, LIFESTYLE_OPTIONS, TARGET_OPTIONS } from '@/constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile: UserProfile | null;
}

export default function Onboarding({ onComplete, initialProfile }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>(
    initialProfile || {
      name: '',
      gender: 'Man',
      age: '',
      height: '',
      weight: '',
      lifestyle: LIFESTYLE_OPTIONS[1],
      targets: ['High protein'],
      defaultLocation: '',
    }
  );

  const { data: session } = useSession();

  const handleNext = async () => {
    if (step === 1 && !session) {
      // Register logic
      setIsRegistering(true);
      setRegisterError('');
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: profile.name, email, password, gender: profile.gender }),
        });
        
        if (res.ok || res.status === 400) {
          // If okay or user exists, try to log in
          const signRes = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
          if (signRes?.error) {
            setRegisterError('Invalid email or password');
            setIsRegistering(false);
            return;
          }
        } else {
          setRegisterError('Failed to register');
          setIsRegistering(false);
          return;
        }
      } catch (e) {
        setRegisterError('Network error');
        setIsRegistering(false);
        return;
      }
      setIsRegistering(false);
      setStep(step + 1);
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Try to save to DB if logged in, but don't block
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      } catch (e) {
        console.error('Failed to sync profile to DB');
      }
      onComplete(profile);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      if (session) return profile.name.trim().length > 0;
      return profile.name.trim().length > 0 && email.includes('@') && password.length >= 6;
    }
    if (step === 2) return profile.age && profile.height && profile.weight;
    if (step === 3) return profile.lifestyle !== '';
    if (step === 4) return (profile.targets || []).length > 0;
    return true;
  };

  const toggleTarget = (target: string) => {
    setProfile((prev) => {
      const currentTargets = prev.targets || [];
      const targets = currentTargets.includes(target)
        ? currentTargets.filter((t) => t !== target)
        : [...currentTargets, target];
      return { ...prev, targets };
    });
  };

  const getMangoDialog = () => {
    const nameStr = profile.name ? profile.name : 'friend';
    switch (step) {
      case 1:
        return "Sawatdee krub! 🐤 I'm Chef Mango! Before we get cooking, what should I call you and what's your gender?";
      case 2:
        return `Nice to meet you, ${nameStr}! 💛 How about your age, height, and weight so I can tailor nutrition to your body?`;
      case 3:
        return `Got it! How active are you usually during a typical week, ${nameStr}?`;
      case 4:
        return 'Awesome! What are your main health or fitness goals right now? Choose all that apply ⭐';
      case 5:
        return "Almost done! Where do you usually hang out or order food? (e.g., Chula, Siam, Ari, or Google Maps link). I'll use this for real restaurant suggestions!";
      default:
        return 'Ready to find your perfect meal?';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <ChefMango mood="curious" message={getMangoDialog()} userName={profile.name} size="lg" />

      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-orange-200/60 dark:border-zinc-800 p-6 md:p-8 mt-6 transition-colors">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Step 1: Name & Gender */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <User className="text-orange-500" /> What&apos;s your name &amp; account details?
            </h2>

            {registerError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-900/50">
                {registerError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Your Name / Nickname <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="e.g. Alex, Chompoo, Mark..."
              />
            </div>
            
            {!session && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="chompoo@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    Password <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="•••••••• (min 6 chars)"
                    />
                  </div>
                </div>

                <div className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Already have an account?{' '}
                  <a href="/login" className="text-orange-500 font-bold hover:underline transition-colors">
                    Login here
                  </a>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = profile.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: g })}
                      className={`p-3.5 rounded-2xl font-semibold border text-sm transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-[1.02]'
                          : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-orange-300'
                      }`}
                    >
                      {isSelected && <Star size={16} className="fill-white animate-star-hop" />}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Body Stats */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="text-orange-500" /> Body Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="165"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="55"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="text-orange-500" /> Exercise &amp; Activity
            </h2>
            <div className="space-y-3">
              {LIFESTYLE_OPTIONS.map((opt) => {
                const isSelected = profile.lifestyle === opt;
                return (
                  <div
                    key={opt}
                    onClick={() => setProfile({ ...profile, lifestyle: opt })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-semibold text-sm md:text-base">{opt}</span>
                    {isSelected && <Star size={20} className="text-orange-500 fill-orange-500 animate-star-hop shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Health Targets */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Target className="text-orange-500" /> Select Your Goals ⭐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TARGET_OPTIONS.map((opt) => {
                const isSelected = (profile.targets || []).includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleTarget(opt)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-orange-300'
                    }`}
                  >
                    <span className="font-bold text-sm md:text-base">{opt}</span>
                    <Star
                      size={20}
                      className={`transition-all ${
                        isSelected ? 'fill-amber-300 text-amber-300 animate-star-hop' : 'text-zinc-400 opacity-40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="text-orange-500" /> Usual Location / Hangout
            </h2>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Neighborhood, University, or Google Maps Link
              </label>
              <input
                type="text"
                value={profile.defaultLocation || ''}
                onChange={(e) => setProfile({ ...profile, defaultLocation: e.target.value })}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. Near Chula University, Siam Paragon, or Ari BTS..."
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                This helps Chef Mango calculate distance and direct Google Maps links when suggesting eateries!
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`px-8 py-3.5 rounded-2xl font-bold text-white transition-all flex items-center gap-2 shadow-lg ${
              isStepValid() && !isRegistering
                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 scale-100 active:scale-95'
                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isRegistering ? 'Creating Account...' : (step === 5 ? 'Save & Start Eating!' : 'Next Step')}
            {!isRegistering && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Clock, Coins, Utensils, Flame, AlertCircle, Sparkles, Star, Navigation } from 'lucide-react';
import ChefMango from './chef-mango';
import { MealRequest, UserProfile } from '@/types';

interface MealRequestFormProps {
  onSubmit: (request: MealRequest) => void;
  userProfile: UserProfile | null;
}

export default function MealRequestForm({ onSubmit, userProfile }: MealRequestFormProps) {
  const [request, setRequest] = useState<MealRequest>({
    budget: '100',
    time: '20',
    method: 'either',
    preference: 'Healthy',
    cravings: '',
    ingredients: '',
    avoid: 'spicy',
    people: '1',
    area: userProfile?.defaultLocation || 'Near Campus',
  });

  const isCookSelected = request.method === 'cook' || request.method === 'either';
  const isBuySelected = request.method === 'buy' || request.method === 'either';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(request);
  };

  const loadDemoScenario = () => {
    setRequest({
      budget: '100',
      time: '20',
      method: 'either',
      preference: 'Healthy',
      cravings: 'Comfort warm soup/mash',
      ingredients: 'sweet potato, egg, carrot',
      avoid: 'spicy',
      people: '1',
      area: userProfile?.defaultLocation || 'Near Chula Campus',
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <ChefMango
        mood="idle"
        message={`Hey ${userProfile?.name || 'there'}! 💛 Tell me your budget, cravings, and what's in your fridge today!`}
        userName={userProfile?.name}
        size="md"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-orange-200/60 dark:border-zinc-800 p-6 md:p-8 mt-4 transition-colors space-y-6"
      >
        {/* Quick Demo Pre-fill Banner */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs md:text-sm text-amber-900 dark:text-amber-200">
            <strong>⚡ Demo Scenario:</strong> Sweet potato + egg + carrot (avoid spicy, budget 100 THB).
          </div>
          <button
            type="button"
            onClick={loadDemoScenario}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Load Demo Inputs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              <Coins size={18} className="text-orange-500" /> Budget (THB)
            </label>
            <input
              required
              type="number"
              value={request.budget}
              onChange={(e) => setRequest({ ...request, budget: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
              placeholder="100"
            />
          </div>

          {/* Time Available */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              <Clock size={18} className="text-orange-500" /> Time Available (mins)
            </label>
            <input
              required
              type="number"
              value={request.time}
              onChange={(e) => setRequest({ ...request, time: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
              placeholder="20"
            />
          </div>

          {/* Meal Method Choice */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              Where or how do you want your meal?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cook' as const, label: '🍳 Cook at home' },
                { id: 'buy' as const, label: '🛍️ Buy food' },
                { id: 'either' as const, label: '✨ Either' },
              ].map((item) => {
                const isSelected = request.method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRequest({ ...request, method: item.id })}
                    className={`p-3.5 rounded-2xl font-bold text-xs md:text-sm border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-[1.02]'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-orange-300'
                    }`}
                  >
                    {isSelected && <Star size={16} className="fill-amber-300 text-amber-300 animate-star-hop" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cravings */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              <Flame size={18} className="text-orange-500" /> Cravings / Specific Food Style
            </label>
            <input
              type="text"
              value={request.cravings}
              onChange={(e) => setRequest({ ...request, cravings: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g. Creamy pasta, Dessert, Warm soup, Fried rice, Crispy..."
            />
          </div>

          {/* Ingredients at home */}
          {isCookSelected && (
            <div className="md:col-span-2 bg-orange-50/70 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/40">
              <label className="flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-300 mb-2">
                <Utensils size={18} className="text-orange-500" /> Ingredients you have at home ⭐
              </label>
              <input
                type="text"
                value={request.ingredients}
                onChange={(e) => setRequest({ ...request, ingredients: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-orange-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. sweet potato, egg, carrot, rice, garlic..."
              />
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-2 font-medium">
                Chef Mango will strictly formulate home recipes using ONLY these ingredients!
              </p>
            </div>
          )}

          {/* Location */}
          {isBuySelected && (
            <div className="md:col-span-2 bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40">
              <label className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">
                <Navigation size={18} className="text-orange-500" /> Where are you right now? / Google Maps location
              </label>
              <input
                type="text"
                value={request.area}
                onChange={(e) => setRequest({ ...request, area: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. Faculty of Science Chula, Siam BTS, or paste Google Maps link..."
              />
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium">
                Chef Mango uses this to find real nearby eateries and calculate travel time!
              </p>
            </div>
          )}

          {/* Preference Dropdown */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Food Preference</label>
            <select
              value={request.preference}
              onChange={(e) => setRequest({ ...request, preference: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
            >
              <option>Healthy</option>
              <option>Comfort food</option>
              <option>High protein</option>
              <option>No preference</option>
            </select>
          </div>

          {/* Foods to Avoid */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              <AlertCircle size={18} className="text-red-500" /> Foods to Avoid
            </label>
            <input
              type="text"
              value={request.avoid}
              onChange={(e) => setRequest({ ...request, avoid: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g. spicy, seafood, dairy, nuts..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={22} /> Ask Chef Mango What to Eat!
        </button>
      </form>
    </div>
  );
}

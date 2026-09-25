import React from 'react';
import { Clock, Coins, Flame, Store, MapPin, RotateCcw, Star, ExternalLink } from 'lucide-react';
import ChefMango from './chef-mango';
import { MealRequest, RecommendationResult, UserProfile } from '@/types';

interface ResultsProps {
  data: RecommendationResult;
  userProfile: UserProfile | null;
  currentRequest: MealRequest;
  onRegenerate: () => void;
  onEditSearch: () => void;
}

export default function Results({ data, userProfile, currentRequest, onRegenerate, onEditSearch }: ResultsProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <ChefMango
        mood="excited"
        message={
          `Woohoo ${userProfile?.name || ''}! 🎉 Here are my top 3 personalized picks for you!` +
          (currentRequest.avoid ? ` Strictly non-${currentRequest.avoid} as requested!` : '')
        }
        userName={userProfile?.name}
        size="lg"
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {data.options.map((opt, i) => {
          const isCook = opt.cook === 'Yes' || opt.cook?.toLowerCase() === 'yes';

          return (
            <div
              key={i}
              className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 border flex flex-col relative transition-all duration-300 hover:-translate-y-1.5 shadow-lg ${
                i === 0
                  ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-orange-500/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Top Choice Ribbon */}
              {i === 0 && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-black px-4 py-1 rounded-full shadow-md tracking-wider uppercase flex items-center gap-1">
                  <Star size={12} className="fill-white" /> Chef&apos;s Top Pick
                </div>
              )}

              {/* Medal & Title */}
              <div className="text-3xl mb-2 mt-1">{opt.medal || (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉')}</div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-3 leading-snug">{opt.name}</h3>

              {/* Badges Bar */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Coins size={12} /> {opt.cost} ฿
                </span>
                <span className="bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Clock size={12} /> {opt.time}m
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                    isCook
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                  }`}
                >
                  {isCook ? <Flame size={12} /> : <Store size={12} />}
                  {isCook ? 'Cook at Home' : 'Buy Food'}
                </span>
              </div>

              {/* Body Content */}
              <div className="flex-grow space-y-4">
                {/* Explanation */}
                <div className="bg-amber-50/80 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-xs md:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {opt.explanation}
                </div>

                {/* Key Ingredients */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Ingredients</h4>
                  <p className="text-xs md:text-sm font-semibold text-zinc-800 dark:text-zinc-200">{opt.ingredients}</p>
                </div>

                {/* Nutrition Facts Grid */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Nutrition</h4>
                  <div className="grid grid-cols-4 gap-1 text-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
                    <div>
                      <span className="block text-[10px] text-zinc-400">Calories</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{opt.nutrition?.cals || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-400">Protein</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{opt.nutrition?.p || 0}g</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-400">Carbs</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{opt.nutrition?.c || 0}g</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-400">Fat</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{opt.nutrition?.f || 0}g</span>
                    </div>
                  </div>
                </div>

                {/* Restaurant Recommendations */}
                {!isCook && opt.restaurants && opt.restaurants.length > 0 && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                    <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <MapPin size={13} /> Real Spots Near You
                    </h4>
                    <div className="space-y-2">
                      {opt.restaurants.map((r, rIdx) => {
                        const spotName = typeof r === 'string' ? r : r.name;
                        const travel = typeof r === 'object' ? r.travelTime : '~5 mins away';
                        const note = typeof r === 'object' ? r.note : '';
                        
                        // ค้นหาด้วยชื่อร้านเป๊ะๆ ไปเลย จะได้ขึ้นปักหมุดพร้อมข้อมูลร้าน
                        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + ' ' + (currentRequest.area || 'Bangkok'))}`;
                        const searchUrl = typeof r === 'object' && 'mapUrl' in r && r.mapUrl ? r.mapUrl : fallbackUrl;

                        return (
                          <div key={rIdx} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-xs md:text-sm text-zinc-800 dark:text-zinc-200 block">{spotName}</span>
                                {travel && (
                                  <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 block mt-0.5">
                                    ⏱️ {travel}
                                  </span>
                                )}
                              </div>
                              <a
                                href={searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1"
                              >
                                <ExternalLink size={11} /> Maps
                              </a>
                            </div>
                            {note && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">&ldquo;{note}&rdquo;</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onRegenerate}
          className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} /> 🔄 Give me different options
        </button>
        <button
          onClick={onEditSearch}
          className="px-6 py-3.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          Edit Situation
        </button>
      </div>
    </div>
  );
}

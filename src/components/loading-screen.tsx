import React from 'react';
import { Sparkles } from 'lucide-react';
import ChefMango from './chef-mango';
import { MealRequest } from '@/types';

interface LoadingScreenProps {
  userName?: string;
  currentRequest: MealRequest | null;
}

export default function LoadingScreen({ userName, currentRequest }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <ChefMango mood="thinking" size="xl" userName={userName} />
      <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mt-8 mb-2 flex items-center gap-2">
        <Sparkles className="text-orange-500 animate-pulse" />
        Chef Mango is cooking up ideas for {userName || 'you'}...
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md font-medium">
        Searching real spots near{' '}
        <span className="font-bold text-orange-500">{currentRequest?.area || 'you'}</span>, adhering strictly to{' '}
        <span className="font-bold text-orange-500">{currentRequest?.ingredients || 'your ingredients'}</span> and
        avoiding <span className="font-bold text-red-500">{currentRequest?.avoid || 'allergens'}</span>...
      </p>
    </div>
  );
}

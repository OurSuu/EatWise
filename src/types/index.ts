export interface UserProfile {
  name: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  lifestyle: string;
  targets: string[];
  defaultLocation: string;
}

export interface NutritionInfo {
  cals: number;
  p: number;
  c: number;
  f: number;
}

export interface RestaurantSuggestion {
  name: string;
  travelTime: string;
  note: string;
}

export interface MealOption {
  medal: string;
  name: string;
  cost: number;
  time: number;
  cook: string;
  ingredients: string;
  nutrition: NutritionInfo;
  explanation: string;
  restaurants: RestaurantSuggestion[];
}

export interface MealRequest {
  budget: string;
  time: string;
  method: 'cook' | 'buy' | 'either';
  preference: string;
  cravings: string;
  ingredients: string;
  avoid: string;
  people: string;
  area: string;
}

export interface RecommendationResult {
  status: string;
  options: MealOption[];
}

export type MoodType = 'idle' | 'curious' | 'thinking' | 'excited' | 'sad';
export type SizeType = 'sm' | 'md' | 'lg' | 'xl';
export type AppState = 'init' | 'onboarding' | 'home' | 'loading' | 'results';

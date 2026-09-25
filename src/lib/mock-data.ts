import { MealRequest, RecommendationResult, UserProfile } from '@/types';

export const generateRecommendations = async (
  profile: UserProfile,
  request: MealRequest
): Promise<RecommendationResult> => {
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile, request }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch recommendations');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return a fallback error state
    return {
      status: 'error',
      options: [
        {
          medal: '❌',
          name: 'Error connecting to AI',
          cost: 0,
          time: 0,
          cook: 'Yes',
          ingredients: '-',
          nutrition: { cals: 0, p: 0, c: 0, f: 0 },
          explanation: error instanceof Error ? error.message : 'Unknown error occurred. Please try again.',
          restaurants: [],
        },
      ],
    };
  }
};

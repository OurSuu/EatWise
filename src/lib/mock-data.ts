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

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.status === 'error') {
      return {
        status: 'error',
        message: data?.message || 'Failed to fetch recommendations',
        options: [],
      };
    }

    return {
      status: 'success',
      options: Array.isArray(data.options) ? data.options : [],
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred. Please try again.',
      options: [],
    };
  }
};

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildMapsCoordUrl, buildMapsSearchUrl } from '@/lib/maps';
import { matchNearbyPlace, searchNearbyRestaurants, type NearbyPlace } from '@/lib/places';
import type { MealOption, RestaurantSuggestion } from '@/types';

export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
].filter((model, index, list): model is string => Boolean(model) && list.indexOf(model) === index);

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isQuotaError(error: unknown) {
  const message = errorText(error);
  return (
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('quota') ||
    message.includes('rate-limit')
  );
}

function isDailyQuotaError(error: unknown) {
  const message = errorText(error);
  return message.includes('PerDay') || message.includes('RequestsPerDay');
}

function isNotFoundError(error: unknown) {
  const message = errorText(error);
  return message.includes('"code":404') || message.includes('NOT_FOUND') || message.includes('no longer available');
}

function isUnavailableError(error: unknown) {
  const message = errorText(error);
  return message.includes('"code":503') || message.includes('UNAVAILABLE') || message.includes('high demand');
}

function retryDelayMs(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const seconds =
    message.match(/retry in ([\d.]+)s/i)?.[1] ||
    message.match(/"retryDelay":"(\d+)s"/)?.[1];
  if (!seconds) return 1200;
  return Math.min(Math.ceil(Number(seconds) * 1000), 4000);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonArray(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI did not return a JSON array');
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function friendlyAiError(error: unknown) {
  if (isQuotaError(error)) {
    return 'Gemini free-tier quota is full for the models we tried. Wait a bit and try again, or set GEMINI_MODEL=gemini-3.5-flash-lite in .env.local (higher daily free limit).';
  }
  return error instanceof Error ? error.message : 'Failed to generate recommendations';
}

function normalizeOptions(raw: unknown, area: string, nearby: NearbyPlace[]): MealOption[] {
  if (!Array.isArray(raw)) return [];

  return raw.slice(0, 3).map((item, index): MealOption => {
    const option = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const cook = String(option.cook || 'Yes');
    const isCook = cook.toLowerCase() === 'yes';
    const nutrition = (option.nutrition && typeof option.nutrition === 'object'
      ? option.nutrition
      : {}) as Record<string, unknown>;

    const restaurants = isCook
      ? []
      : (Array.isArray(option.restaurants) ? option.restaurants : [])
          .map((restaurant): RestaurantSuggestion | null => {
            const row = typeof restaurant === 'string'
              ? { name: restaurant }
              : (restaurant && typeof restaurant === 'object' ? restaurant as Record<string, unknown> : null);
            if (!row) return null;

            const name = String(row.name || '').trim();
            if (!name) return null;

            const matched = matchNearbyPlace(name, nearby);
            const mapUrl = matched?.lat != null && matched?.lng != null
              ? buildMapsCoordUrl(matched.lat, matched.lng, matched.name)
              : buildMapsSearchUrl(matched?.name || name, area, matched?.address);

            return {
              name: matched?.name || name,
              travelTime: String(row.travelTime || '~10 mins away'),
              note: String(row.note || ''),
              mapUrl,
            };
          })
          .filter((restaurant): restaurant is RestaurantSuggestion => Boolean(restaurant));

    return {
      medal: String(option.medal || ['🥇', '🥈', '🥉'][index] || '🍽️'),
      name: String(option.name || `Option ${index + 1}`),
      cost: Number(option.cost) || 0,
      time: Number(option.time) || 0,
      cook,
      ingredients: String(option.ingredients || '-'),
      nutrition: {
        cals: Number(nutrition.cals) || 0,
        p: Number(nutrition.p) || 0,
        c: Number(nutrition.c) || 0,
        f: Number(nutrition.f) || 0,
      },
      explanation: String(option.explanation || ''),
      restaurants,
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, request } = body;

    const {
      budget,
      time,
      method,
      preference,
      cravings,
      ingredients,
      avoid,
      people,
      area,
    } = request;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { status: 'error', message: 'GEMINI_API_KEY is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const location = area || profile?.defaultLocation || 'Bangkok';
    const wantsRestaurants = method === 'buy' || method === 'either';
    const nearby = wantsRestaurants ? await searchNearbyRestaurants(location) : [];

    const nearbyBlock = nearby.length
      ? `VERIFIED NEARBY RESTAURANTS (copy restaurant names EXACTLY from this list, do not invent new shops):\n${nearby
          .map((place, i) => `${i + 1}. ${place.name}${place.address ? ` — ${place.address}` : ''}`)
          .join('\n')}`
      : 'No live restaurant directory was available. Only use well-known real chain branches that exist on Google Maps in this area, and use the local Maps listing name (Thai is allowed for restaurant names).';

    const prompt = `
You are Chef Mango, an expert AI culinary and restaurant assistant in Thailand.
The user wants meal recommendations based on these constraints:
- User Profile: ${profile?.name || 'User'}, Gender: ${profile?.gender || 'N/A'}, Age: ${profile?.age || 'N/A'}, Goals: ${(profile?.targets || []).join(', ')}, Lifestyle: ${profile?.lifestyle || 'N/A'}
- Method: ${method} (cook = cook at home, buy = buy/eat out, either = mix of both)
- Budget: ${budget} THB
- Time Available: ${time} minutes
- Food Preference: ${preference}
- Cravings: ${cravings || 'None'}
- Available Ingredients (if cooking): ${ingredients || 'Basic pantry items'}
- Avoid: ${avoid || 'None'}
- People: ${people}
- Location: ${location}

${nearbyBlock}

Generate exactly 3 meal options (Option 1, Option 2, Option 3) that fit these criteria.
Return ONLY a valid JSON array of 3 objects with no markdown wrapping and no backticks.

CRITICAL RULES:
1. Meal names, ingredients, and explanations should be in English.
2. Restaurant names are an exception: they MUST be the exact Google Maps / local listing name (Thai script is preferred when that is how the shop appears on Maps). Never translate a shop into a made-up English name.
3. If method='buy' or 'either', pick REAL restaurants from the verified list when it is provided. DO NOT invent shops.
4. If method='cook', all options MUST have cook='Yes' and restaurants=[]. Strictly use ONLY the provided Available Ingredients.
5. Strictly respect the budget and time limits.
6. Provide the output as a RAW JSON array ONLY. Do not include mapUrl; the server will attach Maps links.

Schema for each object:
{
  "medal": "string (emoji like 🥇, 🥈, 🥉)",
  "name": "string (Meal name in English)",
  "cost": number (estimated cost in THB),
  "time": number (estimated time in minutes),
  "cook": "string ('Yes' for home-cooked, 'No' for restaurant/buy)",
  "ingredients": "string (Key ingredients if cooking, or Food Style if buying)",
  "nutrition": { "cals": number, "p": number, "c": number, "f": number },
  "explanation": "string (Why you recommend this in a friendly tone, in English)",
  "restaurants": [
    {
      "name": "string (EXACT listing name from the verified list or Google Maps)",
      "travelTime": "string (e.g., '10 mins walk')",
      "note": "string (Short description of why it fits)"
    }
  ]
}
`;

    let lastError: unknown = null;
    let options: MealOption[] = [];

    for (const model of MODEL_CANDIDATES) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          options = normalizeOptions(extractJsonArray(response.text || '[]'), location, nearby);
          if (options.length === 0) {
            throw new Error('AI returned no meal options');
          }

          return NextResponse.json({ status: 'success', options, model });
        } catch (error) {
          lastError = error;
          console.error(`Gemini failed (${model}, attempt ${attempt + 1}):`, error);

          if (isNotFoundError(error) || isDailyQuotaError(error)) {
            break;
          }

          if ((isUnavailableError(error) || isQuotaError(error)) && attempt === 0) {
            await sleep(retryDelayMs(error));
            continue;
          }
          break;
        }
      }
    }

    return NextResponse.json(
      { status: 'error', message: friendlyAiError(lastError), options: [] },
      { status: isQuotaError(lastError) ? 429 : 500 }
    );
  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json(
      { status: 'error', message: friendlyAiError(error), options: [] },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
      area
    } = request;

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json({ status: 'error', message: 'GEMINI_API_KEY is not configured in environment variables.' }, { status: 500 });
    }

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
- Location: ${area || profile?.defaultLocation || 'Bangkok'}

Generate exactly 3 meal options (Option 1, Option 2, Option 3) that fit these criteria.
Return ONLY a valid JSON array of 3 objects with no markdown wrapping and no backticks.

CRITICAL RULES:
1. ALL OUTPUT MUST BE STRICTLY IN ENGLISH ONLY. Do not use any Thai characters.
2. If method='buy' or 'either', you MUST provide REAL, EXISTING, and VERIFIED restaurants that can be found on Google Maps near the given Location. DO NOT invent, hallucinate, or guess restaurant names. Use famous, well-known, or verified local restaurants that match the food type and budget.
3. If method='cook', all options MUST have cook='Yes' and restaurants=[]. Strictly use ONLY the provided Available Ingredients!
4. Strictly respect the budget and time limits.
5. Provide the output as a RAW JSON array ONLY.

Schema for each object:
{
  "medal": "string (emoji like 🥇, 🥈, 🥉)",
  "name": "string (Meal name in English only)",
  "cost": number (estimated cost in THB),
  "time": number (estimated time in minutes),
  "cook": "string ('Yes' for home-cooked, 'No' for restaurant/buy)",
  "ingredients": "string (Key ingredients if cooking, or Food Style if buying)",
  "nutrition": { "cals": number, "p": number, "c": number, "f": number },
  "explanation": "string (Why you recommend this in a friendly tone, in English only)",
  "restaurants": [
    {
      "name": "string (The EXACT real name of the restaurant as it appears on Google Maps)",
      "travelTime": "string (e.g., '10 mins walk')",
      "note": "string (Short description of why it fits)",
      "mapUrl": "string (Generate a Google Maps search URL exactly like this: https://www.google.com/maps/search/?api=1&query=EXACT_RESTAURANT_NAME_AND_LOCATION)"
    }
  ] // Empty array [] if "cook" is "Yes". MUST have 1-2 items if "cook" is "No".
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    let options = [];
    try {
      options = JSON.parse(text || '[]');
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json({ status: 'error', message: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', options });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

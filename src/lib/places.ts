export type NearbyPlace = {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
};

export async function searchNearbyRestaurants(area: string): Promise<NearbyPlace[]> {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key || !area.trim()) return [];

  try {
    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.set('near', area);
    url.searchParams.set('categories', '13000');
    url.searchParams.set('limit', '15');
    url.searchParams.set('sort', 'RELEVANCE');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: key,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Foursquare search failed:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return (data.results || [])
      .map((place: {
        name?: string;
        location?: { formatted_address?: string; address?: string; locality?: string };
        geocodes?: { main?: { latitude?: number; longitude?: number } };
      }) => ({
        name: place.name || '',
        address: place.location?.formatted_address
          || [place.location?.address, place.location?.locality].filter(Boolean).join(', '),
        lat: place.geocodes?.main?.latitude,
        lng: place.geocodes?.main?.longitude,
      }))
      .filter((place: NearbyPlace) => place.name);
  } catch (error) {
    console.error('Foursquare search error:', error);
    return [];
  }
}

export function matchNearbyPlace(name: string, places: NearbyPlace[]): NearbyPlace | undefined {
  const needle = name.toLowerCase().trim();
  if (!needle) return undefined;

  return (
    places.find((place) => place.name.toLowerCase() === needle) ||
    places.find((place) => {
      const hay = place.name.toLowerCase();
      return hay.includes(needle) || needle.includes(hay);
    })
  );
}

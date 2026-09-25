export function buildMapsSearchUrl(placeName: string, area?: string, address?: string) {
  const query = [placeName.trim(), address?.trim(), area?.trim(), 'Thailand']
    .filter(Boolean)
    .join(' ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildMapsCoordUrl(lat: number, lng: number, placeName?: string) {
  const query = placeName
    ? `${lat},${lng} (${placeName})`
    : `${lat},${lng}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

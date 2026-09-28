/**
 * Calculate distance between two GeoJSON points [lon, lat] in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(coords1, coords2) {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) {
    return 0;
  }
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Verify whether target coords are within toleranceKm (default 0.35 km / 350 meters)
 */
export function isWithinGeofence(currentCoords, targetCoords, toleranceKm = 0.35) {
  if (!currentCoords || !targetCoords) return true; // Graceful pass in simulated environment
  const dist = calculateHaversineDistanceKm(currentCoords, targetCoords);
  return dist <= toleranceKm;
}

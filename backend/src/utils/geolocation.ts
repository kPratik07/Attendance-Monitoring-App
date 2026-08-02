export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AttendanceCity extends Coordinates {
  name: string;
  state: string;
}

const EARTH_RADIUS_METERS = 6371000;

export const haversineDistanceMeters = (origin: Coordinates, destination: Coordinates) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);

  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

export const findNearestCity = (location: Coordinates, cities: AttendanceCity[]) => {
  let nearest = cities[0];
  let minDistance = haversineDistanceMeters(location, nearest);

  for (let i = 1; i < cities.length; i += 1) {
    const nextCity = cities[i];
    const nextDistance = haversineDistanceMeters(location, nextCity);
    if (nextDistance < minDistance) {
      minDistance = nextDistance;
      nearest = nextCity;
    }
  }

  return {
    city: nearest,
    distanceMeters: minDistance,
  };
};

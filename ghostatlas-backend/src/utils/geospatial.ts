/**
 * Geospatial utility functions for GhostAtlas Backend
 * Provides Haversine distance calculation, geohash encoding/decoding, and coordinate validation
 */

const BASE32_CHARS = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Validates if coordinates are within valid ranges
 * Latitude: -90 to 90 degrees
 * Longitude: -180 to 180 degrees
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns true if coordinates are valid, false otherwise
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }
  
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  
  return true;
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * 
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters
  
  // Convert degrees to radians
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLonRad = toRadians(lon2 - lon1);
  
  // Haversine formula
  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = EARTH_RADIUS_METERS * c;
  
  return distance;
}

/**
 * Encodes latitude and longitude into a geohash string
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param precision - Number of characters in the geohash (default: 6)
 * @returns Geohash string
 */
export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number = 6
): string {
  if (!validateCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates');
  }
  
  if (precision < 1 || precision > 12) {
    throw new Error('Precision must be between 1 and 12');
  }
  
  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;
  
  let latMin = -90.0;
  let latMax = 90.0;
  let lonMin = -180.0;
  let lonMax = 180.0;
  
  while (geohash.length < precision) {
    if (isEven) {
      // Longitude
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude > lonMid) {
        ch |= (1 << (4 - bit));
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      // Latitude
      const latMid = (latMin + latMax) / 2;
      if (latitude > latMid) {
        ch |= (1 << (4 - bit));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }
    
    isEven = !isEven;
    
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32_CHARS[ch];
      bit = 0;
      ch = 0;
    }
  }
  
  return geohash;
}

/**
 * Decodes a geohash string into latitude and longitude coordinates
 * Returns the center point of the geohash cell
 * 
 * @param geohash - Geohash string to decode
 * @returns Object containing latitude and longitude
 */
export function decodeGeohash(geohash: string): { latitude: number; longitude: number } {
  if (!geohash || typeof geohash !== 'string') {
    throw new Error('Invalid geohash');
  }
  
  const lowerGeohash = geohash.toLowerCase();
  
  let isEven = true;
  let latMin = -90.0;
  let latMax = 90.0;
  let lonMin = -180.0;
  let lonMax = 180.0;
  
  for (let i = 0; i < lowerGeohash.length; i++) {
    const char = lowerGeohash[i];
    const charIndex = BASE32_CHARS.indexOf(char);
    
    if (charIndex === -1) {
      throw new Error(`Invalid geohash character: ${char}`);
    }
    
    for (let bit = 4; bit >= 0; bit--) {
      const bitValue = (charIndex >> bit) & 1;
      
      if (isEven) {
        // Longitude
        const lonMid = (lonMin + lonMax) / 2;
        if (bitValue === 1) {
          lonMin = lonMid;
        } else {
          lonMax = lonMid;
        }
      } else {
        // Latitude
        const latMid = (latMin + latMax) / 2;
        if (bitValue === 1) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }
      
      isEven = !isEven;
    }
  }
  
  const latitude = (latMin + latMax) / 2;
  const longitude = (lonMin + lonMax) / 2;
  
  return { latitude, longitude };
}

/**
 * Gets the geohash prefix for a given radius around a point
 * Used for optimizing geospatial queries
 * 
 * @param latitude - Center latitude
 * @param longitude - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Geohash prefix length to use for queries
 */
export function getGeohashPrefixForRadius(
  latitude: number,
  longitude: number,
  radiusKm: number
): number {
  // Geohash precision to approximate area coverage
  // Precision 1: ±2500 km
  // Precision 2: ±630 km
  // Precision 3: ±78 km
  // Precision 4: ±20 km
  // Precision 5: ±2.4 km
  // Precision 6: ±0.61 km (610 meters)
  // Precision 7: ±0.076 km (76 meters)
  
  if (radiusKm > 630) return 1;
  if (radiusKm > 78) return 2;
  if (radiusKm > 20) return 3;
  if (radiusKm > 2.4) return 4;
  if (radiusKm > 0.61) return 5;
  if (radiusKm > 0.076) return 6;
  return 7;
}

import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { Platform } from 'react-native';

// Backend API base URL
const BACKEND_URL = typeof __DEV__ !== 'undefined' && __DEV__ 
  ? (Platform.OS === 'web' ? 'http://localhost:3001' : 'http://localhost:3001')
  : 'https://your-production-backend.com';

export interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface PlaceDetails extends Place {
  formatted_phone_number?: string;
  website?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

export type PlaceCategory =
  | 'restaurant'
  | 'attraction'
  | 'hotel'
  | 'shopping'
  | 'activity'
  | 'cafe'
  | 'bar'
  | 'museum'
  | 'park'
  | 'all';

const CATEGORY_TYPE_MAPPING: Record<PlaceCategory, string[]> = {
  restaurant: ['restaurant', 'food'],
  attraction: [
    'tourist_attraction',
    'point_of_interest',
    'landmark',
    'place_of_worship',
  ],
  hotel: ['lodging', 'hotel'],
  shopping: ['shopping_mall', 'store', 'clothing_store'],
  activity: ['amusement_park', 'aquarium', 'zoo', 'stadium'],
  cafe: ['cafe', 'bakery'],
  bar: ['bar', 'night_club'],
  museum: ['museum', 'art_gallery'],
  park: ['park', 'natural_feature'],
  all: [],
};

class PlacesService {
  private baseUrl = BACKEND_URL + '/api/v1/places';

  /**
   * Search for places using text query
   */
  async searchText(
    query: string,
    location?: { lat: number; lng: number },
    category: PlaceCategory = 'all'
  ): Promise<Place[]> {
    try {
      let url = `${this.baseUrl}/textsearch?query=${encodeURIComponent(query)}`;

      if (location) {
        url += `&location=${location.lat},${location.lng}`;
      }

      if (category !== 'all') {
        const types = CATEGORY_TYPE_MAPPING[category];
        if (types.length > 0) {
          url += `&type=${types[0]}`;
        }
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.results;
      } else if (data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        console.error('Places API error:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Search text error:', error);
      return [];
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearby(
    location: { lat: number; lng: number },
    radius: number = 5000,
    category: PlaceCategory = 'all',
    keyword?: string
  ): Promise<Place[]> {
    try {
      let url = `${this.baseUrl}/nearbysearch?location=${location.lat},${location.lng}&radius=${radius}`;

      if (category !== 'all') {
        const types = CATEGORY_TYPE_MAPPING[category];
        if (types.length > 0) {
          url += `&type=${types[0]}`;
        }
      }

      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.results;
      } else if (data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        console.error('Places API error:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Search nearby error:', error);
      return [];
    }
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/details?place_id=${placeId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.result;
      } else {
        console.error('Place details error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Get place details error:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(
    photoReference: string,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): string {
    return `${this.baseUrl}/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}&maxheight=${maxHeight}`;
  }

  /**
   * Autocomplete search
   */
  async autocomplete(
    input: string,
    location?: { lat: number; lng: number },
    radius: number = 50000
  ): Promise<
    Array<{
      place_id: string;
      description: string;
      structured_formatting: {
        main_text: string;
        secondary_text: string;
      };
    }>
  > {
    try {
      let url = `${this.baseUrl}/autocomplete?input=${encodeURIComponent(input)}`;

      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`;
      }

      console.log('Autocomplete URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Autocomplete response:', data);

      if (data.status === 'OK') {
        return data.predictions;
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('No autocomplete results found');
        return [];
      } else {
        console.error('Autocomplete API error:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Get popular attractions for a destination
   */
  async getPopularAttractions(
    destination: string,
    limit: number = 20
  ): Promise<Place[]> {
    try {
      const places = await this.searchText(
        `${destination} top attractions`,
        undefined,
        'attraction'
      );
      return places.slice(0, limit);
    } catch (error) {
      console.error('Get popular attractions error:', error);
      return [];
    }
  }

  /**
   * Filter places by rating
   */
  filterByRating(places: Place[], minRating: number = 4.0): Place[] {
    return places.filter((place) => (place.rating || 0) >= minRating);
  }

  /**
   * Sort places by rating
   */
  sortByRating(places: Place[], descending: boolean = true): Place[] {
    return [...places].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return descending ? ratingB - ratingA : ratingA - ratingB;
    });
  }

  /**
   * Sort places by distance
   */
  sortByDistance(
    places: Place[],
    userLocation: { lat: number; lng: number }
  ): Place[] {
    return [...places].sort((a, b) => {
      const distA = this.calculateDistance(
        userLocation,
        a.geometry.location
      );
      const distB = this.calculateDistance(
        userLocation,
        b.geometry.location
      );
      return distA - distB;
    });
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const placesService = new PlacesService();
export default placesService;

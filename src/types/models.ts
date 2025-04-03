
// Core entity types for the application

export type Language = 'ru' | 'en' | 'hi';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  favorites: {
    cities: string[];
    points: string[];
    routes: string[];
    events: string[];
  };
  ownedPoints: string[];
  ownedEvents: string[]; 
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface City {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  info?: Record<Language, string>;
  media?: MediaItem[];
  images?: string[];
  thumbnail: string;
  pointIds: string[];
  routeIds: string[];
  eventIds: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  // Added city statistics
  spots_count?: number;
  routes_count?: number;
  events_count?: number;
}

export interface Point {
  id: string;
  cityId: string;
  type: 'temple' | 'ashram' | 'kund' | 'other';
  name: Record<Language, string>;
  description: Record<Language, string>;
  media: MediaItem[];
  thumbnail: string;
  location: {
    latitude: number;
    longitude: number;
  };
  routeIds: string[];
  eventIds: string[];
  ownerId?: string;
}

export interface Route {
  id: string;
  cityId: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  media: MediaItem[];
  thumbnail: string;
  pointIds: string[];
  eventIds: string[];
  distance?: number; // In kilometers
  duration?: number; // In minutes
}

export interface Event {
  id: string;
  cityId: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  media: MediaItem[];
  thumbnail: string;
  pointIds: string[];
  startDate: string;
  endDate: string;
  ownerId?: string;
}

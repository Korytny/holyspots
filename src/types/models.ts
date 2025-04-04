// Core entity types for the application

export type Language = 'ru' | 'en' | 'hi';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
  // Add country field
  country?: string;
}

export interface GeoPoint {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Point {
  id: string;
  cityId: string;
  type: 'temple' | 'ashram' | 'kund' | 'other';
  name: Record<Language, string>;
  description: Record<Language, string>;
  media: MediaItem[];
  images?: string[];
  thumbnail: string;
  location: {
    latitude: number;
    longitude: number;
  };
  routeIds: string[];
  eventIds: string[];
  ownerId?: string;
  point?: GeoPoint;
}

export interface Route {
  id: string;
  cityId: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  thumbnail: string;
  pointIds: string[];
  eventIds: string[];
  media: MediaItem[];
  distance?: number;
  duration?: number;
  images?: string[];
}

export interface Event {
  id: string;
  cityId: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  thumbnail: string;
  pointIds: string[];
  startDate: string;
  endDate?: string;
  media: MediaItem[];
  type?: boolean;
  images?: string[];
}

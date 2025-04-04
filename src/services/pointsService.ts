
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, GeoPoint } from '../types/models';
import { Json } from '@/types/supabase';

// Helper function to parse JSON safely
const safeParseJson = (json: Json | null): any => {
  if (!json) return null;
  
  if (typeof json === 'object') return json;
  
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return json;
  }
};

export const fetchAllPoints = async (): Promise<Point[]> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*');
  
  if (error) throw error;
  
  return data?.map(spot => {
    const nameData = safeParseJson(spot.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
    const infoData = safeParseJson(spot.info) || { en: '', ru: '', hi: '' };
    const imagesData = safeParseJson(spot.images) || [];
    const coordinatesData = safeParseJson(spot.coordinates) || {};

    // Default fallbacks for coordinates
    let lat = 0, lng = 0;
    
    // Handle different types of coordinates data structure
    if (coordinatesData && typeof coordinatesData === 'object') {
      if ('latitude' in coordinatesData) {
        lat = parseFloat(coordinatesData.latitude) || 0;
        lng = parseFloat(coordinatesData.longitude) || 0;
      } else if (Array.isArray(coordinatesData) && coordinatesData.length >= 2) {
        // If it's an array like [lng, lat]
        lng = parseFloat(coordinatesData[0]) || 0;
        lat = parseFloat(coordinatesData[1]) || 0;
      }
    }
    
    // Create a GeoPoint for the coordinates
    const point: GeoPoint = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    
    // Create a location string for display purposes
    const location = `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    
    // Default to empty arrays if not present
    const routes = [] as string[];
    const events = [] as string[];
    
    return {
      id: spot.id,
      cityId: spot.city,
      type: spot.type === 1 ? 'temple' : 
            spot.type === 2 ? 'ashram' : 
            spot.type === 3 ? 'kund' : 'other',
      name: nameData as Record<Language, string>,
      description: infoData as Record<Language, string>,
      media: imagesData,
      thumbnail: Array.isArray(imagesData) && imagesData.length > 0 
        ? imagesData[0] 
        : 'placeholder.svg',
      images: Array.isArray(imagesData) ? imagesData : [],
      location,
      point,
      routes,
      events
    };
  }) || [];
};

export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', pointId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return null;
    }
    throw error;
  }
  
  if (!data) return null;
  
  const nameData = safeParseJson(data.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
  const infoData = safeParseJson(data.info) || { en: '', ru: '', hi: '' };
  const imagesData = safeParseJson(data.images) || [];
  const coordinatesData = safeParseJson(data.coordinates) || {};
  
  // Default fallbacks for coordinates
  let lat = 0, lng = 0;
  
  // Handle different types of coordinates data structure
  if (coordinatesData && typeof coordinatesData === 'object') {
    if ('latitude' in coordinatesData) {
      lat = parseFloat(coordinatesData.latitude) || 0;
      lng = parseFloat(coordinatesData.longitude) || 0;
    } else if (Array.isArray(coordinatesData) && coordinatesData.length >= 2) {
      // If it's an array like [lng, lat]
      lng = parseFloat(coordinatesData[0]) || 0;
      lat = parseFloat(coordinatesData[1]) || 0;
    }
  }
  
  // Create a GeoPoint for the coordinates
  const point: GeoPoint = {
    type: 'Point',
    coordinates: [lng, lat]
  };
  
  // Create a location string for display purposes
  const location = `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
  
  // Default to empty arrays if not present
  const routes = [] as string[];
  const events = [] as string[];
  
  const thumbnail = Array.isArray(imagesData) && imagesData.length > 0 
    ? imagesData[0] 
    : 'placeholder.svg';
  
  return {
    id: data.id,
    cityId: data.city,
    type: data.type === 1 ? 'temple' : 
          data.type === 2 ? 'ashram' : 
          data.type === 3 ? 'kund' : 'other',
    name: nameData as Record<Language, string>,
    description: infoData as Record<Language, string>,
    media: imagesData,
    thumbnail,
    images: Array.isArray(imagesData) ? imagesData : [],
    location,
    point,
    routes,
    events
  };
};

export const fetchPointsByCityId = async (cityId: string): Promise<Point[]> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('city', cityId);
  
  if (error) throw error;
  
  return data?.map(spot => {
    const nameData = safeParseJson(spot.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
    const infoData = safeParseJson(spot.info) || { en: '', ru: '', hi: '' };
    const imagesData = safeParseJson(spot.images) || [];
    const coordinatesData = safeParseJson(spot.coordinates) || {};

    // Default fallbacks for coordinates
    let lat = 0, lng = 0;
    
    // Handle different types of coordinates data structure
    if (coordinatesData && typeof coordinatesData === 'object') {
      if ('latitude' in coordinatesData) {
        lat = parseFloat(coordinatesData.latitude) || 0;
        lng = parseFloat(coordinatesData.longitude) || 0;
      } else if (Array.isArray(coordinatesData) && coordinatesData.length >= 2) {
        // If it's an array like [lng, lat]
        lng = parseFloat(coordinatesData[0]) || 0;
        lat = parseFloat(coordinatesData[1]) || 0;
      }
    }
    
    // Create a GeoPoint for the coordinates
    const point: GeoPoint = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    
    // Create a location string for display purposes
    const location = `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    
    // Default to empty arrays if not present
    const routes = [] as string[];
    const events = [] as string[];
    
    const thumbnail = Array.isArray(imagesData) && imagesData.length > 0 
      ? imagesData[0] 
      : 'placeholder.svg';
    
    return {
      id: spot.id,
      cityId: spot.city,
      type: spot.type === 1 ? 'temple' : 
            spot.type === 2 ? 'ashram' : 
            spot.type === 3 ? 'kund' : 'other',
      name: nameData as Record<Language, string>,
      description: infoData as Record<Language, string>,
      media: imagesData,
      thumbnail,
      images: Array.isArray(imagesData) ? imagesData : [],
      location,
      point,
      routes,
      events
    };
  }) || [];
};

export const fetchPointsByRouteId = async (routeId: string): Promise<Point[]> => {
  // Here we would need to query for spots that are associated with this route
  // This would require a function or a query to get spots by route ID
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

export const fetchPointsByEventId = async (eventId: string): Promise<Point[]> => {
  // Similar to fetchPointsByRouteId, this would require querying spots by event ID
  // Returning an empty array for now
  return [];
};


// Importing the necessary modules
import { supabase } from '@/integrations/supabase/client';
import { Route, Language } from '../types/models';
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

// Function to fetch all routes
export const fetchAllRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*');
  
  if (error) throw error;
  
  return data?.map(route => {
    const nameData = safeParseJson(route.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
    
    return {
      id: route.id,
      cityId: 'unknown', // Placeholder
      name: nameData as Record<Language, string>,
      description: { en: '', ru: '', hi: '' }, // Default empty description
      media: [],
      thumbnail: 'placeholder.svg',
      pointIds: [],
      distance: 0,
      duration: 0
    };
  }) || [];
};

// Function to fetch a route by ID
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  
  if (!data) return null;
  
  const nameData = safeParseJson(data.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
  
  return {
    id: data.id,
    cityId: 'unknown', // Placeholder
    name: nameData as Record<Language, string>,
    description: { en: '', ru: '', hi: '' }, // Default empty description
    media: [],
    thumbnail: 'placeholder.svg',
    pointIds: [],
    distance: 0,
    duration: 0
  };
};

// Function to fetch routes by city ID
export const fetchRoutesByCityId = async (cityId: string): Promise<Route[]> => {
  // This would require a query to get routes by city ID
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

// Function to fetch routes by point ID
export const fetchRoutesByPointId = async (pointId: string): Promise<Route[]> => {
  // This would require a query to get routes associated with a specific point
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

// Adding these aliases for compatibility
export const fetchRoutesByCity = fetchRoutesByCityId;
export const fetchRoutesBySpot = fetchRoutesByPointId;
export const fetchRoutesByEvent = async () => []; // Placeholder function
export const fetchSpotsByRoute = async () => []; // Placeholder function


import { supabase } from '../lib/supabase';
import { Route } from '../types/models';

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
  
  return data.map((routeData): Route => ({
    id: routeData.id.toString(),
    cityId: routeData.city?.toString() || '',
    name: routeData.name as Record<string, string>,
    description: routeData.info as Record<string, string>,
    media: routeData.media || [],
    thumbnail: routeData.images && routeData.images.length > 0 ? routeData.images[0] : '/placeholder.svg',
    pointIds: routeData.spots || [],
    eventIds: [],
    distance: routeData.distance,
    duration: routeData.duration,
  }));
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Route not found
    }
    console.error('Error fetching route:', error);
    throw error;
  }
  
  return {
    id: data.id.toString(),
    cityId: data.city?.toString() || '',
    name: data.name as Record<string, string>,
    description: data.info as Record<string, string>,
    media: data.media || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    pointIds: data.spots || [],
    eventIds: [],
    distance: data.distance,
    duration: data.duration,
  };
};

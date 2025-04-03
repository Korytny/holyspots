
import { supabase } from '../lib/supabase';
import { Route } from '../types/models';

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
  
  return data.map((routeData): Route => ({
    id: routeData.id,
    cityId: routeData.cityId,
    name: routeData.name as Record<string, string>,
    description: routeData.description as Record<string, string>,
    media: routeData.media as any[],
    thumbnail: routeData.thumbnail,
    pointIds: routeData.pointIds || [],
    eventIds: routeData.eventIds || [],
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
    id: data.id,
    cityId: data.cityId,
    name: data.name as Record<string, string>,
    description: data.description as Record<string, string>,
    media: data.media as any[],
    thumbnail: data.thumbnail,
    pointIds: data.pointIds || [],
    eventIds: data.eventIds || [],
    distance: data.distance,
    duration: data.duration,
  };
};

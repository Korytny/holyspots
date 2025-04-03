
import { supabase } from '../lib/supabase';
import { City } from '../types/models';

export const fetchCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('Cities')
    .select('*');
  
  if (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
  
  return data.map((cityData): City => ({
    id: cityData.id,
    name: cityData.name as Record<string, string>,
    description: cityData.description as Record<string, string>,
    info: cityData.info as Record<string, string>,
    media: cityData.media as any[],
    images: cityData.images as string[],
    thumbnail: cityData.thumbnail || '/placeholder.svg',
    pointIds: cityData.pointIds || [],
    routeIds: cityData.routeIds || [],
    eventIds: cityData.eventIds || [],
    location: cityData.location as any,
  }));
};

export const fetchCityById = async (cityId: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('Cities')
    .select('*')
    .eq('id', cityId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // City not found
    }
    console.error('Error fetching city:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name as Record<string, string>,
    description: data.description as Record<string, string>,
    info: data.info as Record<string, string>,
    media: data.media as any[],
    images: data.images as string[],
    thumbnail: data.thumbnail || '/placeholder.svg',
    pointIds: data.pointIds || [],
    routeIds: data.routeIds || [],
    eventIds: data.eventIds || [],
    location: data.location as any,
  };
};

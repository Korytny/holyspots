
import { supabase } from '../lib/supabase';
import { Point } from '../types/models';

export const fetchSpotsByCity = async (cityId: string): Promise<Point[]> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching spots:', error);
    throw error;
  }
  
  return data.map((spotData): Point => ({
    id: spotData.id.toString(),
    cityId: spotData.city?.toString() || '',
    type: spotData.spotypeng as 'temple' | 'ashram' | 'kund' | 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: spotData.media || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: spotData.latitude || 0,
      longitude: spotData.longitude || 0
    },
    routeIds: [],
    eventIds: [],
  }));
};

export const fetchSpotById = async (spotId: string): Promise<Point | null> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Spot not found
    }
    console.error('Error fetching spot:', error);
    throw error;
  }
  
  return {
    id: data.id.toString(),
    cityId: data.city?.toString() || '',
    type: data.spotypeng as 'temple' | 'ashram' | 'kund' | 'other',
    name: data.name as Record<string, string>,
    description: data.info as Record<string, string>,
    media: data.media || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    location: {
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    },
    routeIds: [],
    eventIds: [],
  };
};

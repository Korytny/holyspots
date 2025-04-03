
import { supabase } from '../lib/supabase';
import { Point } from '../types/models';

export const fetchSpotsByCity = async (cityId: string): Promise<Point[]> => {
  const { data, error } = await supabase
    .from('Spots')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching spots:', error);
    throw error;
  }
  
  return data.map((spotData): Point => ({
    id: spotData.id,
    cityId: spotData.cityId,
    type: spotData.type as 'temple' | 'ashram' | 'kund' | 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.description as Record<string, string>,
    media: spotData.media as any[],
    thumbnail: spotData.thumbnail,
    location: spotData.location as any,
    routeIds: spotData.routeIds || [],
    eventIds: spotData.eventIds || [],
    ownerId: spotData.ownerId,
  }));
};

export const fetchSpotById = async (spotId: string): Promise<Point | null> => {
  const { data, error } = await supabase
    .from('Spots')
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
    id: data.id,
    cityId: data.cityId,
    type: data.type as 'temple' | 'ashram' | 'kund' | 'other',
    name: data.name as Record<string, string>,
    description: data.description as Record<string, string>,
    media: data.media as any[],
    thumbnail: data.thumbnail,
    location: data.location as any,
    routeIds: data.routeIds || [],
    eventIds: data.eventIds || [],
    ownerId: data.ownerId,
  };
};

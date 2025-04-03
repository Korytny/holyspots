
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
    id: spotData.id,
    cityId: spotData.city || '',
    type: spotData.type ? mapSpotType(spotData.type) : 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: spotData.media || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: spotData.coordinates?.latitude || 0,
      longitude: spotData.coordinates?.longitude || 0
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
    id: data.id,
    cityId: data.city || '',
    type: data.type ? mapSpotType(data.type) : 'other',
    name: data.name as Record<string, string>,
    description: data.info as Record<string, string>,
    media: data.media || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    location: {
      latitude: data.coordinates?.latitude || 0,
      longitude: data.coordinates?.longitude || 0
    },
    routeIds: [],
    eventIds: [],
  };
};

// Helper function to map numeric spot types to string types
function mapSpotType(typeId: number): 'temple' | 'ashram' | 'kund' | 'other' {
  switch (typeId) {
    case 1:
      return 'temple';
    case 2:
      return 'ashram';
    case 3:
      return 'kund';
    default:
      return 'other';
  }
}

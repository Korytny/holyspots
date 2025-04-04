
import { supabase } from '../lib/supabase';
import { Point } from '../types/models';

export const fetchSpotsByCity = async (cityId: string): Promise<Point[]> => {
  console.log('Fetching spots for city:', cityId);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data.length} spots for city ${cityId}`);
  
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
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching spot:', error);
    throw error;
  }
  
  if (!data) return null;
  
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

export const fetchSpotsByIds = async (spotIds: string[]): Promise<Point[]> => {
  if (!spotIds || spotIds.length === 0) {
    return [];
  }
  
  console.log('Fetching spots by IDs:', spotIds);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', spotIds);
  
  if (error) {
    console.error('Error fetching spots by IDs:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data.length} spots by IDs`);
  
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

export const fetchSpotsByRoute = async (routeId: string): Promise<Point[]> => {
  console.log('Fetching spots for route:', routeId);
  
  // Use the spot_route relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('spot_route')
    .select('spot_id')
    .eq('route_id', routeId);
  
  if (relationError) {
    console.error('Error fetching spot-route relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const spotIds = relationData.map(relation => relation.spot_id);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', spotIds);
  
  if (error) {
    console.error('Error fetching spots for route:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} spots for route ${routeId}`);
  
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

export const fetchSpotsByEvent = async (eventId: string): Promise<Point[]> => {
  console.log('Fetching spots for event:', eventId);
  
  // Use the spot_event relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('spot_event')
    .select('spot_id')
    .eq('event_id', eventId);
  
  if (relationError) {
    console.error('Error fetching spot-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const spotIds = relationData.map(relation => relation.spot_id);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', spotIds);
  
  if (error) {
    console.error('Error fetching spots for event:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} spots for event ${eventId}`);
  
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

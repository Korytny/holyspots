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
  
  console.log(`Retrieved ${data?.length || 0} spots for city ${cityId}`);
  
  return data.map((spotData): Point => ({
    id: spotData.id,
    cityId: spotData.city || '',
    type: spotData.type === 1 ? 'temple' : 
          spotData.type === 2 ? 'ashram' : 
          spotData.type === 3 ? 'kund' : 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: [],
    images: spotData.images || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: spotData.coordinates?.latitude || 0,
      longitude: spotData.coordinates?.longitude || 0
    },
    point: spotData.point || {
      type: 'Point',
      coordinates: [spotData.coordinates?.longitude || 0, spotData.coordinates?.latitude || 0]
    },
    routeIds: spotData.routes || [],
    eventIds: spotData.events || []
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
    type: data.type === 1 ? 'temple' : 
          data.type === 2 ? 'ashram' : 
          data.type === 3 ? 'kund' : 'other',
    name: data.name as Record<string, string>,
    description: data.info as Record<string, string>,
    media: [],
    images: data.images || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    location: {
      latitude: data.coordinates?.latitude || 0,
      longitude: data.coordinates?.longitude || 0
    },
    point: data.point || {
      type: 'Point',
      coordinates: [data.coordinates?.longitude || 0, data.coordinates?.latitude || 0]
    },
    routeIds: data.routes || [],
    eventIds: data.events || []
  };
};

export const fetchAllSpots = async (): Promise<Point[]> => {
  console.log('Fetching all spots');
  
  const { data, error } = await supabase
    .from('spots')
    .select('*');
  
  if (error) {
    console.error('Error fetching all spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} total spots`);
  
  return data.map((spotData): Point => ({
    id: spotData.id,
    cityId: spotData.city || '',
    type: spotData.type === 1 ? 'temple' : 
          spotData.type === 2 ? 'ashram' : 
          spotData.type === 3 ? 'kund' : 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: [],
    images: spotData.images || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: spotData.coordinates?.latitude || 0,
      longitude: spotData.coordinates?.longitude || 0
    },
    point: spotData.point || {
      type: 'Point',
      coordinates: [spotData.coordinates?.longitude || 0, spotData.coordinates?.latitude || 0]
    },
    routeIds: spotData.routes || [],
    eventIds: spotData.events || []
  }));
};

export const fetchSpotsByRoute = async (routeId: string): Promise<Point[]> => {
  console.log('Fetching spots for route:', routeId);
  
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
    type: spotData.type === 1 ? 'temple' : 
          spotData.type === 2 ? 'ashram' : 
          spotData.type === 3 ? 'kund' : 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: [],
    images: spotData.images || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: spotData.coordinates?.latitude || 0,
      longitude: spotData.coordinates?.longitude || 0
    },
    point: spotData.point || {
      type: 'Point',
      coordinates: [spotData.coordinates?.longitude || 0, spotData.coordinates?.latitude || 0]
    },
    routeIds: spotData.routes || [],
    eventIds: spotData.events || []
  }));
};

export const fetchSpotsByEvent = async (eventId: string): Promise<Point[]> => {
  console.log('Fetching spots for event:', eventId);
  
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
    type: spotData.type === 1 ? 'temple' : 
          spotData.type === 2 ? 'ashram' : 
          spotData.type === 3 ? 'kund' : 'other',
    name: spotData.name as Record<string, string>,
    description: spotData.info as Record<string, string>,
    media: spotData.media || [],
    thumbnail: spotData.images && spotData.images.length > 0 ? spotData.images[0] : '/placeholder.svg',
    location: {
      latitude: (spotData.point?.coordinates?.[1] as number) || 0,
      longitude: (spotData.point?.coordinates?.[0] as number) || 0
    },
    routeIds: spotData.routes || [],
    eventIds: spotData.events || [],
    point: spotData.point
  }));
};

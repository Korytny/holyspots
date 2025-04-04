
import { supabase } from '../lib/supabase';
import { Route } from '../types/models';

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  console.log('Fetching routes for city:', cityId);
  
  // First, get all spots in the city
  const { data: citySpots, error: spotError } = await supabase
    .from('spots')
    .select('id')
    .eq('city', cityId);
  
  if (spotError) {
    console.error('Error fetching city spots:', spotError);
    throw spotError;
  }
  
  if (!citySpots || citySpots.length === 0) {
    return [];
  }
  
  // Get all route IDs that are connected to these spots
  const spotIds = citySpots.map(spot => spot.id);
  const { data: relationData, error: relationError } = await supabase
    .from('spot_route')
    .select('route_id')
    .in('spot_id', spotIds);
  
  if (relationError) {
    console.error('Error fetching spot-route relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  // Get unique route IDs
  const uniqueRouteIds = [...new Set(relationData.map(relation => relation.route_id))];
  
  // Fetch all these routes
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .in('id', uniqueRouteIds);
  
  if (error) {
    console.error('Error fetching routes for city spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} routes for city ${cityId} through spots`);
  
  return data.map((routeData): Route => ({
    id: routeData.id,
    cityId: routeData.city || '',
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
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    cityId: data.city || '',
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

export const fetchRoutesBySpot = async (spotId: string): Promise<Route[]> => {
  console.log('Fetching routes for spot:', spotId);
  
  // Use the spot_route relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('spot_route')
    .select('route_id')
    .eq('spot_id', spotId);
  
  if (relationError) {
    console.error('Error fetching spot-route relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const routeIds = relationData.map(relation => relation.route_id);
  
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .in('id', routeIds);
  
  if (error) {
    console.error('Error fetching routes for spot:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} routes for spot ${spotId}`);
  
  return data.map((routeData): Route => ({
    id: routeData.id,
    cityId: routeData.city || '',
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

export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  console.log('Fetching routes for event:', eventId);
  
  // Use the route_event relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('route_event')
    .select('route_id')
    .eq('event_id', eventId);
  
  if (relationError) {
    console.error('Error fetching route-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const routeIds = relationData.map(relation => relation.route_id);
  
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .in('id', routeIds);
  
  if (error) {
    console.error('Error fetching routes for event:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} routes for event ${eventId}`);
  
  return data.map((routeData): Route => ({
    id: routeData.id,
    cityId: routeData.city || '',
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

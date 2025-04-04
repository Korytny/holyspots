import { supabase } from '@/integrations/supabase/client';
import { Route, Language, Point, Event, GeoPoint } from '../types/models';
import { fetchPointById, fetchPointsByCity } from './pointsService';
import { fetchEventById } from './eventsService';

// Helper functions for fetching related entities
export const fetchPointsByIds = async (pointIds: string[]): Promise<Point[]> => {
  if (!pointIds.length) return [];
  
  const points = [];
  for (const id of pointIds) {
    const point = await fetchPointById(id);
    if (point) points.push(point);
  }
  
  return points;
};

export const fetchEventsByIds = async (eventIds: string[]): Promise<Event[]> => {
  if (!eventIds.length) return [];
  
  const events = [];
  for (const id of eventIds) {
    const event = await fetchEventById(id);
    if (event) events.push(event);
  }
  
  return events;
};

// Helper function to transform database route to app Route type
const transformRouteData = (item: any): Route => {
  // Create default language record with empty strings
  const defaultLangRecord: Record<Language, string> = {
    en: '',
    ru: '',
    hi: ''
  };
  
  // Get name with proper language structure or use default
  const name: Record<Language, string> = item.name && typeof item.name === 'object' 
    ? { ...defaultLangRecord, ...item.name }
    : defaultLangRecord;
  
  // Get description with proper language structure or use default
  const description: Record<Language, string> = item.info && typeof item.info === 'object'
    ? { ...defaultLangRecord, ...item.info }
    : defaultLangRecord;
  
  // Process point IDs
  let pointIds: string[] = [];
  if (item.spots && Array.isArray(item.spots)) {
    pointIds = item.spots.filter((spot: any) => typeof spot === 'string');
  }
  
  // Process event IDs
  let eventIds: string[] = [];
  if (item.events && Array.isArray(item.events)) {
    eventIds = item.events.filter((event: any) => typeof event === 'string');
  }
  
  // Get a valid thumbnail
  let thumbnail = '/placeholder.svg';
  if (item.image && typeof item.image === 'string') {
    thumbnail = item.image;
  }
  
  return {
    id: item.id,
    cityId: item.city || '',
    name,
    description,
    thumbnail,
    pointIds,
    eventIds,
    duration: item.duration || 0,
    distance: item.distance || 0,
    difficulty: item.difficulty || 'easy'
  };
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for city ID ${cityId}`);
      return [];
    }
    
    const routes: Route[] = data.map(item => transformRouteData(item));
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      console.log(`No route found with ID ${routeId}`);
      return null;
    }
    
    const route = transformRouteData(data);
    
    // Fetch associated points
    const points = await fetchPointsByIds(route.pointIds);
    
    // Fetch associated events
    const events = await fetchEventsByIds(route.eventIds);
    
    return route;
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("No routes found");
      return [];
    }
    
    const routes: Route[] = data.map(item => transformRouteData(item));
    
    return routes;
  } catch (error) {
    console.error('Error fetching all routes:', error);
    return [];
  }
};

export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .contains('spots', [pointId]);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for point ID ${pointId}`);
      return [];
    }
    
    const routes: Route[] = data.map(item => transformRouteData(item));
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for point ID ${pointId}:`, error);
    return [];
  }
};

export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .contains('events', [eventId]);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for event ID ${eventId}`);
      return [];
    }
    
    const routes: Route[] = data.map(item => transformRouteData(item));
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for event ID ${eventId}:`, error);
    return [];
  }
};

// Keeping for backward compatibility
export const fetchRoutesByCityId = fetchRoutesByCity;

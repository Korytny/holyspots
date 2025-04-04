
import { supabase } from '../integrations/supabase/client';
import { Route } from '../types/models';
import { Json } from '../types/supabase';

// Function to fetch all routes
export const fetchRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
    
    // Transform the raw data into Route objects
    const routes: Route[] = data.map(route => ({
      id: route.id,
      name: route.name as Record<string, string>,
      description: route.info as Record<string, string> || {},
      cityId: route.city || null,
      duration: route.duration || null,
      difficulty: route.difficulty as string || null,
      distance: route.distance || null,
      thumbnail: Array.isArray(route.images) && route.images.length > 0 
        ? route.images[0] as string 
        : 'placeholder.svg',
      media: route.images || [],
      pointIds: route.points as string[] || []
    }));
    
    return routes;
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return [];
  }
};

// Function to fetch a route by ID
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
    
    if (error) {
      console.error(`Error fetching route ${routeId}:`, error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Transform the raw data into a Route object
    const route: Route = {
      id: data.id,
      name: data.name as Record<string, string>,
      description: data.info as Record<string, string> || {},
      cityId: data.city || null,
      duration: data.duration || null,
      difficulty: data.difficulty as string || null,
      distance: data.distance || null,
      thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] as string 
        : 'placeholder.svg',
      media: data.images || [],
      pointIds: data.points as string[] || []
    };
    
    return route;
  } catch (error) {
    console.error(`Failed to fetch route ${routeId}:`, error);
    return null;
  }
};

// Function to fetch routes by city ID
export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);
    
    if (error) {
      console.error(`Error fetching routes for city ${cityId}:`, error);
      throw error;
    }
    
    // Transform the raw data into Route objects
    const routes: Route[] = data.map(route => ({
      id: route.id,
      name: route.name as Record<string, string>,
      description: route.info as Record<string, string> || {},
      cityId: route.city || null,
      duration: route.duration || null,
      difficulty: route.difficulty as string || null,
      distance: route.distance || null,
      thumbnail: Array.isArray(route.images) && route.images.length > 0 
        ? route.images[0] as string 
        : 'placeholder.svg',
      media: route.images || [],
      pointIds: route.points as string[] || []
    }));
    
    return routes;
  } catch (error) {
    console.error(`Failed to fetch routes for city ${cityId}:`, error);
    return [];
  }
};

// Function to fetch routes by event ID
export const fetchRoutesByEventId = async (eventId: string): Promise<Route[]> => {
  try {
    // First, get the event to find its associated routes
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('routes')
      .eq('id', eventId)
      .single();
    
    if (eventError || !eventData || !eventData.routes || !Array.isArray(eventData.routes)) {
      console.error(`Error fetching routes for event ${eventId}:`, eventError);
      return [];
    }
    
    const routeIds = eventData.routes as string[];
    
    if (routeIds.length === 0) {
      return [];
    }
    
    // Then, fetch all those routes
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) {
      console.error(`Error fetching routes for event ${eventId}:`, error);
      return [];
    }
    
    // Transform the raw data into Route objects
    const routes: Route[] = data.map(route => ({
      id: route.id,
      name: route.name as Record<string, string>,
      description: route.info as Record<string, string> || {},
      cityId: route.city || null,
      duration: route.duration || null,
      difficulty: route.difficulty as string || null,
      distance: route.distance || null,
      thumbnail: Array.isArray(route.images) && route.images.length > 0 
        ? route.images[0] as string 
        : 'placeholder.svg',
      media: route.images || [],
      pointIds: route.points as string[] || []
    }));
    
    return routes;
  } catch (error) {
    console.error(`Failed to fetch routes for event ${eventId}:`, error);
    return [];
  }
};

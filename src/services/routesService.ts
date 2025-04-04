
import { supabase } from '../lib/supabase';
import { Route, Language } from '../types/models';

// Basic function to transform data from DB to Route model
const transformRouteData = (routeData: any): Route => {
  // Process name
  let parsedName: Record<Language, string> = { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' };
  try {
    if (typeof routeData.name === 'string') {
      parsedName = JSON.parse(routeData.name);
    } else if (routeData.name && typeof routeData.name === 'object') {
      parsedName = routeData.name;
    }
  } catch (e) {
    console.warn('Could not parse route name:', e);
  }
  
  // Process description
  let parsedDescription: Record<Language, string> = { en: '', ru: '', hi: '' };
  try {
    if (typeof routeData.info === 'string') {
      parsedDescription = JSON.parse(routeData.info);
    } else if (routeData.info && typeof routeData.info === 'object') {
      parsedDescription = routeData.info;
    }
  } catch (e) {
    console.warn('Could not parse route description:', e);
  }
  
  return {
    id: routeData.id,
    cityId: routeData.city_id || '',
    name: parsedName,
    description: parsedDescription,
    media: [],
    thumbnail: '/placeholder.svg',
    pointIds: [], // Will be filled in by another function
    eventIds: [],
    distance: routeData.distance || 0,
    duration: routeData.duration || 0
  };
};

// Function to get all routes
export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

// Function to get a route by ID
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    // Get related point IDs from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);
    
    if (junctionError) throw junctionError;
    
    const routeObj = transformRouteData(data);
    if (junctionData && junctionData.length > 0) {
      routeObj.pointIds = junctionData.map(item => item.spot_id);
    }
    
    return routeObj;
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

// Function to get routes by city
export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city_id', cityId);
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for city ${cityId}:`, error);
    return [];
  }
};

// Function to get routes containing a specific point
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    // Get route IDs from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (junctionError) throw junctionError;
    if (!junctionData || junctionData.length === 0) return [];
    
    const routeIds = junctionData.map(item => item.route_id);
    
    // Get the actual routes
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for point ${pointId}:`, error);
    return [];
  }
};

// Function to get routes related to an event
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // Get route IDs from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (junctionError) throw junctionError;
    if (!junctionData || junctionData.length === 0) return [];
    
    const routeIds = junctionData.map(item => item.route_id);
    
    // Get the actual routes
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for event ${eventId}:`, error);
    return [];
  }
};

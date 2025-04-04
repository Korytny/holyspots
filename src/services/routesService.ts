
import { supabase } from '@/integrations/supabase/client';
import { Language } from '@/types/models';
import { Json } from '@/types/supabase';
import { Route, Point } from '../types/models';
import { fetchPointsByIds } from './pointsService';
import { fetchEventsByIds } from './eventsService';

// Helper function to transform route data from Supabase to our Route type
const transformRouteData = async (routeData: { id: string; name: Json }[]): Promise<Route[]> => {
  const routes: Route[] = [];
  
  for (const route of routeData) {
    // Fetch spot-route associations to get point IDs
    const { data: spotRouteData } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', route.id);
    
    const pointIds = spotRouteData?.map(sr => sr.spot_id) || [];
    
    // Fetch route-event associations to get event IDs
    const { data: routeEventData } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', route.id);
      
    const eventIds = routeEventData?.map(re => re.event_id) || [];
    
    // Convert the name field to the expected format
    const nameField = route.name as Record<Language, string> || {};
    
    // Build the route object
    routes.push({
      id: route.id,
      name: nameField,
      description: {}, // Default empty description
      pointIds: pointIds,
      eventIds: eventIds,
      points: [], // This will be populated later if needed
      events: [], // This will be populated later if needed
      media: [], // No media by default
      thumbnail: null, // No thumbnail by default
      cityId: null // No city ID by default
    });
  }
  
  return routes;
};

export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching all routes:', error);
      return [];
    }
    
    return transformRouteData(data || []);
  } catch (error) {
    console.error('Error in fetchAllRoutes:', error);
    return [];
  }
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    // First get all spots (points) for the city
    const { data: cityPoints, error: pointsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);
      
    if (pointsError || !cityPoints?.length) {
      console.error('Error fetching city points:', pointsError);
      return [];
    }
    
    const pointIds = cityPoints.map(point => point.id);
    
    // Then get all routes that contain these points
    const { data: spotRouteData, error: spotRouteError } = await supabase
      .from('spot_route')
      .select('route_id')
      .in('spot_id', pointIds);
      
    if (spotRouteError || !spotRouteData?.length) {
      console.error('Error fetching spot-route associations:', spotRouteError);
      return [];
    }
    
    // Get unique route IDs
    const routeIds = [...new Set(spotRouteData.map(sr => sr.route_id))];
    
    // Finally, get the route details
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('id, name')
      .in('id', routeIds);
      
    if (routesError) {
      console.error('Error fetching routes by city:', routesError);
      return [];
    }
    
    return transformRouteData(routesData || []);
  } catch (error) {
    console.error('Error in fetchRoutesByCity:', error);
    return [];
  }
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('id, name')
      .eq('id', routeId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching route by ID:', error);
      return null;
    }
    
    const routes = await transformRouteData([data]);
    if (!routes.length) return null;
    
    const route = routes[0];
    
    // Fetch the actual point objects
    if (route.pointIds.length > 0) {
      route.points = await fetchPointsByIds(route.pointIds);
    }
    
    // Fetch the actual event objects
    if (route.eventIds.length > 0) {
      route.events = await fetchEventsByIds(route.eventIds);
    }
    
    return route;
  } catch (error) {
    console.error('Error in fetchRouteById:', error);
    return null;
  }
};

// Add this function to support the imports in PointDetail.tsx
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    // Get all routes that contain this point
    const { data: spotRouteData, error: spotRouteError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
      
    if (spotRouteError || !spotRouteData?.length) {
      console.error('Error fetching spot-route associations:', spotRouteError);
      return [];
    }
    
    // Get unique route IDs
    const routeIds = [...new Set(spotRouteData.map(sr => sr.route_id))];
    
    // Get the route details
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('id, name')
      .in('id', routeIds);
      
    if (routesError) {
      console.error('Error fetching routes by point:', routesError);
      return [];
    }
    
    return transformRouteData(routesData || []);
  } catch (error) {
    console.error('Error in fetchRoutesByPoint:', error);
    return [];
  }
};

// Alias for backward compatibility
export const fetchRoutes = fetchAllRoutes;

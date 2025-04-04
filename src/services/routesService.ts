
import { supabase } from '../integrations/supabase/client';
import { formatRoute } from './utils/routeTransformers';
import { Route } from '../types/models';
import { fetchPointsByIds, fetchEventsByIds } from './utils/commonHelpers';

/**
 * Fetches all available routes
 */
export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    // Map and format the route data
    const formattedRoutes = await Promise.all(
      data.map(async (route) => {
        return formatRoute(route);
      })
    );
    
    return formattedRoutes;
  } catch (error) {
    console.error('Error in fetchAllRoutes:', error);
    return [];
  }
};

// Alias for backward compatibility
export const fetchRoutes = fetchAllRoutes;

/**
 * Fetches a specific route by ID
 */
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  if (!routeId) {
    console.error('No route ID provided');
    return null;
  }
  
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
      console.log(`No route found with ID ${routeId}`);
      return null;
    }
    
    // Format the route data
    const formattedRoute = await formatRoute(data);
    
    // Fetch related points and events
    if (formattedRoute.pointIds.length > 0) {
      formattedRoute.points = await fetchPointsByIds(formattedRoute.pointIds);
    }
    
    if (formattedRoute.eventIds.length > 0) {
      formattedRoute.events = await fetchEventsByIds(formattedRoute.eventIds);
    }
    
    return formattedRoute;
  } catch (error) {
    console.error(`Error in fetchRouteById (${routeId}):`, error);
    return null;
  }
};

/**
 * Fetches routes for a specific city
 */
export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  if (!cityId) {
    console.error('No city ID provided');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city_id', cityId);
    
    if (error) {
      console.error(`Error fetching routes for city ${cityId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No routes found for city ${cityId}`);
      return [];
    }
    
    // Map and format the route data
    const formattedRoutes = await Promise.all(
      data.map(async (route) => {
        return formatRoute(route);
      })
    );
    
    return formattedRoutes;
  } catch (error) {
    console.error(`Error in fetchRoutesByCity (${cityId}):`, error);
    return [];
  }
};

/**
 * Fetches routes for a specific point
 */
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  if (!pointId) {
    console.error('No point ID provided');
    return [];
  }
  
  try {
    // Check if the spot_route table exists in our database
    const { data, error } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (error) {
      console.error(`Error fetching route IDs for point ${pointId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No routes found for point ${pointId}`);
      return [];
    }
    
    // Extract route IDs
    const routeIds = data.map(item => item.route_id);
    
    // Fetch each route
    const routePromises = routeIds.map(id => fetchRouteById(id));
    const routes = await Promise.all(routePromises);
    
    // Filter out any null routes
    return routes.filter(route => route !== null) as Route[];
  } catch (error) {
    console.error(`Error in fetchRoutesByPoint (${pointId}):`, error);
    return [];
  }
};

/**
 * Fetches routes for a specific event
 */
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  if (!eventId) {
    console.error('No event ID provided');
    return [];
  }
  
  try {
    // Using the correct table name from the database
    const { data, error } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (error) {
      console.error(`Error fetching route IDs for event ${eventId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No routes found for event ${eventId}`);
      return [];
    }
    
    // Extract route IDs
    const routeIds = data.map(item => item.route_id);
    
    // Fetch each route
    const routePromises = routeIds.map(id => fetchRouteById(id));
    const routes = await Promise.all(routePromises);
    
    // Filter out any null routes
    return routes.filter(route => route !== null) as Route[];
  } catch (error) {
    console.error(`Error in fetchRoutesByEvent (${eventId}):`, error);
    return [];
  }
};

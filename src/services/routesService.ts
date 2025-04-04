
import { supabase } from '@/integrations/supabase/client';
import { Route, Language, MediaItem } from '../types/models';

export const fetchRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("No routes found");
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = data.map(item => {
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      let media: MediaItem[] = [];

      return {
        id: item.id,
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        cityId: '',
        thumbnail,
        media,
        pointIds: [],
        eventIds: []
      };
    });
    
    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No route found with ID ${routeId}`);
        return null;
      }
      throw error;
    }
    
    if (!data) {
      console.log(`No route found with ID ${routeId}`);
      return null;
    }
    
    // Get a valid thumbnail
    let thumbnail = '/placeholder.svg';
    let media: MediaItem[] = [];

    const route: Route = {
      id: data.id,
      name: data.name as Record<Language, string>,
      description: {} as Record<Language, string>,
      cityId: '',
      thumbnail,
      media,
      pointIds: [],
      eventIds: []
    };
    
    return route;
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    // Query to get all routes that contain spots from this city
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id, routes')
      .eq('city', cityId);
    
    if (spotsError) throw spotsError;
    
    if (!spots || spots.length === 0) {
      console.log(`No spots found for city ID ${cityId}`);
      return [];
    }
    
    // Extract unique route IDs from all spots
    const routeIds = new Set<string>();
    spots.forEach(spot => {
      if (spot.routes && Array.isArray(spot.routes)) {
        spot.routes.forEach((routeId: string) => routeIds.add(routeId));
      }
    });
    
    if (routeIds.size === 0) {
      console.log(`No routes found for city ID ${cityId}`);
      return [];
    }
    
    // Fetch the routes by their IDs
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', Array.from(routeIds));
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found with IDs ${Array.from(routeIds).join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = data.map(item => {
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      let media: MediaItem[] = [];
      
      return {
        id: item.id,
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        cityId,
        thumbnail,
        media,
        pointIds: [],
        eventIds: []
      };
    });
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    // Query the join table to get routes associated with this spot
    const { data, error } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for spot ID ${pointId}`);
      return [];
    }
    
    const routeIds = data.map(item => item.route_id);
    
    // Fetch the routes by their IDs
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) throw routesError;
    
    if (!routesData || routesData.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = routesData.map(item => {
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      let media: MediaItem[] = [];
      
      return {
        id: item.id,
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        cityId: '',
        thumbnail,
        media,
        pointIds: [pointId],
        eventIds: []
      };
    });
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for spot ID ${pointId}:`, error);
    return [];
  }
};

export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // Query the join table to get routes associated with this event
    const { data, error } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for event ID ${eventId}`);
      return [];
    }
    
    const routeIds = data.map(item => item.route_id);
    
    // Fetch the routes by their IDs
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) throw routesError;
    
    if (!routesData || routesData.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = routesData.map(item => {
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      let media: MediaItem[] = [];
      
      return {
        id: item.id,
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        cityId: '',
        thumbnail,
        media,
        pointIds: [],
        eventIds: [eventId]
      };
    });
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for event ID ${eventId}:`, error);
    return [];
  }
};

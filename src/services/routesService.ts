
import { supabase } from '@/integrations/supabase/client';
import { Route, Language, MediaItem } from '../types/models';

// Add the alias for backward compatibility
export const fetchRoutesByEventId = fetchRoutesByEvent;

export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // First query the join table to get route IDs
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (joinError) throw joinError;
    
    if (!joinData || joinData.length === 0) {
      console.log(`No routes found for event ID ${eventId}`);
      return [];
    }
    
    // Extract the route IDs
    const routeIds = joinData.map(item => item.route_id);
    
    // Get the routes data
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = data.map(item => {
      // Create media items
      let mediaItems: MediaItem[] = [];
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [],
        eventIds: [eventId],
        distance: 0,
        duration: 0
      };
    });
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for event ID ${eventId}:`, error);
    return [];
  }
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    // Get all routes for this city through spots
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);
    
    if (spotsError) throw spotsError;
    
    if (!spots || spots.length === 0) {
      console.log(`No spots found for city ID ${cityId}`);
      return [];
    }
    
    // Get spot IDs
    const spotIds = spots.map(spot => spot.id);
    
    // Get route IDs through spot_route join table
    const { data: spotRoutes, error: spotRoutesError } = await supabase
      .from('spot_route')
      .select('route_id')
      .in('spot_id', spotIds);
    
    if (spotRoutesError) throw spotRoutesError;
    
    if (!spotRoutes || spotRoutes.length === 0) {
      console.log(`No routes found for city ID ${cityId} via spots`);
      return [];
    }
    
    // Get unique route IDs
    const routeIds = [...new Set(spotRoutes.map(item => item.route_id))];
    
    // Fetch routes by IDs
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = data.map(item => {
      // Create media items
      let mediaItems: MediaItem[] = [];
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      
      return {
        id: item.id,
        cityId,
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [],
        eventIds: [],
        distance: 0,
        duration: 0
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
    // Query the join table to get route IDs associated with this point
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (joinError) throw joinError;
    
    if (!joinData || joinData.length === 0) {
      console.log(`No routes found for point ID ${pointId}`);
      return [];
    }
    
    // Extract route IDs
    const routeIds = joinData.map(item => item.route_id);
    
    // Get the routes data
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Route objects
    const routes: Route[] = data.map(item => {
      // Create media items
      let mediaItems: MediaItem[] = [];
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [pointId],
        eventIds: [],
        distance: 0,
        duration: 0
      };
    });
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for point ID ${pointId}:`, error);
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
    
    // Create media items
    let mediaItems: MediaItem[] = [];
    
    // Get a valid thumbnail
    let thumbnail = '/placeholder.svg';
    
    const route: Route = {
      id: data.id,
      cityId: '',
      name: data.name as Record<Language, string>,
      description: {} as Record<Language, string>,
      media: mediaItems,
      thumbnail,
      pointIds: [],
      eventIds: [],
      distance: 0,
      duration: 0
    };
    
    return route;
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

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
      // Create media items
      let mediaItems: MediaItem[] = [];
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: {} as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [],
        eventIds: [],
        distance: 0,
        duration: 0
      };
    });
    
    return routes;
  } catch (error) {
    console.error('Error fetching all routes:', error);
    return [];
  }
};

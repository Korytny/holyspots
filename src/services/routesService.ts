import { supabase } from '@/integrations/supabase/client';
import { Route, Language, MediaItem } from '../types/models';
import { Json } from '@/integrations/supabase/types';

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
    
    const routes: Route[] = data.map(item => ({
      id: item.id,
      cityId: '', // Will need to be populated if routes are associated with cities
      name: item.name as Record<Language, string>,
      description: {
        en: '',
        ru: '',
        hi: '',
        ...((item.name as any)?.description || {})
      },
      media: [],
      thumbnail: '/placeholder.svg', // Default placeholder
      pointIds: [],
      eventIds: [], // Initialize with empty array
      distance: 0,
      duration: 0
    }));
    
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
    
    const route: Route = {
      id: data.id,
      cityId: '', // Will need to be populated if routes are associated with cities
      name: data.name as Record<Language, string>,
      description: {
        en: '',
        ru: '',
        hi: '',
        ...((data.name as any)?.description || {})
      },
      media: [],
      thumbnail: '/placeholder.svg', // Default placeholder
      pointIds: [],
      eventIds: [], // Initialize with empty array
      distance: 0,
      duration: 0
    };
    
    return route;
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

export const fetchRoutesByCityId = async (cityId: string): Promise<Route[]> => {
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
    
    const routes: Route[] = data.map(item => ({
      id: item.id,
      cityId: cityId,
      name: item.name as Record<Language, string>,
      description: {
        en: '',
        ru: '',
        hi: '',
        ...((item.name as any)?.description || {})
      },
      media: [],
      thumbnail: '/placeholder.svg', // Default placeholder
      pointIds: [],
      eventIds: [], // Initialize with empty array
      distance: 0,
      duration: 0
    }));
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchRoutesByCity = fetchRoutesByCityId;

export const fetchRoutesByEventId = async (eventId: string): Promise<Route[]> => {
  try {
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
    
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) throw routesError;
    
    if (!routesData || routesData.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    const routes: Route[] = routesData.map(item => {
      const name = (typeof item.name === 'object' && item.name !== null) 
        ? item.name as Record<Language, string>
        : { en: 'Unnamed Route', ru: 'Безымянный маршрут', hi: 'अनाम मार्ग' };
      
      const description = (typeof item.description === 'object' && item.description !== null)
        ? item.description as Record<Language, string>
        : { en: '', ru: '', hi: '' };
      
      const media: MediaItem[] = [];
      
      return {
        id: item.id,
        cityId: '',
        name,
        description,
        media,
        thumbnail: '/placeholder.svg',
        pointIds: [],
        eventIds: [],
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

export const fetchRoutesByEvent = fetchRoutesByEventId;

export const fetchRoutesByPointId = async (pointId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for point ID ${pointId}`);
      return [];
    }
    
    const routeIds = data.map(item => item.route_id);
    
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) throw routesError;
    
    if (!routesData || routesData.length === 0) {
      console.log(`No routes found with IDs ${routeIds.join(', ')}`);
      return [];
    }
    
    const routes: Route[] = routesData.map(item => ({
      id: item.id,
      cityId: '', // Will need to be populated if routes are associated with cities
      name: item.name as Record<Language, string>,
      description: {
        en: '',
        ru: '',
        hi: '',
        ...((item.name as any)?.description || {})
      },
      media: [],
      thumbnail: '/placeholder.svg', // Default placeholder
      pointIds: [pointId], // Include the point ID
      eventIds: [], // Empty array for event IDs
      distance: 0,
      duration: 0
    }));
    
    return routes;
  } catch (error) {
    console.error(`Error fetching routes for point ID ${pointId}:`, error);
    return [];
  }
};

export const fetchRoutesBySpot = fetchRoutesByPointId;

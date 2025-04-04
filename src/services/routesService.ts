
import { supabase } from '@/integrations/supabase/client';
import { Route, Language } from '../types/models';

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
    
    // Transform database records to Route objects
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
    
    // Transform database record to Route object
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
    // This would need to be updated based on how routes are associated with cities in your database
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No routes found for city ID ${cityId}`);
      return [];
    }
    
    // Transform database records to Route objects
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

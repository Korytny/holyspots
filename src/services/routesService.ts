import { supabase } from '../integrations/supabase/client';
import { Route, Language, MediaItem, Json } from '../types/models';

// Правильно объявляем fetchRoutesByEvent перед использованием
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  // Код этой функции будет реализован ниже
  try {
    const { data, error } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error fetching routes by event:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const routeIds = data.map(item => item.route_id);
    const routes = await Promise.all(routeIds.map(id => fetchRouteById(id)));
    
    return routes.filter(route => route !== null) as Route[];
  } catch (error) {
    console.error('Error in fetchRoutesByEvent:', error);
    return [];
  }
};

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

    return data.map(route => ({
      id: route.id,
      name: route.name as Record<Language, string>,
      description: route.info as Record<Language, string> || {},
      points: [],
      media: [],
	  thumbnail: Array.isArray(route.images) && route.images.length > 0 
        ? route.images[0] 
        : '/placeholder.svg',
      cityId: route.city || null
    }));
  } catch (error) {
    console.error('Error in fetchAllRoutes:', error);
    return [];
  }
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);

    if (error) {
      console.error('Error fetching routes by city:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(route => ({
      id: route.id,
      name: route.name as Record<Language, string>,
      description: route.info as Record<Language, string> || {},
      points: [],
      media: [],
	  thumbnail: Array.isArray(route.images) && route.images.length > 0 
        ? route.images[0] 
        : '/placeholder.svg',
      cityId: route.city || null
    }));
  } catch (error) {
    console.error('Error in fetchRoutesByCity:', error);
    return [];
  }
};

// Реализация fetchRouteById
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
    
    if (error) {
      console.error('Error fetching route by id:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Преобразование данных из базы в формат Route
    const route: Route = {
      id: data.id,
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string> || {},
      points: [],
      media: [],
      thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : '/placeholder.svg',
      cityId: data.city || null
    };
    
    return route;
  } catch (error) {
    console.error('Error in fetchRouteById:', error);
    return null;
  }
};

export const updateRoute = async (routeId: string, updates: Partial<Route>): Promise<Route | null> => {
  try {
    // Prepare the updates object for Supabase, mapping our Route properties to database columns
    const supabaseUpdates: {
      name?: Json;
      info?: Json;
      images?: string[];
      city?: string | null;
    } = {};

    if (updates.name) {
      supabaseUpdates.name = updates.name;
    }
    if (updates.description) {
      supabaseUpdates.info = updates.description;
    }
    // Assuming media URLs are stored as an array of strings in the 'images' column
    if (updates.media) {
      supabaseUpdates.images = updates.media.map(mediaItem => mediaItem.url);
    }
    if (updates.cityId !== undefined) {
      supabaseUpdates.city = updates.cityId;
    }

    const { data, error } = await supabase
      .from('routes')
      .update(supabaseUpdates)
      .eq('id', routeId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating route:', error);
      return null;
    }

    if (!data) {
      console.log('Route not found after update');
      return null;
    }

    // Transform the database row to our Route model
    const updatedRoute: Route = {
      id: data.id,
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string> || {},
      points: [], // You might need to fetch these separately
      media: [], // You might need to fetch these separately
	  thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : '/placeholder.svg',
      cityId: data.city || null,
    };

    return updatedRoute;
  } catch (error) {
    console.error('Error updating route:', error);
    return null;
  }
};


import { supabase } from '../integrations/supabase/client';
import { Route, Language, MediaItem, Json } from '../types/models';

// Helper function to transform database route to the Route type
const transformRouteData = (data: any): Route => {
  // Create a default description object if info is missing
  const description: Record<Language, string> = data.info as Record<Language, string> || { en: '', ru: '', hi: '' };
  
  // Set up empty arrays for points and events if missing
  const pointIds: string[] = [];
  const eventIds: string[] = [];
  
  // Get thumbnail from images if available
  const thumbnail = Array.isArray(data.images) && data.images.length > 0 
    ? data.images[0] 
    : '/placeholder.svg';
  
  // Create media items from images
  const media: MediaItem[] = [];
  if (Array.isArray(data.images)) {
    data.images.forEach((url: string, index: number) => {
      if (typeof url === 'string') {
        media.push({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        });
      }
    });
  }
  
  return {
    id: data.id,
    name: data.name as Record<Language, string>,
    description,
    points: [],
    media,
    thumbnail,
    cityId: data.city || null,
    pointIds,
    eventIds
  };
};

// Function to fetch all routes
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

    return data.map(route => transformRouteData(route));
  } catch (error) {
    console.error('Error in fetchAllRoutes:', error);
    return [];
  }
};

// For backward compatibility
export const fetchRoutes = fetchAllRoutes;

// Fetch routes by city
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

    return data.map(route => transformRouteData(route));
  } catch (error) {
    console.error('Error in fetchRoutesByCity:', error);
    return [];
  }
};

// Fetch routes associated with a point
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    // First, query the join table to get route IDs
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (joinError) {
      console.error('Error fetching routes for point:', joinError);
      return [];
    }
    
    if (!joinData || joinData.length === 0) {
      return [];
    }
    
    // Extract route IDs
    const routeIds = joinData.map(item => item.route_id);
    
    // Now fetch the actual routes
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) {
      console.error('Error fetching routes by IDs:', error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    return data.map(route => transformRouteData(route));
  } catch (error) {
    console.error('Error in fetchRoutesByPoint:', error);
    return [];
  }
};

// Fetch a route by ID
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
    
    return transformRouteData(data);
  } catch (error) {
    console.error('Error in fetchRouteById:', error);
    return null;
  }
};

// Fetch routes associated with an event
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // First, query the join table to get route IDs
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (joinError) {
      console.error('Error fetching routes for event:', joinError);
      return [];
    }
    
    if (!joinData || joinData.length === 0) {
      return [];
    }
    
    // Extract route IDs
    const routeIds = joinData.map(item => item.route_id);
    
    // Now fetch the actual routes
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) {
      console.error('Error fetching routes by IDs:', error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    return data.map(route => transformRouteData(route));
  } catch (error) {
    console.error('Error in fetchRoutesByEvent:', error);
    return [];
  }
};

// For backward compatibility
export const fetchRoutesByEventId = fetchRoutesByEvent;

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

    return transformRouteData(data);
  } catch (error) {
    console.error('Error updating route:', error);
    return null;
  }
};

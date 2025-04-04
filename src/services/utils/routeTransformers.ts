
import { Route, Language, Point, Event } from '../../types/models';

/**
 * Formats route data from database format to application format
 */
export const formatRoute = async (rawRoute: any): Promise<Route> => {
  try {
    // Normalize name and description to make sure they have all language keys
    const name: Record<Language, string> = {
      en: rawRoute.name_en || '',
      ru: rawRoute.name_ru || '',
      hi: rawRoute.name_hi || ''
    };
    
    const description: Record<Language, string> = {
      en: rawRoute.description_en || '',
      ru: rawRoute.description_ru || '',
      hi: rawRoute.description_hi || ''
    };
    
    // Extract point IDs from the route
    const pointIds: string[] = rawRoute.points_order || [];
    
    // Extract event IDs (if any)
    const eventIds: string[] = rawRoute.event_ids || [];
    
    // Thumbnail - use the first image if available, otherwise use a placeholder
    const thumbnail = rawRoute.thumbnail_url || 
                      (rawRoute.images && rawRoute.images.length > 0 ? rawRoute.images[0] : '/placeholder.svg');
    
    // Create the formatted route object
    const formattedRoute: Route = {
      id: rawRoute.id,
      cityId: rawRoute.city_id,
      name,
      description,
      media: rawRoute.media || [],
      thumbnail,
      pointIds,
      eventIds,
      distance: rawRoute.distance,
      duration: rawRoute.duration,
      points: [], // Initialize empty arrays for points and events
      events: []
    };
    
    return formattedRoute;
  } catch (error) {
    console.error('Error formatting route:', error);
    throw error;
  }
};

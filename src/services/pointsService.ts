
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, MediaItem, GeoPoint } from '../types/models';

// Function to transform data from DB to Point model
const transformSpotToPoint = (spotData: any): Point => {
  // Process name
  let parsedName: Record<Language, string> = { en: 'Unknown spot', ru: 'Неизвестная точка', hi: 'अज्ञात स्थान' };
  try {
    if (typeof spotData.name === 'string') {
      parsedName = JSON.parse(spotData.name);
    } else if (spotData.name && typeof spotData.name === 'object') {
      parsedName = spotData.name;
    }
  } catch (e) {
    console.warn('Could not parse spot name:', e);
  }
  
  // Process description
  let parsedDescription: Record<Language, string> = { en: '', ru: '', hi: '' };
  try {
    if (typeof spotData.info === 'string') {
      parsedDescription = JSON.parse(spotData.info);
    } else if (spotData.info && typeof spotData.info === 'object') {
      parsedDescription = spotData.info;
    }
  } catch (e) {
    console.warn('Could not parse spot description:', e);
  }
  
  // Process media and images
  let mediaItems: MediaItem[] = [];
  let imageArray: string[] = [];
  let thumbnail = '/placeholder.svg';
  
  if (spotData.images) {
    try {
      if (Array.isArray(spotData.images)) {
        imageArray = spotData.images.filter(img => typeof img === 'string');
      } else if (typeof spotData.images === 'string') {
        imageArray = JSON.parse(spotData.images);
      } else if (typeof spotData.images === 'object') {
        imageArray = Object.values(spotData.images);
      }
      
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
    } catch (e) {
      console.warn('Could not parse spot images:', e);
    }
  }
  
  // Process coordinates
  let location = { latitude: 0, longitude: 0 };
  let geoPoint: GeoPoint = {
    type: "Point",
    coordinates: [0, 0]
  };
  
  if (spotData.point && typeof spotData.point === 'object') {
    // If there's a geo point
    if (spotData.point.coordinates && Array.isArray(spotData.point.coordinates)) {
      geoPoint = {
        type: "Point",
        coordinates: [
          Number(spotData.point.coordinates[0]), 
          Number(spotData.point.coordinates[1])
        ]
      };
      location = {
        longitude: Number(spotData.point.coordinates[0]),
        latitude: Number(spotData.point.coordinates[1])
      };
    }
  } else if (spotData.coordinates && typeof spotData.coordinates === 'object') {
    // Simple coordinates
    location = {
      latitude: Number(spotData.coordinates.latitude || 0),
      longitude: Number(spotData.coordinates.longitude || 0)
    };
    
    if (location.latitude !== 0 || location.longitude !== 0) {
      geoPoint = {
        type: "Point",
        coordinates: [location.longitude, location.latitude]
      };
    }
  }
  
  return {
    id: spotData.id,
    cityId: spotData.city || '',
    type: spotData.type ? 'temple' : 'other',
    name: parsedName,
    description: parsedDescription,
    media: mediaItems,
    thumbnail,
    location,
    routeIds: [],
    eventIds: [],
    point: geoPoint,
    images: imageArray
  };
};

// Get all points
export const fetchAllPoints = async (): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*');
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error('Error fetching all points:', error);
    return [];
  }
};

// Get a point by ID
export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', pointId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformSpotToPoint(data);
  } catch (error) {
    console.error(`Error fetching point with ID ${pointId}:`, error);
    return null;
  }
};

// Get points by city
export const fetchPointsByCity = async (cityId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for city ID ${cityId}:`, error);
    return [];
  }
};

// Get points by route
export const fetchPointsByRouteId = async (routeId: string): Promise<Point[]> => {
  try {
    // Get point IDs from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);
    
    if (junctionError) throw junctionError;
    if (!junctionData || junctionData.length === 0) return [];
    
    const spotIds = junctionData.map(item => item.spot_id);
    
    // Get the actual points
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for route ID ${routeId}:`, error);
    return [];
  }
};

// Get points by event
export const fetchPointsByEventId = async (eventId: string): Promise<Point[]> => {
  try {
    const { data: junctions, error: junctionError } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (junctionError) throw junctionError;
    if (!junctions || junctions.length === 0) return [];
    
    const spotIds = junctions.map(j => j.spot_id);
    
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

// For backward compatibility
export const fetchPointsByCityId = fetchPointsByCity;

// Helper function to get points by list of IDs
export const fetchPointsByIds = async (pointIds: string[]): Promise<Point[]> => {
  if (!pointIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error('Error fetching points by IDs:', error);
    return [];
  }
};

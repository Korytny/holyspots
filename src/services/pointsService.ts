
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, MediaItem, GeoPoint } from '../types/models';

// Define the main functions first to avoid circular references
export const fetchPointsByCity = async (cityId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No points found for city ID ${cityId}`);
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = data.map(item => transformSpotToPoint(item));
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for city ID ${cityId}:`, error);
    return [];
  }
};

// Helper function to transform spot data to Point type
const transformSpotToPoint = (item: any): Point => {
  // Create media items from images
  let mediaItems: MediaItem[] = [];
  let imageArray: string[] = [];
  
  if (item.images) {
    if (Array.isArray(item.images)) {
      imageArray = item.images.filter(img => typeof img === 'string') as string[];
    } else if (typeof item.images === 'object' && item.images !== null) {
      imageArray = Object.values(item.images)
        .filter(img => typeof img === 'string') as string[];
    }
    
    mediaItems = imageArray.map((url, index) => ({
      id: `image-${index}`,
      type: 'image',
      url,
      thumbnailUrl: url,
    }));
  }
  
  // Get a valid thumbnail
  let thumbnail = '/placeholder.svg';
  if (imageArray.length > 0) {
    thumbnail = imageArray[0];
  }
  
  // Parse location from coordinates or point
  let location = { latitude: 0, longitude: 0 };
  
  if (item.coordinates && typeof item.coordinates === 'object') {
    if (item.coordinates.latitude !== undefined && item.coordinates.longitude !== undefined) {
      location = {
        latitude: Number(item.coordinates.latitude),
        longitude: Number(item.coordinates.longitude)
      };
    }
  }
  
  let geoPoint: GeoPoint = {
    type: "Point",
    coordinates: [0, 0]
  };
  
  if (item.point && typeof item.point === 'object' && 
      item.point.coordinates && Array.isArray(item.point.coordinates)) {
    location = {
      latitude: Number(item.point.coordinates[1]),
      longitude: Number(item.point.coordinates[0])
    };
    
    geoPoint = {
      type: "Point",
      coordinates: [Number(item.point.coordinates[0]), Number(item.point.coordinates[1])]
    };
  } else if (location.latitude !== 0 || location.longitude !== 0) {
    geoPoint = {
      type: "Point",
      coordinates: [location.longitude, location.latitude]
    };
  }
  
  return {
    id: item.id,
    cityId: item.city || '',
    type: item.type ? 'temple' : 'other',
    name: item.name as Record<Language, string>,
    description: item.info as Record<Language, string>,
    media: mediaItems,
    thumbnail,
    location,
    routeIds: [],
    eventIds: [],
    point: geoPoint
  };
};

export const fetchAllPoints = async (): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("No points found");
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = data.map(item => transformSpotToPoint(item));
    
    return points;
  } catch (error) {
    console.error('Error fetching all points:', error);
    return [];
  }
};

export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', pointId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      console.log(`No point found with ID ${pointId}`);
      return null;
    }
    
    return transformSpotToPoint(data);
  } catch (error) {
    console.error(`Error fetching point with ID ${pointId}:`, error);
    return null;
  }
};

export const fetchPointsByRouteId = async (routeId: string): Promise<Point[]> => {
  try {
    // First query the join table to get point IDs
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);
    
    if (joinError) throw joinError;
    
    if (!joinData || joinData.length === 0) {
      console.log(`No points found for route ID ${routeId}`);
      return [];
    }
    
    // Extract the point IDs
    const pointIds = joinData.map(item => item.spot_id);
    
    // Get the points data
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No points found with IDs ${pointIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects and add the routeId
    const points: Point[] = data.map(item => {
      const point = transformSpotToPoint(item);
      point.routeIds = [routeId];
      return point;
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for route ID ${routeId}:`, error);
    return [];
  }
};

export const fetchPointsByEventId = async (eventId: string): Promise<Point[]> => {
  try {
    // First query the join table to get point IDs
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (joinError) throw joinError;
    
    if (!joinData || joinData.length === 0) {
      console.log(`No points found for event ID ${eventId}`);
      return [];
    }
    
    // Extract the point IDs
    const pointIds = joinData.map(item => item.spot_id);
    
    // Get the points data
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No points found with IDs ${pointIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects and add the eventId
    const points: Point[] = data.map(item => {
      const point = transformSpotToPoint(item);
      point.eventIds = [eventId];
      return point;
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

// For backward compatibility
export const fetchPointsByCityId = fetchPointsByCity;

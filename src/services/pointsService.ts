
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, Json } from '../types/models';

export interface GeoPoint {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

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
    const points: Point[] = data.map(item => {
      let coordinates: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
      let pointData: GeoPoint | undefined;
      
      if (item.coordinates && typeof item.coordinates === 'object') {
        const coords = item.coordinates as { lat?: number; lng?: number };
        coordinates = {
          latitude: coords.lat || 0,
          longitude: coords.lng || 0
        };
        
        pointData = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        };
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: mapTypeToEnum(item.type),
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: [],
        thumbnail: Array.isArray(item.images) && item.images.length > 0 
          ? item.images[0] 
          : typeof item.images === 'object' && item.images !== null 
            ? Object.values(item.images)[0] || '/placeholder.svg'
            : '/placeholder.svg',
        images: item.images as string[] || [],
        location: coordinates,
        point: pointData,
        routeIds: [], // These will be populated from spot_route table if needed
        eventIds: []  // These will be populated from spot_event table if needed
      };
    });
    
    return points;
  } catch (error) {
    console.error('Error fetching points:', error);
    return [];
  }
};

// Helper function to map numeric type to enum string
const mapTypeToEnum = (type: number | null | undefined): 'temple' | 'ashram' | 'kund' | 'other' => {
  if (type === 1) return 'temple';
  if (type === 2) return 'ashram';
  if (type === 3) return 'kund';
  return 'other';
};

export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', pointId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No point found with ID ${pointId}`);
        return null;
      }
      throw error;
    }
    
    if (!data) {
      console.log(`No point found with ID ${pointId}`);
      return null;
    }
    
    let coordinates: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
    let pointData: GeoPoint | undefined;
    
    if (data.coordinates && typeof data.coordinates === 'object') {
      const coords = data.coordinates as { lat?: number; lng?: number };
      coordinates = {
        latitude: coords.lat || 0,
        longitude: coords.lng || 0
      };
      
      pointData = {
        type: 'Point',
        coordinates: [coordinates.longitude, coordinates.latitude]
      };
    }
    
    // Transform database record to Point object
    const point: Point = {
      id: data.id,
      cityId: data.city || '',
      type: mapTypeToEnum(data.type),
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      media: [],
      thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : typeof data.images === 'object' && data.images !== null 
          ? Object.values(data.images)[0] || '/placeholder.svg'
          : '/placeholder.svg',
      images: data.images as string[] || [],
      location: coordinates,
      point: pointData,
      routeIds: [], // These will be populated from spot_route table if needed
      eventIds: []  // These will be populated from spot_event table if needed
    };
    
    return point;
  } catch (error) {
    console.error(`Error fetching point with ID ${pointId}:`, error);
    return null;
  }
};

export const fetchPointsByCityId = async (cityId: string): Promise<Point[]> => {
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
    const points: Point[] = data.map(item => {
      let coordinates: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
      let pointData: GeoPoint | undefined;
      
      if (item.coordinates && typeof item.coordinates === 'object') {
        const coords = item.coordinates as { lat?: number; lng?: number };
        coordinates = {
          latitude: coords.lat || 0,
          longitude: coords.lng || 0
        };
        
        pointData = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        };
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: mapTypeToEnum(item.type),
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: [],
        thumbnail: Array.isArray(item.images) && item.images.length > 0 
          ? item.images[0] 
          : typeof item.images === 'object' && item.images !== null 
            ? Object.values(item.images)[0] || '/placeholder.svg'
            : '/placeholder.svg',
        images: item.images as string[] || [],
        location: coordinates,
        point: pointData,
        routeIds: [], // These will be populated from spot_route table if needed
        eventIds: []  // These will be populated from spot_event table if needed
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchPointsByRouteId = async (routeId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No points found for route ID ${routeId}`);
      return [];
    }
    
    const spotIds = data.map(item => item.spot_id);
    
    const { data: spotsData, error: spotsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (spotsError) throw spotsError;
    
    if (!spotsData || spotsData.length === 0) {
      console.log(`No spots found with IDs ${spotIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = spotsData.map(item => {
      let coordinates: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
      let pointData: GeoPoint | undefined;
      
      if (item.coordinates && typeof item.coordinates === 'object') {
        const coords = item.coordinates as { lat?: number; lng?: number };
        coordinates = {
          latitude: coords.lat || 0,
          longitude: coords.lng || 0
        };
        
        pointData = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        };
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: mapTypeToEnum(item.type),
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: [],
        thumbnail: Array.isArray(item.images) && item.images.length > 0 
          ? item.images[0] 
          : typeof item.images === 'object' && item.images !== null 
            ? Object.values(item.images)[0] || '/placeholder.svg'
            : '/placeholder.svg',
        images: item.images as string[] || [],
        location: coordinates,
        point: pointData,
        routeIds: [routeId], // Include the current route ID
        eventIds: []  // These will be populated from spot_event table if needed
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for route ID ${routeId}:`, error);
    return [];
  }
};

export const fetchPointsByEventId = async (eventId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No points found for event ID ${eventId}`);
      return [];
    }
    
    const spotIds = data.map(item => item.spot_id);
    
    const { data: spotsData, error: spotsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (spotsError) throw spotsError;
    
    if (!spotsData || spotsData.length === 0) {
      console.log(`No spots found with IDs ${spotIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = spotsData.map(item => {
      let coordinates: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };
      let pointData: GeoPoint | undefined;
      
      if (item.coordinates && typeof item.coordinates === 'object') {
        const coords = item.coordinates as { lat?: number; lng?: number };
        coordinates = {
          latitude: coords.lat || 0,
          longitude: coords.lng || 0
        };
        
        pointData = {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        };
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: mapTypeToEnum(item.type),
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: [],
        thumbnail: Array.isArray(item.images) && item.images.length > 0 
          ? item.images[0] 
          : typeof item.images === 'object' && item.images !== null 
            ? Object.values(item.images)[0] || '/placeholder.svg'
            : '/placeholder.svg',
        images: item.images as string[] || [],
        location: coordinates,
        point: pointData,
        routeIds: [], // These will be populated from spot_route table if needed
        eventIds: [eventId]  // Include the current event ID
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

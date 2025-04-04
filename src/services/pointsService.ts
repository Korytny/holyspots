
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, MediaItem } from '../types/models';

// Re-export with the correct name for backward compatibility
export const fetchPointsByCityId = fetchPointsByCity;

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
    const points: Point[] = data.map(item => {
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
        if (item.coordinates.latitude && item.coordinates.longitude) {
          location = {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude
          };
        }
      }
      
      if (item.point && item.point.coordinates) {
        location = {
          latitude: item.point.coordinates[1],
          longitude: item.point.coordinates[0]
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
        point: item.point
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for city ID ${cityId}:`, error);
    return [];
  }
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
    const points: Point[] = data.map(item => {
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
        if (item.coordinates.latitude && item.coordinates.longitude) {
          location = {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude
          };
        }
      }
      
      if (item.point && item.point.coordinates) {
        location = {
          latitude: item.point.coordinates[1],
          longitude: item.point.coordinates[0]
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
        point: item.point
      };
    });
    
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
    
    // Create media items from images
    let mediaItems: MediaItem[] = [];
    let imageArray: string[] = [];
    
    if (data.images) {
      if (Array.isArray(data.images)) {
        imageArray = data.images.filter(img => typeof img === 'string') as string[];
      } else if (typeof data.images === 'object' && data.images !== null) {
        imageArray = Object.values(data.images)
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
    if (data.coordinates && typeof data.coordinates === 'object') {
      if (data.coordinates.latitude && data.coordinates.longitude) {
        location = {
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude
        };
      }
    }
    
    if (data.point && data.point.coordinates) {
      location = {
        latitude: data.point.coordinates[1],
        longitude: data.point.coordinates[0]
      };
    }
    
    const point: Point = {
      id: data.id,
      cityId: data.city || '',
      type: data.type ? 'temple' : 'other',
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      media: mediaItems,
      thumbnail,
      location,
      routeIds: [],
      eventIds: [],
      point: data.point
    };
    
    return point;
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
    
    // Transform database records to Point objects
    const points: Point[] = data.map(item => {
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
        if (item.coordinates.latitude && item.coordinates.longitude) {
          location = {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude
          };
        }
      }
      
      if (item.point && item.point.coordinates) {
        location = {
          latitude: item.point.coordinates[1],
          longitude: item.point.coordinates[0]
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
        routeIds: [routeId],
        eventIds: [],
        point: item.point
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
    
    // Transform database records to Point objects
    const points: Point[] = data.map(item => {
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
        if (item.coordinates.latitude && item.coordinates.longitude) {
          location = {
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude
          };
        }
      }
      
      if (item.point && item.point.coordinates) {
        location = {
          latitude: item.point.coordinates[1],
          longitude: item.point.coordinates[0]
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
        eventIds: [eventId],
        point: item.point
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

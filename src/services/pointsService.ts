
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, GeoPoint, MediaItem } from '../types/models';

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
      
      // Create location object
      let location = {
        latitude: 0,
        longitude: 0
      };
      
      if (item.point?.coordinates) {
        location.longitude = item.point.coordinates[0];
        location.latitude = item.point.coordinates[1];
      } else if (item.coordinates) {
        // Extract coordinates from the coordinates field if available
        try {
          if (typeof item.coordinates === 'object' && item.coordinates !== null) {
            const coords = item.coordinates;
            if ('latitude' in coords && 'longitude' in coords) {
              location.latitude = parseFloat(coords.latitude);
              location.longitude = parseFloat(coords.longitude);
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: (typeof item.type === 'number' ? 
          (item.type === 0 ? 'temple' : 
           item.type === 1 ? 'ashram' : 
           item.type === 2 ? 'kund' : 'other') : 
          'other') as 'temple' | 'ashram' | 'kund' | 'other',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        images: imageArray,
        location,
        point: item.point as GeoPoint,
        routeIds: [],
        eventIds: []
      };
    });
    
    return points;
  } catch (error) {
    console.error('Error fetching points:', error);
    return [];
  }
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
    
    // Create location object
    let location = {
      latitude: 0,
      longitude: 0
    };
    
    if (data.point?.coordinates) {
      location.longitude = data.point.coordinates[0];
      location.latitude = data.point.coordinates[1];
    } else if (data.coordinates) {
      // Extract coordinates from the coordinates field if available
      try {
        if (typeof data.coordinates === 'object' && data.coordinates !== null) {
          const coords = data.coordinates;
          if ('latitude' in coords && 'longitude' in coords) {
            location.latitude = parseFloat(coords.latitude);
            location.longitude = parseFloat(coords.longitude);
          }
        }
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    const point: Point = {
      id: data.id,
      cityId: data.city || '',
      type: (typeof data.type === 'number' ? 
        (data.type === 0 ? 'temple' : 
         data.type === 1 ? 'ashram' : 
         data.type === 2 ? 'kund' : 'other') : 
        'other') as 'temple' | 'ashram' | 'kund' | 'other',
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      media: mediaItems,
      thumbnail,
      images: imageArray,
      location,
      point: data.point as GeoPoint,
      routeIds: [],
      eventIds: []
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
      
      // Create location object
      let location = {
        latitude: 0,
        longitude: 0
      };
      
      if (item.point?.coordinates) {
        location.longitude = item.point.coordinates[0];
        location.latitude = item.point.coordinates[1];
      } else if (item.coordinates) {
        // Extract coordinates from the coordinates field if available
        try {
          if (typeof item.coordinates === 'object' && item.coordinates !== null) {
            const coords = item.coordinates;
            if ('latitude' in coords && 'longitude' in coords) {
              location.latitude = parseFloat(coords.latitude);
              location.longitude = parseFloat(coords.longitude);
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: (typeof item.type === 'number' ? 
          (item.type === 0 ? 'temple' : 
           item.type === 1 ? 'ashram' : 
           item.type === 2 ? 'kund' : 'other') : 
          'other') as 'temple' | 'ashram' | 'kund' | 'other',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        images: imageArray,
        location,
        point: item.point as GeoPoint,
        routeIds: [],
        eventIds: []
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
    
    const pointIds = data.map(item => item.spot_id);
    
    const { data: pointsData, error: pointsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (pointsError) throw pointsError;
    
    if (!pointsData || pointsData.length === 0) {
      console.log(`No points found with IDs ${pointIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = pointsData.map(item => {
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
      
      // Create location object
      let location = {
        latitude: 0,
        longitude: 0
      };
      
      if (item.point?.coordinates) {
        location.longitude = item.point.coordinates[0];
        location.latitude = item.point.coordinates[1];
      } else if (item.coordinates) {
        // Extract coordinates from the coordinates field if available
        try {
          if (typeof item.coordinates === 'object' && item.coordinates !== null) {
            const coords = item.coordinates;
            if ('latitude' in coords && 'longitude' in coords) {
              location.latitude = parseFloat(coords.latitude);
              location.longitude = parseFloat(coords.longitude);
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: (typeof item.type === 'number' ? 
          (item.type === 0 ? 'temple' : 
           item.type === 1 ? 'ashram' : 
           item.type === 2 ? 'kund' : 'other') : 
          'other') as 'temple' | 'ashram' | 'kund' | 'other',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        images: imageArray,
        location,
        point: item.point as GeoPoint,
        routeIds: [routeId],
        eventIds: []
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
    
    const pointIds = data.map(item => item.spot_id);
    
    const { data: pointsData, error: pointsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (pointsError) throw pointsError;
    
    if (!pointsData || pointsData.length === 0) {
      console.log(`No points found with IDs ${pointIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Point objects
    const points: Point[] = pointsData.map(item => {
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
      
      // Create location object
      let location = {
        latitude: 0,
        longitude: 0
      };
      
      if (item.point?.coordinates) {
        location.longitude = item.point.coordinates[0];
        location.latitude = item.point.coordinates[1];
      } else if (item.coordinates) {
        // Extract coordinates from the coordinates field if available
        try {
          if (typeof item.coordinates === 'object' && item.coordinates !== null) {
            const coords = item.coordinates;
            if ('latitude' in coords && 'longitude' in coords) {
              location.latitude = parseFloat(coords.latitude);
              location.longitude = parseFloat(coords.longitude);
            }
          }
        } catch (e) {
          console.error('Error parsing coordinates:', e);
        }
      }
      
      return {
        id: item.id,
        cityId: item.city || '',
        type: (typeof item.type === 'number' ? 
          (item.type === 0 ? 'temple' : 
           item.type === 1 ? 'ashram' : 
           item.type === 2 ? 'kund' : 'other') : 
          'other') as 'temple' | 'ashram' | 'kund' | 'other',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        images: imageArray,
        location,
        point: item.point as GeoPoint,
        routeIds: [],
        eventIds: [eventId]
      };
    });
    
    return points;
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

// Create alias functions for backward compatibility
export const fetchSpotById = fetchPointById;
export const fetchAllSpots = fetchAllPoints;
export const fetchSpotsByCity = fetchPointsByCityId;
export const fetchSpotsByRoute = fetchPointsByRouteId;
export const fetchSpotsByEvent = fetchPointsByEventId;

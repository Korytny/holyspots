
import { supabase } from '@/integrations/supabase/client';
import { Point, Language } from '../types/models';

/**
 * Fetches points by cityId
 */
export const fetchPointsByCityId = async (cityId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('city', cityId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(spot => {
      const nameRecord = tryParseJson(spot.name, {
        en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात'
      });
      
      const descriptionRecord = tryParseJson(spot.info, {
        en: '', ru: '', hi: ''
      });
      
      // Map images correctly
      const images = Array.isArray(spot.images) 
        ? spot.images 
        : (typeof spot.images === 'object' && spot.images !== null)
          ? Object.values(spot.images).filter(img => typeof img === 'string')
          : [];
          
      const thumbnail = Array.isArray(images) && images.length > 0 
        ? images[0] 
        : '/placeholder.svg';
        
      // Try to get point coordinates
      let latitude = 0;
      let longitude = 0;
      
      if (spot.coordinates && typeof spot.coordinates === 'object') {
        latitude = parseFloat(spot.coordinates.latitude) || 0;
        longitude = parseFloat(spot.coordinates.longitude) || 0;
      }
      
      // Create point property with type and coordinates
      const point = {
        type: 'Point',
        coordinates: [longitude, latitude] as [number, number]
      };
      
      return {
        id: spot.id,
        cityId: spot.city,
        type: mapSpotTypeToPointType(spot.type),
        name: nameRecord as Record<Language, string>,
        description: descriptionRecord as Record<Language, string>,
        media: [], // Default empty media array
        thumbnail,
        images: images as string[],
        location: {
          latitude,
          longitude
        },
        routeIds: spot.routes || [],
        eventIds: spot.events || [],
        ownerId: undefined,
        point
      };
    });
  } catch (error) {
    console.error('Error fetching points by cityId:', error);
    throw error;
  }
};

/**
 * Maps database spot type to app point type
 */
function mapSpotTypeToPointType(typeId: number): 'temple' | 'ashram' | 'kund' | 'other' {
  switch (typeId) {
    case 1: return 'temple';
    case 2: return 'ashram';
    case 3: return 'kund';
    default: return 'other';
  }
}

/**
 * Helper function to safely parse JSON
 */
function tryParseJson(json: any, defaultValue: any) {
  if (!json) return defaultValue;
  
  if (typeof json === 'string') {
    try {
      return JSON.parse(json);
    } catch (e) {
      return defaultValue;
    }
  }
  
  return json;
}

/**
 * Fetches a single point by id
 */
export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', pointId)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Transform data to our model
    const nameRecord = tryParseJson(data.name, {
      en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात'
    });
    
    const descriptionRecord = tryParseJson(data.info, {
      en: '', ru: '', hi: ''
    });
    
    // Map images correctly
    const images = Array.isArray(data.images) 
      ? data.images 
      : (typeof data.images === 'object' && data.images !== null)
        ? Object.values(data.images).filter(img => typeof img === 'string')
        : [];
        
    const thumbnail = Array.isArray(images) && images.length > 0 
      ? images[0] 
      : '/placeholder.svg';
      
    // Try to get point coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (data.coordinates && typeof data.coordinates === 'object') {
      latitude = parseFloat(data.coordinates.latitude) || 0;
      longitude = parseFloat(data.coordinates.longitude) || 0;
    }
    
    // Create point property with type and coordinates
    const point = {
      type: 'Point',
      coordinates: [longitude, latitude] as [number, number]
    };
    
    return {
      id: data.id,
      cityId: data.city,
      type: mapSpotTypeToPointType(data.type),
      name: nameRecord as Record<Language, string>,
      description: descriptionRecord as Record<Language, string>,
      media: [], // Default empty media array
      thumbnail,
      images: images as string[],
      location: {
        latitude,
        longitude
      },
      routeIds: data.routes || [],
      eventIds: data.events || [],
      ownerId: undefined,
      point
    };
  } catch (error) {
    console.error('Error fetching point by id:', error);
    throw error;
  }
};

// For services with potential TypeScript errors, we add default values and proper type handling
export const fetchAllPoints = async (): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model - same pattern as above
    return data.map(spot => {
      const nameRecord = tryParseJson(spot.name, {
        en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात'
      });
      
      const descriptionRecord = tryParseJson(spot.info, {
        en: '', ru: '', hi: ''
      });
      
      // Map images correctly
      const images = Array.isArray(spot.images) 
        ? spot.images 
        : (typeof spot.images === 'object' && spot.images !== null)
          ? Object.values(spot.images).filter(img => typeof img === 'string')
          : [];
          
      const thumbnail = Array.isArray(images) && images.length > 0 
        ? images[0] 
        : '/placeholder.svg';
        
      // Try to get point coordinates  
      let latitude = 0;
      let longitude = 0;
      
      if (spot.coordinates && typeof spot.coordinates === 'object') {
        latitude = parseFloat(spot.coordinates.latitude) || 0;
        longitude = parseFloat(spot.coordinates.longitude) || 0;
      }
      
      // Create point property with type and coordinates
      const point = {
        type: 'Point', 
        coordinates: [longitude, latitude] as [number, number]
      };
      
      return {
        id: spot.id,
        cityId: spot.city,
        type: mapSpotTypeToPointType(spot.type),
        name: nameRecord as Record<Language, string>,
        description: descriptionRecord as Record<Language, string>,
        media: [], // Default empty media array
        thumbnail,
        images: images as string[],
        location: {
          latitude,
          longitude
        },
        routeIds: spot.routes || [],
        eventIds: spot.events || [],
        ownerId: undefined,
        point
      };
    });
  } catch (error) {
    console.error('Error fetching all points:', error);
    throw error;
  }
};


import { supabase } from '../lib/supabase';
import { City } from '../types/models';

export const fetchCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*');
  
  if (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
  
  return data.map((cityData): City => {
    // Parse the name if it's a string
    let parsedName = cityData.name;
    if (typeof cityData.name === 'string') {
      try {
        parsedName = JSON.parse(cityData.name);
      } catch (e) {
        // If parsing fails, create a simple object with the string value
        parsedName = { en: cityData.name };
      }
    }
    
    return {
      id: cityData.id,
      name: parsedName as Record<string, string>,
      description: cityData.description || cityData.info || {},
      info: cityData.info || {},
      media: cityData.media || [],
      images: cityData.images || [],
      thumbnail: cityData.images && cityData.images.length > 0 ? cityData.images[0] : '/placeholder.svg',
      pointIds: cityData.pointIds || [],
      routeIds: cityData.routeIds || [],
      eventIds: cityData.eventIds || [],
      location: cityData.location || { latitude: 0, longitude: 0 },
      spots_count: cityData.spots_count || 0,
      routes_count: cityData.routes_count || 0,
      events_count: cityData.events_count || 0,
    };
  });
};

export const fetchCityById = async (cityId: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', cityId)
    .maybeSingle();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // City not found
    }
    console.error('Error fetching city:', error);
    throw error;
  }
  
  // Parse the name if it's a string
  let parsedName = data.name;
  if (typeof data.name === 'string') {
    try {
      parsedName = JSON.parse(data.name);
    } catch (e) {
      // If parsing fails, create a simple object with the string value
      parsedName = { en: data.name };
    }
  }
  
  return {
    id: data.id,
    name: parsedName as Record<string, string>,
    description: data.description || data.info || {},
    info: data.info || {},
    media: data.media || [],
    images: data.images || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    pointIds: data.pointIds || [],
    routeIds: data.routeIds || [],
    eventIds: data.eventIds || [],
    location: data.location || { latitude: 0, longitude: 0 },
    spots_count: data.spots_count || 0,
    routes_count: data.routes_count || 0,
    events_count: data.events_count || 0,
  };
};

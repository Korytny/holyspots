
import { supabase } from '../lib/supabase';
import { City } from '../types/models';
import { Json } from '../types/models';

export const fetchCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*');
  
  if (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
  
  return data.map((cityData): City => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof cityData.name === 'string' 
        ? JSON.parse(cityData.name) 
        : (cityData.name || { en: 'Unknown city', ru: 'Неизвестный город', hi: 'अज्ञात शहर' });
    } catch (e) {
      parsedName = { en: cityData.name || 'Unknown city', ru: cityData.name || 'Неизвестный город', hi: cityData.name || 'अज्ञात शहर' };
    }
    
    let parsedInfo = {};
    try {
      parsedInfo = typeof cityData.info === 'string' 
        ? JSON.parse(cityData.info) 
        : (cityData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    let images: string[] = [];
    try {
      images = Array.isArray(cityData.images) 
        ? cityData.images 
        : (typeof cityData.images === 'string' ? JSON.parse(cityData.images) : []);
    } catch (e) {
      images = [];
    }
    
    return {
      id: cityData.id,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      info: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      pointIds: [],
      routeIds: [],
      eventIds: [],
      location: { latitude: 0, longitude: 0 },
      spots_count: cityData.spots_count || 0,
      routes_count: cityData.routes_count || 0,
      events_count: cityData.events_count || 0,
      country: cityData.country || ''
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
  
  if (!data) return null;
  
  // Parse JSON data
  let parsedName = {};
  try {
    parsedName = typeof data.name === 'string' 
      ? JSON.parse(data.name) 
      : (data.name || { en: 'Unknown city', ru: 'Неизвестный город', hi: 'अज्ञात शहर' });
  } catch (e) {
    parsedName = { en: data.name || 'Unknown city', ru: data.name || 'Неизвестный город', hi: data.name || 'अज्ञात शहर' };
  }
  
  let parsedInfo = {};
  try {
    parsedInfo = typeof data.info === 'string' 
      ? JSON.parse(data.info) 
      : (data.info || { en: '', ru: '', hi: '' });
  } catch (e) {
    parsedInfo = { en: '', ru: '', hi: '' };
  }
  
  let images: string[] = [];
  try {
    images = Array.isArray(data.images) 
      ? data.images 
      : (typeof data.images === 'string' ? JSON.parse(data.images) : []);
  } catch (e) {
    images = [];
  }
  
  return {
    id: data.id,
    name: parsedName as Record<string, string>,
    description: parsedInfo as Record<string, string>,
    info: parsedInfo as Record<string, string>,
    media: [],
    images: images,
    thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
    pointIds: [],
    routeIds: [],
    eventIds: [],
    location: { latitude: 0, longitude: 0 },
    spots_count: data.spots_count || 0,
    routes_count: data.routes_count || 0,
    events_count: data.events_count || 0,
    country: data.country || ''
  };
};

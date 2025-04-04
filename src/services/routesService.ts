
import { supabase } from '../lib/supabase';
import { Route } from '../types/models';

export const fetchAllRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*');
  
  if (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
  
  return data.map((routeData): Route => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof routeData.name === 'string' 
        ? JSON.parse(routeData.name) 
        : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
    } catch (e) {
      parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
    }
    
    let parsedDescription = {};
    try {
      parsedDescription = typeof routeData.description === 'string' 
        ? JSON.parse(routeData.description) 
        : (routeData.description || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    let pointIds: string[] = [];
    try {
      pointIds = Array.isArray(routeData.point_ids) 
        ? routeData.point_ids 
        : (typeof routeData.point_ids === 'string' ? JSON.parse(routeData.point_ids) : []);
    } catch (e) {
      pointIds = [];
    }
    
    return {
      id: routeData.id,
      cityId: routeData.city_id,
      name: parsedName,
      description: parsedDescription,
      media: [], // This would need to be fetched separately
      thumbnail: routeData.thumbnail || '/placeholder.svg',
      pointIds: pointIds,
      eventIds: [],
      distance: routeData.distance,
      duration: routeData.duration
    };
  });
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Parse JSON data
  let parsedName = {};
  try {
    parsedName = typeof data.name === 'string' 
      ? JSON.parse(data.name) 
      : (data.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
  } catch (e) {
    parsedName = { en: data.name || 'Unknown route', ru: data.name || 'Неизвестный маршрут', hi: data.name || 'अज्ञात मार्ग' };
  }
  
  let parsedDescription = {};
  try {
    parsedDescription = typeof data.description === 'string' 
      ? JSON.parse(data.description) 
      : (data.description || { en: '', ru: '', hi: '' });
  } catch (e) {
    parsedDescription = { en: '', ru: '', hi: '' };
  }
  
  let pointIds: string[] = [];
  try {
    pointIds = Array.isArray(data.point_ids) 
      ? data.point_ids 
      : (typeof data.point_ids === 'string' ? JSON.parse(data.point_ids) : []);
  } catch (e) {
    pointIds = [];
  }
  
  return {
    id: data.id,
    cityId: data.city_id,
    name: parsedName,
    description: parsedDescription,
    media: [], // This would need to be fetched separately
    thumbnail: data.thumbnail || '/placeholder.svg',
    pointIds: pointIds,
    eventIds: [],
    distance: data.distance,
    duration: data.duration
  };
};

export const fetchRoutePoints = async (routeId: string) => {
  const route = await fetchRouteById(routeId);
  if (!route) return [];
  
  // If no point IDs, return empty array
  if (!route.pointIds || route.pointIds.length === 0) return [];
  
  // Fetch points by their IDs
  const { data, error } = await supabase
    .from('points')
    .select('*')
    .in('id', route.pointIds);
  
  if (error) {
    console.error('Error fetching route points:', error);
    throw error;
  }
  
  return data.map(point => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof point.name === 'string' 
        ? JSON.parse(point.name) 
        : (point.name || { en: 'Unknown point', ru: 'Неизвестная точка', hi: 'अज्ञात बिंदु' });
    } catch (e) {
      parsedName = { en: point.name || 'Unknown point', ru: point.name || 'Неизвестная точка', hi: point.name || 'अज्ञात बिंदु' };
    }
    
    let parsedDescription = {};
    try {
      parsedDescription = typeof point.description === 'string' 
        ? JSON.parse(point.description) 
        : (point.description || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    return {
      id: point.id,
      cityId: point.city_id,
      type: point.type || 'other',
      name: parsedName,
      description: parsedDescription,
      media: [],
      thumbnail: point.thumbnail || '/placeholder.svg',
      location: point.location || { latitude: 0, longitude: 0 },
      routeIds: [],
      eventIds: []
    };
  });
};

// Additional functions would go here

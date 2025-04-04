import { supabase } from '@/integrations/supabase/client';
import { Route, Language } from '../types/models';

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
 * Maps route data from database to application model
 */
const mapRouteData = (route: any): Route => {
  // Pример безопасной обработки полей
  const nameRecord = tryParseJson(route.name, {
    en: 'Unknown Route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग'
  });
  
  // Для description используем пустые значения, если info отсутствует
  const descriptionRecord = { en: '', ru: '', hi: '' };
  
  // Добавляем значения по умолчанию, если поля в базе данных отсутствуют
  return {
    id: route.id,
    cityId: route.city || 'unknown',
    name: nameRecord,
    description: descriptionRecord,
    media: [], // Присваиваем пустой массив, так как поле media не существует в базе
    thumbnail: '/placeholder.svg', // Используем заглушку если нет изображения
    pointIds: route.spots || [],
    eventIds: [],
    distance: 0, // Поле отсутствует в базе
    duration: 0  // Поле отсутствует в базе
  };
};

/**
 * Fetches routes by cityId
 */
export const fetchRoutesByCityId = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(mapRouteData);
  } catch (error) {
    console.error('Error fetching routes by cityId:', error);
    throw error;
  }
};

/**
 * Fetches a single route by id
 */
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Transform data to our model
    return mapRouteData(data);
  } catch (error) {
    console.error('Error fetching route by id:', error);
    throw error;
  }
};

/**
 * Fetches all routes
 */
export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(mapRouteData);
  } catch (error) {
    console.error('Error fetching all routes:', error);
    throw error;
  }
};

/**
 * Fetches routes by pointId
 */
export const fetchRoutesByPointId = async (pointId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .contains('spots', [pointId]);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(mapRouteData);
  } catch (error) {
    console.error('Error fetching routes by pointId:', error);
    throw error;
  }
};

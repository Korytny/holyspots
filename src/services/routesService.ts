
import { supabase } from '../lib/supabase';
import { Route, Language } from '../types/models';

// Базовая функция для преобразования данных из БД в модель Route
const transformRouteData = (routeData: any): Route => {
  // Обработка имени
  let parsedName: Record<Language, string> = { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' };
  try {
    if (typeof routeData.name === 'string') {
      parsedName = JSON.parse(routeData.name);
    } else if (routeData.name && typeof routeData.name === 'object') {
      parsedName = routeData.name;
    }
  } catch (e) {
    console.warn('Could not parse route name:', e);
  }
  
  // Обработка описания
  let parsedDescription: Record<Language, string> = { en: '', ru: '', hi: '' };
  try {
    if (typeof routeData.info === 'string') {
      parsedDescription = JSON.parse(routeData.info);
    } else if (routeData.info && typeof routeData.info === 'object') {
      parsedDescription = routeData.info;
    }
  } catch (e) {
    console.warn('Could not parse route description:', e);
  }
  
  // Преобразование массива точек
  let pointIds: string[] = [];
  try {
    if (Array.isArray(routeData.spots)) {
      pointIds = routeData.spots;
    } else if (typeof routeData.spots === 'string') {
      pointIds = JSON.parse(routeData.spots);
    }
  } catch (e) {
    console.warn('Could not parse route points:', e);
  }
  
  return {
    id: routeData.id,
    cityId: routeData.city_id || '',
    name: parsedName,
    description: parsedDescription,
    media: [],
    thumbnail: '/placeholder.svg',
    pointIds: pointIds,
    eventIds: [],
    distance: routeData.distance || 0,
    duration: routeData.duration || 0
  };
};

// Функция для получения всех маршрутов
export const fetchAllRoutes = async (): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

// Функция для получения маршрута по ID
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformRouteData(data);
  } catch (error) {
    console.error(`Error fetching route with ID ${routeId}:`, error);
    return null;
  }
};

// Функция для получения маршрутов города
export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city_id', cityId);
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for city ${cityId}:`, error);
    return [];
  }
};

// Функция для получения маршрутов, содержащих точку
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    
    // Фильтруем маршруты, которые содержат эту точку
    return data
      .filter(route => {
        if (!route.spots) return false;
        
        let spotIds: string[] = [];
        try {
          if (Array.isArray(route.spots)) {
            spotIds = route.spots;
          } else if (typeof route.spots === 'string') {
            spotIds = JSON.parse(route.spots);
          }
          return spotIds.includes(pointId);
        } catch (e) {
          return false;
        }
      })
      .map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for point ${pointId}:`, error);
    return [];
  }
};

// Функция для получения маршрутов события
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // Сначала получаем связи из таблицы route_event
    const { data: junctions, error: junctionError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (junctionError) throw junctionError;
    if (!junctions || junctions.length === 0) return [];
    
    // Извлекаем ID маршрутов
    const routeIds = junctions.map(j => j.route_id);
    
    // Получаем сами маршруты
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (error) throw error;
    return data.map(transformRouteData);
  } catch (error) {
    console.error(`Error fetching routes for event ${eventId}:`, error);
    return [];
  }
};

// Функция для получения точек маршрута
export const fetchRoutePoints = async (routeId: string) => {
  try {
    const route = await fetchRouteById(routeId);
    if (!route || !route.pointIds.length) return [];
    
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', route.pointIds);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching points for route ${routeId}:`, error);
    return [];
  }
};

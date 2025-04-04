
import { supabase } from '@/integrations/supabase/client';
import { Route, Language } from '../types/models';
import { Json } from '../types/supabase';

// Объявляем все экспортируемые функции в начале файла
export const fetchAllRoutes = async (): Promise<Route[]> => {
  return await fetchRoutes();
};

export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
    
    if (error) {
      console.error('Error fetching route:', error);
      return null;
    }
    
    if (!data) return null;
    
    return transformRouteData(data);
  } catch (error) {
    console.error('Error in fetchRouteById:', error);
    return null;
  }
};

export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('city', cityId);
    
    if (error) {
      console.error('Error fetching routes by city:', error);
      return [];
    }
    
    return data.map(transformRouteData);
  } catch (error) {
    console.error('Error in fetchRoutesByCity:', error);
    return [];
  }
};

export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  try {
    // Подход через связующую таблицу
    const { data: spotRouteData, error: spotRouteError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', pointId);
    
    if (spotRouteError) {
      console.error('Error fetching spot-route relations:', spotRouteError);
      return [];
    }
    
    if (!spotRouteData || spotRouteData.length === 0) {
      return [];
    }
    
    const routeIds = spotRouteData.map(item => item.route_id);
    
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) {
      console.error('Error fetching routes by point:', routesError);
      return [];
    }
    
    if (!routesData) return [];
    
    return routesData.map(transformRouteData);
  } catch (error) {
    console.error('Error in fetchRoutesByPoint:', error);
    return [];
  }
};

export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  try {
    // Подход через связующую таблицу
    const { data: routeEventData, error: routeEventError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (routeEventError) {
      console.error('Error fetching route-event relations:', routeEventError);
      return [];
    }
    
    if (!routeEventData || routeEventData.length === 0) {
      return [];
    }
    
    const routeIds = routeEventData.map(item => item.route_id);
    
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) {
      console.error('Error fetching routes by event:', routesError);
      return [];
    }
    
    if (!routesData) return [];
    
    return routesData.map(transformRouteData);
  } catch (error) {
    console.error('Error in fetchRoutesByEvent:', error);
    return [];
  }
};

// Вспомогательные функции

// Функция для преобразования данных маршрута из Supabase в тип Route
const transformRouteData = (routeData: any): Route => {
  // Извлечем название с учетом мультиязычности
  const name: Record<Language, string> = {
    en: routeData.name?.en || '',
    ru: routeData.name?.ru || '',
    hi: routeData.name?.hi || ''
  };
  
  // Извлечем описание (если есть)
  const description: Record<Language, string> = {
    en: routeData.info?.en || '',
    ru: routeData.info?.ru || '',
    hi: routeData.info?.hi || ''
  };
  
  // Подготовим медиа и thumbnail
  const media = routeData.images && Array.isArray(routeData.images) 
    ? routeData.images.map((img: string) => ({ url: img, type: 'image' })) 
    : [];
  
  const thumbnail = routeData.images && Array.isArray(routeData.images) && routeData.images.length > 0 
    ? routeData.images[0] 
    : '';
  
  // Сформируем объект маршрута в соответствии с интерфейсом Route
  return {
    id: routeData.id,
    name,
    description,
    pointIds: routeData.spots || [],
    media,
    thumbnail,
    cityId: routeData.city || null,
    eventIds: routeData.events || []
  };
};

// Основная функция для получения всех маршрутов
async function fetchRoutes(): Promise<Route[]> {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
    
    if (!data) return [];
    
    return data.map(transformRouteData);
  } catch (error) {
    console.error('Error in fetchRoutes:', error);
    return [];
  }
}

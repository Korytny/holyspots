
import { supabase } from '@/integrations/supabase/client';
import { Point, Language, MediaItem, GeoPoint } from '../types/models';

// Функция преобразования данных из БД в модель Point
const transformSpotToPoint = (spotData: any): Point => {
  // Обработка имени
  let parsedName: Record<Language, string> = { en: 'Unknown spot', ru: 'Неизвестная точка', hi: 'अज्ञात स्थान' };
  try {
    if (typeof spotData.name === 'string') {
      parsedName = JSON.parse(spotData.name);
    } else if (spotData.name && typeof spotData.name === 'object') {
      parsedName = spotData.name;
    }
  } catch (e) {
    console.warn('Could not parse spot name:', e);
  }
  
  // Обработка описания
  let parsedDescription: Record<Language, string> = { en: '', ru: '', hi: '' };
  try {
    if (typeof spotData.info === 'string') {
      parsedDescription = JSON.parse(spotData.info);
    } else if (spotData.info && typeof spotData.info === 'object') {
      parsedDescription = spotData.info;
    }
  } catch (e) {
    console.warn('Could not parse spot description:', e);
  }
  
  // Обработка медиа и картинок
  let mediaItems: MediaItem[] = [];
  let imageArray: string[] = [];
  let thumbnail = '/placeholder.svg';
  
  if (spotData.images) {
    try {
      if (Array.isArray(spotData.images)) {
        imageArray = spotData.images.filter(img => typeof img === 'string');
      } else if (typeof spotData.images === 'string') {
        imageArray = JSON.parse(spotData.images);
      }
      
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
    } catch (e) {
      console.warn('Could not parse spot images:', e);
    }
  }
  
  // Обработка координат
  let location = { latitude: 0, longitude: 0 };
  let geoPoint: GeoPoint = {
    type: "Point",
    coordinates: [0, 0]
  };
  
  if (spotData.point && typeof spotData.point === 'object') {
    // Если есть геоточка
    if (spotData.point.coordinates && Array.isArray(spotData.point.coordinates)) {
      geoPoint = {
        type: "Point",
        coordinates: [
          Number(spotData.point.coordinates[0]), 
          Number(spotData.point.coordinates[1])
        ]
      };
      location = {
        longitude: Number(spotData.point.coordinates[0]),
        latitude: Number(spotData.point.coordinates[1])
      };
    }
  } else if (spotData.coordinates && typeof spotData.coordinates === 'object') {
    // Простые координаты
    location = {
      latitude: Number(spotData.coordinates.latitude || 0),
      longitude: Number(spotData.coordinates.longitude || 0)
    };
    
    if (location.latitude !== 0 || location.longitude !== 0) {
      geoPoint = {
        type: "Point",
        coordinates: [location.longitude, location.latitude]
      };
    }
  }
  
  return {
    id: spotData.id,
    cityId: spotData.city || '',
    type: spotData.type ? 'temple' : 'other',
    name: parsedName,
    description: parsedDescription,
    media: mediaItems,
    thumbnail,
    location,
    routeIds: [],
    eventIds: [],
    point: geoPoint
  };
};

// Получение всех точек
export const fetchAllPoints = async (): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*');
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error('Error fetching all points:', error);
    return [];
  }
};

// Получение точки по ID
export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', pointId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformSpotToPoint(data);
  } catch (error) {
    console.error(`Error fetching point with ID ${pointId}:`, error);
    return null;
  }
};

// Получение точек города
export const fetchPointsByCity = async (cityId: string): Promise<Point[]> => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for city ID ${cityId}:`, error);
    return [];
  }
};

// Получение точек маршрута
export const fetchPointsByRouteId = async (routeId: string): Promise<Point[]> => {
  try {
    // Сначала получаем маршрут, чтобы узнать ID точек
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .select('spots')
      .eq('id', routeId)
      .maybeSingle();
    
    if (routeError) throw routeError;
    if (!routeData || !routeData.spots) return [];
    
    let spotIds: string[] = [];
    try {
      if (Array.isArray(routeData.spots)) {
        spotIds = routeData.spots;
      } else if (typeof routeData.spots === 'string') {
        spotIds = JSON.parse(routeData.spots);
      }
    } catch (e) {
      console.warn('Could not parse route spots:', e);
      return [];
    }
    
    if (spotIds.length === 0) return [];
    
    // Получаем сами точки
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for route ID ${routeId}:`, error);
    return [];
  }
};

// Получение точек события
export const fetchPointsByEventId = async (eventId: string): Promise<Point[]> => {
  try {
    const { data: junctions, error: junctionError } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (junctionError) throw junctionError;
    if (!junctions || junctions.length === 0) return [];
    
    const spotIds = junctions.map(j => j.spot_id);
    
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error(`Error fetching points for event ID ${eventId}:`, error);
    return [];
  }
};

// Для обратной совместимости
export const fetchPointsByCityId = fetchPointsByCity;

// Вспомогательная функция для получения точек по списку ID
export const fetchPointsByIds = async (pointIds: string[]): Promise<Point[]> => {
  if (!pointIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', pointIds);
    
    if (error) throw error;
    return (data || []).map(transformSpotToPoint);
  } catch (error) {
    console.error('Error fetching points by IDs:', error);
    return [];
  }
};

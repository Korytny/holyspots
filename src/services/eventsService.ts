
import { supabase } from '../lib/supabase';
import { Event, Language } from '../types/models';

// Базовая функция для преобразования данных из БД в модель Event
const transformEventData = (eventData: any): Event => {
  // Обработка имени
  let parsedName: Record<Language, string> = { en: 'Unknown event', ru: 'Неизвестное событие', hi: 'अज्ञात आयोजन' };
  try {
    if (typeof eventData.name === 'string') {
      parsedName = JSON.parse(eventData.name);
    } else if (eventData.name && typeof eventData.name === 'object') {
      parsedName = eventData.name;
    }
  } catch (e) {
    console.warn('Could not parse event name:', e);
  }
  
  // Обработка описания
  let parsedDescription: Record<Language, string> = { en: '', ru: '', hi: '' };
  try {
    if (typeof eventData.info === 'string') {
      parsedDescription = JSON.parse(eventData.info);
    } else if (eventData.info && typeof eventData.info === 'object') {
      parsedDescription = eventData.info;
    }
  } catch (e) {
    console.warn('Could not parse event description:', e);
  }
  
  // Обработка изображений
  let mediaItems = [];
  let thumbnail = '/placeholder.svg';
  
  if (eventData.images) {
    let images = [];
    try {
      if (Array.isArray(eventData.images)) {
        images = eventData.images;
      } else if (typeof eventData.images === 'string') {
        images = JSON.parse(eventData.images);
      }
      
      if (images.length > 0) {
        thumbnail = images[0];
      }
    } catch (e) {
      console.warn('Could not parse event images:', e);
    }
  }
  
  return {
    id: eventData.id,
    cityId: eventData.city_id || '',
    name: parsedName,
    description: parsedDescription,
    media: mediaItems,
    thumbnail: thumbnail,
    pointIds: [],
    startDate: eventData.time || '',
    endDate: eventData.end_time || '',
    type: eventData.type
  };
};

// Функция для получения всех событий
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) throw error;
    return data.map(transformEventData);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Функция для получения события по ID
export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return transformEventData(data);
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return null;
  }
};

// Функция для получения событий города
export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('city_id', cityId);
    
    if (error) throw error;
    return data.map(transformEventData);
  } catch (error) {
    console.error(`Error fetching events for city ${cityId}:`, error);
    return [];
  }
};

// Функция для получения событий, связанных с точкой
export const fetchEventsByPoint = async (pointId: string): Promise<Event[]> => {
  try {
    const { data: junctions, error: junctionError } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', pointId);
    
    if (junctionError) throw junctionError;
    if (!junctions || junctions.length === 0) return [];
    
    const eventIds = junctions.map(j => j.event_id);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (error) throw error;
    return data.map(transformEventData);
  } catch (error) {
    console.error(`Error fetching events for point ${pointId}:`, error);
    return [];
  }
};

// Функция для получения событий маршрута
export const fetchEventsByRoute = async (routeId: string): Promise<Event[]> => {
  try {
    const { data: junctions, error: junctionError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);
    
    if (junctionError) throw junctionError;
    if (!junctions || junctions.length === 0) return [];
    
    const eventIds = junctions.map(j => j.event_id);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (error) throw error;
    return data.map(transformEventData);
  } catch (error) {
    console.error(`Error fetching events for route ${routeId}:`, error);
    return [];
  }
};

// Вспомогательная функция для получения событий по ID
export const fetchEventsByIds = async (eventIds: string[]): Promise<Event[]> => {
  if (!eventIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (error) throw error;
    return data.map(transformEventData);
  } catch (error) {
    console.error(`Error fetching events by IDs:`, error);
    return [];
  }
};

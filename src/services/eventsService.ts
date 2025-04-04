import { supabase } from '@/integrations/supabase/client';
import { Event, Language } from '../types/models';

/**
 * Fetches events by cityId
 */
export const fetchEventsByCityId = async (cityId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('cityId', cityId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(event => mapEventData(event));
  } catch (error) {
    console.error('Error fetching events by cityId:', error);
    throw error;
  }
};

/**
 * Fetches a single event by id
 */
export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Transform data to our model
    return mapEventData(data);
  } catch (error) {
    console.error('Error fetching event by id:', error);
    throw error;
  }
};

/**
 * Fetches all events
 */
export const fetchAllEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform Supabase data to our model
    return data.map(event => mapEventData(event));
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

// Добавьте следующую вспомогательную функцию в начало файла или перед первым использованием
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

// И везде, где в mapEventData (или похожих функциях) используется доступ к несуществующим полям,
// замените следующим кодом:

// Эта функция должна быть модифицирована для корректной обработки данных из базы
const mapEventData = (event: any): Event => {
  // Пример безопасной обработки полей
  const nameRecord = tryParseJson(event.name, {
    en: 'Unknown Event', ru: 'Неизвестное событие', hi: 'अज्ञात कार्यक्रम'
  });
  
  const descriptionRecord = tryParseJson(event.info, {
    en: '', ru: '', hi: ''
  });
  
  // Добавляем значения по умолчанию, если поля в базе данных отсутствуют
  return {
    id: event.id,
    cityId: event.cityId || 'unknown',
    name: nameRecord,
    description: descriptionRecord,
    media: [], // Присваиваем пустой массив, так как поле media не существует в базе
    thumbnail: '/placeholder.svg', // Используем заглушку если нет изображения
    pointIds: event.pointIds || [],
    startDate: event.startDate || new Date().toISOString(),
    endDate: event.endDate || new Date().toISOString(),
    ownerId: event.ownerId, // Поле отсутствует в базе
    type: event.type
  };
};

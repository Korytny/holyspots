
import { supabase } from '../lib/supabase';
import { Event, Language } from '../types/models';

// Basic function to transform data from DB to Event model
const transformEventData = (eventData: any): Event => {
  // Process name
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
  
  // Process description
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
  
  // Process images
  let imageArray: string[] = [];
  let thumbnail = '/placeholder.svg';
  
  try {
    if (eventData.images) {
      if (Array.isArray(eventData.images)) {
        imageArray = eventData.images;
      } else if (typeof eventData.images === 'string') {
        imageArray = JSON.parse(eventData.images);
      } else if (typeof eventData.images === 'object') {
        imageArray = Object.values(eventData.images);
      }
      
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
      }
    }
  } catch (e) {
    console.warn('Could not parse event images:', e);
  }
  
  return {
    id: eventData.id,
    cityId: eventData.city_id || '',
    name: parsedName,
    description: parsedDescription,
    media: [],
    thumbnail: thumbnail,
    pointIds: [],
    startDate: eventData.time || '',
    endDate: eventData.end_time || '',
    type: eventData.type,
    images: imageArray
  };
};

// Function to get all events
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

// Function to get an event by ID
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

// Function to get events by city
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

// Function to get events by point ID
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

// Function to get events by route
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

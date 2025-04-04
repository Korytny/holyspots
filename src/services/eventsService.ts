
// Importing the necessary modules
import { supabase } from '@/integrations/supabase/client';
import { Event, Language } from '../types/models';
import { Json } from '@/types/supabase';

// Helper function to parse JSON safely
const safeParseJson = (json: Json | null): any => {
  if (!json) return null;
  
  if (typeof json === 'object') return json;
  
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return json;
  }
};

// Function to fetch all events
export const fetchAllEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  if (error) throw error;
  
  return data?.map(event => {
    const nameData = safeParseJson(event.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञात' };
    const infoData = safeParseJson(event.info) || { en: '', ru: '', hi: '' };
    const imagesData = safeParseJson(event.images) || [];
    
    return {
      id: event.id,
      cityId: 'unknown', // Placeholder as cityId is not directly available in the data
      name: nameData as Record<Language, string>,
      description: infoData as Record<Language, string>,
      media: imagesData,
      thumbnail: Array.isArray(imagesData) && imagesData.length > 0 
        ? imagesData[0] 
        : 'placeholder.svg',
      date: event.time || new Date().toISOString(),
      pointIds: [],
      ownerId: 'unknown'
    };
  }) || [];
};

// Function to fetch an event by ID
export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  
  if (!data) return null;
  
  const nameData = safeParseJson(data.name) || { en: 'Unknown', ru: 'Неизвестно', hi: 'अज्ञат' };
  const infoData = safeParseJson(data.info) || { en: '', ru: '', hi: '' };
  const imagesData = safeParseJson(data.images) || [];
  
  return {
    id: data.id,
    cityId: 'unknown', // Placeholder for missing data
    name: nameData as Record<Language, string>,
    description: infoData as Record<Language, string>,
    media: imagesData,
    thumbnail: Array.isArray(imagesData) && imagesData.length > 0 
      ? imagesData[0] 
      : 'placeholder.svg',
    date: data.time || new Date().toISOString(),
    pointIds: [],
    ownerId: 'unknown'
  };
};

// Function to fetch events by city ID
export const fetchEventsByCityId = async (cityId: string): Promise<Event[]> => {
  // This would require a query to get events by city ID
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

// Function to fetch events by point ID
export const fetchEventsByPointId = async (pointId: string): Promise<Event[]> => {
  // This would require a query to get events associated with a specific point
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

// Function to fetch events by route ID
export const fetchEventsByRouteId = async (routeId: string): Promise<Event[]> => {
  // This would require a query to get events associated with a specific route
  // Since this functionality isn't fully implemented, we'll return an empty array for now
  return [];
};

// Adding these aliases for compatibility
export const fetchEventsByCity = fetchEventsByCityId;
export const fetchEventsBySpot = fetchEventsByPointId;

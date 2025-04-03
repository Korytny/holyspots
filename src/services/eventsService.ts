
import { supabase } from '../lib/supabase';
import { Event } from '../types/models';

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  console.log('Fetching events for city:', cityId);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data.length} events for city ${cityId}`);
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.city || '',
    name: eventData.name as Record<string, string>,
    description: eventData.info as Record<string, string>,
    media: eventData.media || [],
    thumbnail: eventData.images && eventData.images.length > 0 ? eventData.images[0] : '/placeholder.svg',
    pointIds: eventData.spot || [],
    startDate: eventData.time || '',
    endDate: eventData.time || '',
    ownerId: eventData.ownerId,
  }));
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    cityId: data.city || '',
    name: data.name as Record<string, string>,
    description: data.info as Record<string, string>,
    media: data.media || [],
    thumbnail: data.images && data.images.length > 0 ? data.images[0] : '/placeholder.svg',
    pointIds: data.spot || [],
    startDate: data.time || '',
    endDate: data.time || '',
    ownerId: data.ownerId,
  };
};

// New function to fetch events by spot ID
export const fetchEventsBySpot = async (spotId: string): Promise<Event[]> => {
  console.log('Fetching events for spot:', spotId);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .contains('spot', [spotId]);
  
  if (error) {
    console.error('Error fetching events for spot:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data.length} events for spot ${spotId}`);
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.city || '',
    name: eventData.name as Record<string, string>,
    description: eventData.info as Record<string, string>,
    media: eventData.media || [],
    thumbnail: eventData.images && eventData.images.length > 0 ? eventData.images[0] : '/placeholder.svg',
    pointIds: eventData.spot || [],
    startDate: eventData.time || '',
    endDate: eventData.time || '',
    ownerId: eventData.ownerId,
  }));
};

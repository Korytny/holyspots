
import { supabase } from '../lib/supabase';
import { Event } from '../types/models';

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  
  return data.map((eventData): Event => ({
    id: eventData.id.toString(),
    cityId: eventData.city?.toString() || '',
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
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Event not found
    }
    console.error('Error fetching event:', error);
    throw error;
  }
  
  return {
    id: data.id.toString(),
    cityId: data.city?.toString() || '',
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


import { supabase } from '../lib/supabase';
import { Event } from '../types/models';

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.cityId,
    name: eventData.name as Record<string, string>,
    description: eventData.description as Record<string, string>,
    media: eventData.media as any[],
    thumbnail: eventData.thumbnail,
    pointIds: eventData.pointIds || [],
    startDate: eventData.startDate,
    endDate: eventData.endDate,
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
    id: data.id,
    cityId: data.cityId,
    name: data.name as Record<string, string>,
    description: data.description as Record<string, string>,
    media: data.media as any[],
    thumbnail: data.thumbnail,
    pointIds: data.pointIds || [],
    startDate: data.startDate,
    endDate: data.endDate,
    ownerId: data.ownerId,
  };
};

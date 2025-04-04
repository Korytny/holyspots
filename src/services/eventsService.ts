
import { supabase } from '@/integrations/supabase/client';
import { Event, Language, Json } from '../types/models';

export const fetchAllEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("No events found");
      return [];
    }
    
    // Transform database records to Event objects
    const events: Event[] = data.map(item => ({
      id: item.id,
      cityId: item.city || '', // Assuming city field matches cityId in the model
      name: item.name as Record<Language, string>,
      description: item.info as Record<Language, string>,
      media: item.images || [],
      thumbnail: Array.isArray(item.images) && item.images.length > 0 
        ? item.images[0] 
        : typeof item.images === 'object' && item.images !== null 
          ? Object.values(item.images)[0] || '/placeholder.svg'
          : '/placeholder.svg',
      pointIds: [],
      startDate: item.time || new Date().toISOString(),
      endDate: item.time || new Date().toISOString(),
      type: item.type
    }));
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No event found with ID ${eventId}`);
        return null;
      }
      throw error;
    }
    
    if (!data) {
      console.log(`No event found with ID ${eventId}`);
      return null;
    }
    
    // Transform database record to Event object
    const event: Event = {
      id: data.id,
      cityId: data.city || '', // Assuming city field matches cityId in the model
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      media: data.images || [],
      thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] 
        : typeof data.images === 'object' && data.images !== null 
          ? Object.values(data.images)[0] || '/placeholder.svg'
          : '/placeholder.svg',
      pointIds: [],
      startDate: data.time || new Date().toISOString(),
      endDate: data.time || new Date().toISOString(),
      type: data.type
    };
    
    return event;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return null;
  }
};

export const fetchEventsByCityId = async (cityId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('city', cityId); // Assuming city field matches cityId in the model
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found for city ID ${cityId}`);
      return [];
    }
    
    // Transform database records to Event objects
    const events: Event[] = data.map(item => ({
      id: item.id,
      cityId: item.city || '', // Assuming city field matches cityId in the model
      name: item.name as Record<Language, string>,
      description: item.info as Record<Language, string>,
      media: item.images || [],
      thumbnail: Array.isArray(item.images) && item.images.length > 0 
        ? item.images[0] 
        : typeof item.images === 'object' && item.images !== null 
          ? Object.values(item.images)[0] || '/placeholder.svg'
          : '/placeholder.svg',
      pointIds: [],
      startDate: item.time || new Date().toISOString(),
      endDate: item.time || new Date().toISOString(),
      type: item.type
    }));
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchEventsByRouteId = async (routeId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found for route ID ${routeId}`);
      return [];
    }
    
    const eventIds = data.map(item => item.event_id);
    
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (eventsError) throw eventsError;
    
    if (!eventsData || eventsData.length === 0) {
      console.log(`No events found with IDs ${eventIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Event objects
    const events: Event[] = eventsData.map(item => ({
      id: item.id,
      cityId: item.city || '', // Assuming city field matches cityId in the model
      name: item.name as Record<Language, string>,
      description: item.info as Record<Language, string>,
      media: item.images || [],
      thumbnail: Array.isArray(item.images) && item.images.length > 0 
        ? item.images[0] 
        : typeof item.images === 'object' && item.images !== null 
          ? Object.values(item.images)[0] || '/placeholder.svg'
          : '/placeholder.svg',
      pointIds: [],
      startDate: item.time || new Date().toISOString(),
      endDate: item.time || new Date().toISOString(),
      type: item.type
    }));
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for route ID ${routeId}:`, error);
    return [];
  }
};


import { supabase } from '../integrations/supabase/client';
import { Event } from '../types/models';
import { Json } from '../types/supabase';

// Define MediaItem type
interface MediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

// Function to fetch all events
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    
    // Transform the raw data into Event objects
    const events: Event[] = data.map(event => ({
      id: event.id,
      cityId: event.city || null,
      name: event.name as Record<string, string> || { en: 'Unnamed Event' },
      description: event.info as Record<string, string> || {},
      startDate: event.time || null,
      endDate: event.end_time || null,
      media: event.images || [],
      thumbnail: Array.isArray(event.images) && event.images.length > 0 
        ? event.images[0] as string 
        : 'placeholder.svg',
      pointIds: event.points as string[] || [],
      type: event.type || false
    }));
    
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
};

// Function to fetch an event by ID
export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    let media: MediaItem[] = [];
    
    if (Array.isArray(data.images)) {
      media = data.images.map((url: string) => ({
        url,
        type: 'image'
      }));
    }
    
    // Transform the raw data into an Event object
    const event: Event = {
      id: data.id,
      cityId: data.city || null,
      name: data.name as Record<string, string> || { en: 'Unnamed Event' },
      description: data.info as Record<string, string> || {},
      startDate: data.time || null,
      endDate: data.end_time || null,
      media: data.images || [],
      thumbnail: Array.isArray(data.images) && data.images.length > 0 
        ? data.images[0] as string 
        : 'placeholder.svg',
      pointIds: data.points as string[] || [],
      type: data.type || false
    };
    
    return event;
  } catch (error) {
    console.error(`Failed to fetch event ${eventId}:`, error);
    return null;
  }
};

// Function to fetch events by city ID
export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('city', cityId);
    
    if (error) {
      console.error(`Error fetching events for city ${cityId}:`, error);
      throw error;
    }
    
    // Transform the raw data into Event objects
    const events: Event[] = data.map(event => ({
      id: event.id,
      cityId: event.city || null,
      name: event.name as Record<string, string> || { en: 'Unnamed Event' },
      description: event.info as Record<string, string> || {},
      startDate: event.time || null,
      endDate: event.end_time || null,
      media: event.images || [],
      thumbnail: Array.isArray(event.images) && event.images.length > 0 
        ? event.images[0] as string 
        : 'placeholder.svg',
      pointIds: event.points as string[] || [],
      type: event.type || false
    }));
    
    return events;
  } catch (error) {
    console.error(`Failed to fetch events for city ${cityId}:`, error);
    return [];
  }
};

// Function to fetch events by point ID
export const fetchEventsByPoint = async (pointId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .contains('points', [pointId]);
    
    if (error) {
      console.error(`Error fetching events for point ${pointId}:`, error);
      throw error;
    }
    
    // Transform the raw data into Event objects
    const events: Event[] = data.map(event => {
      let media: MediaItem[] = [];
      
      if (Array.isArray(event.images)) {
        media = event.images.map((url: string) => ({
          url,
          type: 'image'
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: event.images || [],
        thumbnail: Array.isArray(event.images) && event.images.length > 0 
          ? event.images[0] as string 
          : 'placeholder.svg',
        pointIds: event.points as string[] || [],
        type: event.type || false
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Failed to fetch events for point ${pointId}:`, error);
    return [];
  }
};

// Function to fetch events by route ID
export const fetchEventsByRoute = async (routeId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .contains('routes', [routeId]);
    
    if (error) {
      console.error(`Error fetching events for route ${routeId}:`, error);
      throw error;
    }
    
    // Transform the raw data into Event objects
    const events: Event[] = data.map(event => {
      let media: MediaItem[] = [];
      
      if (Array.isArray(event.images)) {
        media = event.images.map((url: string) => ({
          url,
          type: 'image'
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: event.images || [],
        thumbnail: Array.isArray(event.images) && event.images.length > 0 
          ? event.images[0] as string 
          : 'placeholder.svg',
        pointIds: event.points as string[] || [],
        type: event.type || false
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Failed to fetch events for route ${routeId}:`, error);
    return [];
  }
};

// Function to fetch points by event ID
export const fetchPointsByEventId = async (eventId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('points')
      .eq('id', eventId)
      .single();
    
    if (error || !data) {
      console.error(`Error fetching points for event ${eventId}:`, error);
      return [];
    }
    
    return data.points as string[] || [];
  } catch (error) {
    console.error(`Failed to fetch points for event ${eventId}:`, error);
    return [];
  }
};

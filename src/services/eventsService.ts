
import { supabase } from '../integrations/supabase/client';
import { Event, MediaItem } from '../types/models';
import { Json } from '../types/supabase';

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
    const events: Event[] = data.map(event => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (event.images) {
        if (Array.isArray(event.images)) {
          imageArray = event.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof event.images === 'object' && event.images !== null) {
          imageArray = Object.values(event.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: mediaItems,
        thumbnail: Array.isArray(imageArray) && imageArray.length > 0 
          ? imageArray[0] 
          : 'placeholder.svg',
        pointIds: event.points as string[] || [],
        type: event.type || false
      };
    });
    
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
    
    // Create media items from images
    let mediaItems: MediaItem[] = [];
    let imageArray: string[] = [];
    
    if (data.images) {
      if (Array.isArray(data.images)) {
        imageArray = data.images.filter(img => typeof img === 'string') as string[];
      } else if (typeof data.images === 'object' && data.images !== null) {
        imageArray = Object.values(data.images)
          .filter(img => typeof img === 'string') as string[];
      }
      
      mediaItems = imageArray.map((url, index) => ({
        id: `image-${index}`,
        type: 'image',
        url,
        thumbnailUrl: url,
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
      media: mediaItems,
      thumbnail: Array.isArray(imageArray) && imageArray.length > 0 
        ? imageArray[0] 
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
    const events: Event[] = data.map(event => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (event.images) {
        if (Array.isArray(event.images)) {
          imageArray = event.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof event.images === 'object' && event.images !== null) {
          imageArray = Object.values(event.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: mediaItems,
        thumbnail: Array.isArray(imageArray) && imageArray.length > 0 
          ? imageArray[0] 
          : 'placeholder.svg',
        pointIds: event.points as string[] || [],
        type: event.type || false
      };
    });
    
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
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (event.images) {
        if (Array.isArray(event.images)) {
          imageArray = event.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof event.images === 'object' && event.images !== null) {
          imageArray = Object.values(event.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: mediaItems,
        thumbnail: Array.isArray(imageArray) && imageArray.length > 0 
          ? imageArray[0] 
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
    // Query for events related to a specific route
    const { data: routeEventData, error: routeEventError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);
    
    if (routeEventError || !routeEventData || routeEventData.length === 0) {
      console.error(`Error fetching events for route ${routeId}:`, routeEventError);
      return [];
    }
    
    const eventIds = routeEventData.map(item => item.event_id);
    
    // Fetch the events with those IDs
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (error) {
      console.error(`Error fetching events with IDs ${eventIds.join(', ')}:`, error);
      return [];
    }
    
    // Transform the raw data into Event objects
    const events: Event[] = data.map(event => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (event.images) {
        if (Array.isArray(event.images)) {
          imageArray = event.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof event.images === 'object' && event.images !== null) {
          imageArray = Object.values(event.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      return {
        id: event.id,
        cityId: event.city || null,
        name: event.name as Record<string, string> || { en: 'Unnamed Event' },
        description: event.info as Record<string, string> || {},
        startDate: event.time || null,
        endDate: event.end_time || null,
        media: mediaItems,
        thumbnail: Array.isArray(imageArray) && imageArray.length > 0 
          ? imageArray[0] 
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
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (error || !data) {
      console.error(`Error fetching points for event ${eventId}:`, error);
      return [];
    }
    
    return data.map(item => item.spot_id);
  } catch (error) {
    console.error(`Failed to fetch points for event ${eventId}:`, error);
    return [];
  }
};

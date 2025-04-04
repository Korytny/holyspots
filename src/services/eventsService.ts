import { supabase } from '@/integrations/supabase/client';
import { Event, Language, MediaItem, Json } from '../types/models';

export const fetchEvents = async (): Promise<Event[]> => {
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
    const events: Event[] = data.map(item => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (item.images) {
        if (Array.isArray(item.images)) {
          imageArray = item.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof item.images === 'object' && item.images !== null) {
          imageArray = Object.values(item.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
      }
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        startDate: item.time,
        endDate: '',
        media: mediaItems,
        thumbnail,
        pointIds: [],
        type: item.type
      };
    });
    
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
      .maybeSingle();
    
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
    
    // Get a valid thumbnail
    let thumbnail = '/placeholder.svg';
    if (imageArray.length > 0) {
      thumbnail = imageArray[0];
    }
    
    const event: Event = {
      id: data.id,
      cityId: '',
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      startDate: data.time,
      endDate: '',
      media: mediaItems,
      thumbnail,
      pointIds: [],
      type: data.type
    };
    
    return event;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return null;
  }
};

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  try {
    // Query to get all events that contain spots from this city
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);
    
    if (spotsError) throw spotsError;
    
    if (!spots || spots.length === 0) {
      console.log(`No spots found for city ID ${cityId}`);
      return [];
    }
    
    // Get spot IDs
    const spotIds = spots.map(spot => spot.id);
    
    // Extract event IDs from spot_event join table
    const { data: spotEvents, error: spotEventsError } = await supabase
      .from('spot_event')
      .select('event_id')
      .in('spot_id', spotIds);
    
    if (spotEventsError) throw spotEventsError;
    
    if (!spotEvents || spotEvents.length === 0) {
      console.log(`No events found for city ID ${cityId} via spots`);
      return [];
    }
    
    // Get unique event IDs
    const eventIds = [...new Set(spotEvents.map(item => item.event_id))];
    
    // Fetch the events by their IDs
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found with IDs ${eventIds.join(', ')}`);
      return [];
    }
    
    // Transform database records to Event objects
    const events: Event[] = data.map(item => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (item.images) {
        if (Array.isArray(item.images)) {
          imageArray = item.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof item.images === 'object' && item.images !== null) {
          imageArray = Object.values(item.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
      }
      
      return {
        id: item.id,
        cityId,
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        startDate: item.time,
        endDate: '',
        media: mediaItems,
        thumbnail,
        pointIds: [],
        type: item.type
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchEventsByPoint = async (pointId: string): Promise<Event[]> => {
  try {
    // Query the join table to get events associated with this spot
    const { data, error } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', pointId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found for spot ID ${pointId}`);
      return [];
    }
    
    const eventIds = data.map(item => item.event_id);
    
    // Fetch the events by their IDs
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
    const events: Event[] = eventsData.map(item => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (item.images) {
        if (Array.isArray(item.images)) {
          imageArray = item.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof item.images === 'object' && item.images !== null) {
          imageArray = Object.values(item.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
      }
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        startDate: item.time,
        endDate: '',
        media: mediaItems,
        thumbnail,
        pointIds: [pointId],
        type: item.type
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for spot ID ${pointId}:`, error);
    return [];
  }
};

export const fetchEventsByRoute = async (routeId: string): Promise<Event[]> => {
  try {
    // Query the join table to get events associated with this route
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
    
    // Fetch the events by their IDs
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
    const events: Event[] = eventsData.map(item => {
      // Create media items from images
      let mediaItems: MediaItem[] = [];
      let imageArray: string[] = [];
      
      if (item.images) {
        if (Array.isArray(item.images)) {
          imageArray = item.images.filter(img => typeof img === 'string') as string[];
        } else if (typeof item.images === 'object' && item.images !== null) {
          imageArray = Object.values(item.images)
            .filter(img => typeof img === 'string') as string[];
        }
        
        mediaItems = imageArray.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url,
          thumbnailUrl: url,
        }));
      }
      
      // Get a valid thumbnail
      let thumbnail = '/placeholder.svg';
      if (imageArray.length > 0) {
        thumbnail = imageArray[0];
      }
      
      return {
        id: item.id,
        cityId: '',
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        startDate: item.time,
        endDate: '',
        media: mediaItems,
        thumbnail,
        pointIds: [],
        type: item.type
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for route ID ${routeId}:`, error);
    return [];
  }
};

export const fetchEventsByIds = async (eventIds: string[]): Promise<any[]> => {
  if (!eventIds.length) return [];
  
  const events = [];
  for (const id of eventIds) {
    const event = await fetchEventById(id);
    if (event) events.push(event);
  }
  
  return events;
};

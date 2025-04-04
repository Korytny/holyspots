import { supabase } from '@/integrations/supabase/client';
import { Event, Language } from '../types/models';

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
    const events: Event[] = data.map(item => {
      const cityId = typeof item.city === 'string' ? item.city : '';
      
      return {
        id: item.id,
        cityId: cityId,
        name: item.name as Record<string, string>, // Fix type recursion
        description: {
          en: '',
          ru: '',
          hi: '',
          ...(((item.info as any) || {})?.description || {})
        },
        date: item.time || '',
        media: item.images || [],
        thumbnail: '/placeholder.svg',
        pointIds: [],
        type: item.type || false,
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
    
    // Process media items safely
    let mediaItems: MediaItem[] = [];
    if (data.images) {
      if (Array.isArray(data.images)) {
        mediaItems = data.images.map((url, index) => ({
          id: `image-${index}`,
          type: 'image',
          url: typeof url === 'string' ? url : '',
          thumbnailUrl: typeof url === 'string' ? url : '',
        }));
      } else if (typeof data.images === 'object' && data.images !== null) {
        Object.values(data.images).forEach((url, index) => {
          if (typeof url === 'string') {
            mediaItems.push({
              id: `image-${index}`,
              type: 'image',
              url,
              thumbnailUrl: url,
            });
          }
        });
      }
    }

    // Get a valid thumbnail from images
    let thumbnail = '/placeholder.svg';
    if (Array.isArray(data.images) && data.images.length > 0) {
      const firstImage = data.images[0];
      if (typeof firstImage === 'string') {
        thumbnail = firstImage;
      }
    } else if (typeof data.images === 'object' && data.images !== null) {
      const firstImage = Object.values(data.images)[0];
      if (typeof firstImage === 'string') {
        thumbnail = firstImage;
      }
    }
    
    // Transform database record to Event object
    const event: Event = {
      id: data.id,
      cityId: '', // Default empty string as city may not be present
      name: data.name as Record<Language, string>,
      description: data.info as Record<Language, string>,
      media: mediaItems,
      thumbnail,
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

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('city', cityId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found for city ID ${cityId}`);
      return [];
    }
    
    // Transform database records to Event objects
    const events: Event[] = data.map(item => {
      return {
        id: item.id,
        cityId: cityId, 
        name: item.name as Record<string, string>, // Fix type recursion
        description: {
          en: '',
          ru: '',
          hi: '',
          ...(((item.info as any) || {})?.description || {})
        },
        date: item.time || '',
        media: item.images || [],
        thumbnail: '/placeholder.svg',
        pointIds: [],
        type: item.type || false,
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for city ID ${cityId}:`, error);
    return [];
  }
};

export const fetchEventsByCityId = fetchEventsByCity;

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
    const events: Event[] = eventsData.map(item => {
      // Process media items safely
      let mediaItems: MediaItem[] = [];
      if (item.images) {
        if (Array.isArray(item.images)) {
          mediaItems = item.images.map((url, index) => ({
            id: `image-${index}`,
            type: 'image',
            url: typeof url === 'string' ? url : '',
            thumbnailUrl: typeof url === 'string' ? url : '',
          }));
        } else if (typeof item.images === 'object' && item.images !== null) {
          Object.values(item.images).forEach((url, index) => {
            if (typeof url === 'string') {
              mediaItems.push({
                id: `image-${index}`,
                type: 'image',
                url,
                thumbnailUrl: url,
              });
            }
          });
        }
      }

      // Get a valid thumbnail from images
      let thumbnail = '/placeholder.svg';
      if (Array.isArray(item.images) && item.images.length > 0) {
        const firstImage = item.images[0];
        if (typeof firstImage === 'string') {
          thumbnail = firstImage;
        }
      } else if (typeof item.images === 'object' && item.images !== null) {
        const firstImage = Object.values(item.images)[0];
        if (typeof firstImage === 'string') {
          thumbnail = firstImage;
        }
      }

      return {
        id: item.id,
        cityId: '', // Default empty string as city may not be present
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [],
        startDate: item.time || new Date().toISOString(),
        endDate: item.time || new Date().toISOString(),
        type: item.type
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for route ID ${routeId}:`, error);
    return [];
  }
};

export const fetchEventsByRoute = fetchEventsByRouteId;

export const fetchEventsByPointId = async (pointId: string): Promise<Event[]> => {
  try {
    const { data, error } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', pointId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log(`No events found for point ID ${pointId}`);
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
    const events: Event[] = eventsData.map(item => {
      // Process media items safely
      let mediaItems: MediaItem[] = [];
      if (item.images) {
        if (Array.isArray(item.images)) {
          mediaItems = item.images.map((url, index) => ({
            id: `image-${index}`,
            type: 'image',
            url: typeof url === 'string' ? url : '',
            thumbnailUrl: typeof url === 'string' ? url : '',
          }));
        } else if (typeof item.images === 'object' && item.images !== null) {
          Object.values(item.images).forEach((url, index) => {
            if (typeof url === 'string') {
              mediaItems.push({
                id: `image-${index}`,
                type: 'image',
                url,
                thumbnailUrl: url,
              });
            }
          });
        }
      }

      // Get a valid thumbnail from images
      let thumbnail = '/placeholder.svg';
      if (Array.isArray(item.images) && item.images.length > 0) {
        const firstImage = item.images[0];
        if (typeof firstImage === 'string') {
          thumbnail = firstImage;
        }
      } else if (typeof item.images === 'object' && item.images !== null) {
        const firstImage = Object.values(item.images)[0];
        if (typeof firstImage === 'string') {
          thumbnail = firstImage;
        }
      }

      return {
        id: item.id,
        cityId: '',  // Default empty string as city may not be present
        name: item.name as Record<Language, string>,
        description: item.info as Record<Language, string>,
        media: mediaItems,
        thumbnail,
        pointIds: [pointId], // Include the point ID
        startDate: item.time || new Date().toISOString(),
        endDate: item.time || new Date().toISOString(),
        type: item.type
      };
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching events for point ID ${pointId}:`, error);
    return [];
  }
};

export const fetchEventsBySpot = fetchEventsByPointId;

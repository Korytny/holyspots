import { supabase } from '../lib/supabase';
import { Event } from '../types/models';

export const fetchEventsByCity = async (cityId: string): Promise<Event[]> => {
  console.log('Fetching events for city:', cityId);
  
  // First, get all spots in the city
  const { data: citySpots, error: spotError } = await supabase
    .from('spots')
    .select('id')
    .eq('city', cityId);
  
  if (spotError) {
    console.error('Error fetching city spots:', spotError);
    throw spotError;
  }
  
  if (!citySpots || citySpots.length === 0) {
    return [];
  }
  
  // Get all event IDs that are connected to these spots
  const spotIds = citySpots.map(spot => spot.id);
  const { data: relationData, error: relationError } = await supabase
    .from('spot_event')
    .select('event_id')
    .in('spot_id', spotIds);
  
  if (relationError) {
    console.error('Error fetching spot-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  // Get unique event IDs
  const uniqueEventIds = [...new Set(relationData.map(relation => relation.event_id))];
  
  // Fetch all these events
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', uniqueEventIds);
  
  if (error) {
    console.error('Error fetching events for city spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} events for city ${cityId} through spots`);
  
  return data.map((eventData): Event => {
    // Parse name
    let parsedName = {};
    try {
      parsedName = typeof eventData.name === 'string' 
        ? JSON.parse(eventData.name) 
        : (eventData.name || { en: 'Unnamed Event', ru: 'Событие без названия', hi: 'अनामांकित घटना' });
    } catch (e) {
      parsedName = { en: 'Unnamed Event', ru: 'Событие без названия', hi: 'अनामांकित घटना' };
    }
    
    // Parse info for description
    let parsedInfo = {};
    try {
      parsedInfo = typeof eventData.info === 'string' 
        ? JSON.parse(eventData.info) 
        : (eventData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    // Parse images
    let images: string[] = [];
    try {
      images = Array.isArray(eventData.images) 
        ? eventData.images 
        : (typeof eventData.images === 'string' ? JSON.parse(eventData.images) : []);
    } catch (e) {
      images = [];
    }
    
    return {
      id: eventData.id,
      cityId: '', // Will be populated from relationship or set manually
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      pointIds: [],
      startDate: eventData.time || '',
      endDate: eventData.time || '',
      type: eventData.type
    };
  });
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
  
  // Parse name
  let parsedName = {};
  try {
    parsedName = typeof data.name === 'string' 
      ? JSON.parse(data.name) 
      : (data.name || { en: 'Unnamed Event', ru: 'Событие без названия', hi: 'अनामांकित घटना' });
  } catch (e) {
    parsedName = { en: 'Unnamed Event', ru: 'Событие без названия', hi: 'अनामांकित घटना' };
  }
  
  // Parse info for description
  let parsedInfo = {};
  try {
    parsedInfo = typeof data.info === 'string' 
      ? JSON.parse(data.info) 
      : (data.info || { en: '', ru: '', hi: '' });
  } catch (e) {
    parsedInfo = { en: '', ru: '', hi: '' };
  }
  
  // Parse images
  let images: string[] = [];
  try {
    images = Array.isArray(data.images) 
      ? data.images 
      : (typeof data.images === 'string' ? JSON.parse(data.images) : []);
  } catch (e) {
    images = [];
  }
  
  return {
    id: data.id,
    cityId: '', // Will be populated from relationship or set manually
    name: parsedName as Record<string, string>,
    description: parsedInfo as Record<string, string>,
    media: [],
    thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
    pointIds: [],
    startDate: data.time || '',
    endDate: data.time || '',
    type: data.type
  };
};

export const fetchEventsBySpot = async (spotId: string): Promise<Event[]> => {
  console.log('Fetching events for spot:', spotId);
  
  // Use the spot_event relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('spot_event')
    .select('event_id')
    .eq('spot_id', spotId);
  
  if (relationError) {
    console.error('Error fetching spot-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const eventIds = relationData.map(relation => relation.event_id);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds);
  
  if (error) {
    console.error('Error fetching events for spot:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} events for spot ${spotId}`);
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.city || '',
    name: eventData.name as Record<string, string>,
    description: eventData.info as Record<string, string>,
    media: eventData.media || [],
    thumbnail: eventData.images && eventData.images.length > 0 ? eventData.images[0] : '/placeholder.svg',
    pointIds: eventData.spots || [],
    startDate: eventData.time || '',
    endDate: eventData.time || '',
    ownerId: eventData.ownerId,
  }));
};

export const fetchAllEvents = async (): Promise<Event[]> => {
  console.log('Fetching all events');
  
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  if (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} total events`);
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.city || '',
    name: eventData.name as Record<string, string>,
    description: eventData.info as Record<string, string>,
    media: eventData.media || [],
    thumbnail: eventData.images && eventData.images.length > 0 ? eventData.images[0] : '/placeholder.svg',
    pointIds: eventData.spots || [],
    startDate: eventData.time || '',
    endDate: eventData.time || '',
    ownerId: eventData.ownerId,
  }));
};

export const fetchEventsByRoute = async (routeId: string): Promise<Event[]> => {
  console.log('Fetching events for route:', routeId);
  
  // Use the route_event relationship table
  const { data: relationData, error: relationError } = await supabase
    .from('route_event')
    .select('event_id')
    .eq('route_id', routeId);
  
  if (relationError) {
    console.error('Error fetching route-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const eventIds = relationData.map(relation => relation.event_id);
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds);
  
  if (error) {
    console.error('Error fetching events for route:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} events for route ${routeId}`);
  
  return data.map((eventData): Event => ({
    id: eventData.id,
    cityId: eventData.city || '',
    name: eventData.name as Record<string, string>,
    description: eventData.info as Record<string, string>,
    media: eventData.media || [],
    thumbnail: eventData.images && eventData.images.length > 0 ? eventData.images[0] : '/placeholder.svg',
    pointIds: eventData.spots || [],
    startDate: eventData.time || '',
    endDate: eventData.time || '',
    ownerId: eventData.ownerId,
    type: eventData.type
  }));
};

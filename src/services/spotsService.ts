import { supabase } from '../lib/supabase';
import { Point } from '../types/models';

export const fetchSpotsByCity = async (cityId: string): Promise<Point[]> => {
  console.log('Fetching spots for city:', cityId);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} spots for city ${cityId}`);
  
  return data.map((spotData): Point => {
    // Parse name
    let parsedName = {};
    try {
      parsedName = typeof spotData.name === 'string' 
        ? JSON.parse(spotData.name) 
        : (spotData.name || { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' });
    } catch (e) {
      parsedName = { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' };
    }
    
    // Parse info for description
    let parsedInfo = {};
    try {
      parsedInfo = typeof spotData.info === 'string' 
        ? JSON.parse(spotData.info) 
        : (spotData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    // Parse images
    let images: string[] = [];
    try {
      images = Array.isArray(spotData.images) 
        ? spotData.images 
        : (typeof spotData.images === 'string' ? JSON.parse(spotData.images) : []);
    } catch (e) {
      images = [];
    }
    
    // Handle coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (spotData.coordinates) {
      try {
        const coords = typeof spotData.coordinates === 'string' 
          ? JSON.parse(spotData.coordinates)
          : spotData.coordinates;
        latitude = coords.latitude || 0;
        longitude = coords.longitude || 0;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Determine point type
    let pointType: 'temple' | 'ashram' | 'kund' | 'other' = 'other';
    switch (spotData.type) {
      case 1: pointType = 'temple'; break;
      case 2: pointType = 'ashram'; break;
      case 3: pointType = 'kund'; break;
      default: pointType = 'other';
    }
    
    return {
      id: spotData.id,
      cityId: spotData.city || '',
      type: pointType,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      location: {
        latitude,
        longitude
      },
      point: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      routeIds: [],
      eventIds: []
    };
  });
};

export const fetchSpotById = async (spotId: string): Promise<Point | null> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching spot:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Parse name
  let parsedName = {};
  try {
    parsedName = typeof data.name === 'string' 
      ? JSON.parse(data.name) 
      : (data.name || { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' });
    } catch (e) {
      parsedName = { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' };
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
    
    // Handle coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (data.coordinates) {
      try {
        const coords = typeof data.coordinates === 'string' 
          ? JSON.parse(data.coordinates)
          : data.coordinates;
        latitude = coords.latitude || 0;
        longitude = coords.longitude || 0;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Determine point type
    let pointType: 'temple' | 'ashram' | 'kund' | 'other' = 'other';
    switch (data.type) {
      case 1: pointType = 'temple'; break;
      case 2: pointType = 'ashram'; break;
      case 3: pointType = 'kund'; break;
      default: pointType = 'other';
    }
    
    return {
      id: data.id,
      cityId: data.city || '',
      type: pointType,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      location: {
        latitude,
        longitude
      },
      point: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      routeIds: [],
      eventIds: []
    };
};

export const fetchAllSpots = async (): Promise<Point[]> => {
  console.log('Fetching all spots');
  
  const { data, error } = await supabase
    .from('spots')
    .select('*');
  
  if (error) {
    console.error('Error fetching all spots:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} total spots`);
  
  return data.map((spotData): Point => {
    // Parse name
    let parsedName = {};
    try {
      parsedName = typeof spotData.name === 'string' 
        ? JSON.parse(spotData.name) 
        : (spotData.name || { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' });
    } catch (e) {
      parsedName = { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' };
    }
    
    // Parse info for description
    let parsedInfo = {};
    try {
      parsedInfo = typeof spotData.info === 'string' 
        ? JSON.parse(spotData.info) 
        : (spotData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    // Parse images
    let images: string[] = [];
    try {
      images = Array.isArray(spotData.images) 
        ? spotData.images 
        : (typeof spotData.images === 'string' ? JSON.parse(spotData.images) : []);
    } catch (e) {
      images = [];
    }
    
    // Handle coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (spotData.coordinates) {
      try {
        const coords = typeof spotData.coordinates === 'string' 
          ? JSON.parse(spotData.coordinates)
          : spotData.coordinates;
        latitude = coords.latitude || 0;
        longitude = coords.longitude || 0;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Determine point type
    let pointType: 'temple' | 'ashram' | 'kund' | 'other' = 'other';
    switch (spotData.type) {
      case 1: pointType = 'temple'; break;
      case 2: pointType = 'ashram'; break;
      case 3: pointType = 'kund'; break;
      default: pointType = 'other';
    }
    
    return {
      id: spotData.id,
      cityId: spotData.city || '',
      type: pointType,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      location: {
        latitude,
        longitude
      },
      point: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      routeIds: [],
      eventIds: []
    };
  });
};

export const fetchSpotsByRoute = async (routeId: string): Promise<Point[]> => {
  console.log('Fetching spots for route:', routeId);
  
  const { data: relationData, error: relationError } = await supabase
    .from('spot_route')
    .select('spot_id')
    .eq('route_id', routeId);
  
  if (relationError) {
    console.error('Error fetching spot-route relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const spotIds = relationData.map(relation => relation.spot_id);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', spotIds);
  
  if (error) {
    console.error('Error fetching spots for route:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} spots for route ${routeId}`);
  
  return data.map((spotData): Point => {
    // Parse name
    let parsedName = {};
    try {
      parsedName = typeof spotData.name === 'string' 
        ? JSON.parse(spotData.name) 
        : (spotData.name || { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' });
    } catch (e) {
      parsedName = { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' };
    }
    
    // Parse info for description
    let parsedInfo = {};
    try {
      parsedInfo = typeof spotData.info === 'string' 
        ? JSON.parse(spotData.info) 
        : (spotData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    // Parse images
    let images: string[] = [];
    try {
      images = Array.isArray(spotData.images) 
        ? spotData.images 
        : (typeof spotData.images === 'string' ? JSON.parse(spotData.images) : []);
    } catch (e) {
      images = [];
    }
    
    // Handle coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (spotData.coordinates) {
      try {
        const coords = typeof spotData.coordinates === 'string' 
          ? JSON.parse(spotData.coordinates)
          : spotData.coordinates;
        latitude = coords.latitude || 0;
        longitude = coords.longitude || 0;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Determine point type
    let pointType: 'temple' | 'ashram' | 'kund' | 'other' = 'other';
    switch (spotData.type) {
      case 1: pointType = 'temple'; break;
      case 2: pointType = 'ashram'; break;
      case 3: pointType = 'kund'; break;
      default: pointType = 'other';
    }
    
    return {
      id: spotData.id,
      cityId: spotData.city || '',
      type: pointType,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      location: {
        latitude,
        longitude
      },
      point: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      routeIds: [],
      eventIds: []
    };
  });
};

export const fetchSpotsByEvent = async (eventId: string): Promise<Point[]> => {
  console.log('Fetching spots for event:', eventId);
  
  const { data: relationData, error: relationError } = await supabase
    .from('spot_event')
    .select('spot_id')
    .eq('event_id', eventId);
  
  if (relationError) {
    console.error('Error fetching spot-event relations:', relationError);
    throw relationError;
  }
  
  if (!relationData || relationData.length === 0) {
    return [];
  }
  
  const spotIds = relationData.map(relation => relation.spot_id);
  
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', spotIds);
  
  if (error) {
    console.error('Error fetching spots for event:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} spots for event ${eventId}`);
  
  return data.map((spotData): Point => {
    // Parse name
    let parsedName = {};
    try {
      parsedName = typeof spotData.name === 'string' 
        ? JSON.parse(spotData.name) 
        : (spotData.name || { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' });
    } catch (e) {
      parsedName = { en: 'Unnamed Spot', ru: 'Точка без названия', hi: 'अनामांकित स्थान' };
    }
    
    // Parse info for description
    let parsedInfo = {};
    try {
      parsedInfo = typeof spotData.info === 'string' 
        ? JSON.parse(spotData.info) 
        : (spotData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedInfo = { en: '', ru: '', hi: '' };
    }
    
    // Parse images
    let images: string[] = [];
    try {
      images = Array.isArray(spotData.images) 
        ? spotData.images 
        : (typeof spotData.images === 'string' ? JSON.parse(spotData.images) : []);
    } catch (e) {
      images = [];
    }
    
    // Handle coordinates
    let latitude = 0;
    let longitude = 0;
    
    if (spotData.coordinates) {
      try {
        const coords = typeof spotData.coordinates === 'string' 
          ? JSON.parse(spotData.coordinates)
          : spotData.coordinates;
        latitude = coords.latitude || 0;
        longitude = coords.longitude || 0;
      } catch (e) {
        console.error('Error parsing coordinates:', e);
      }
    }
    
    // Determine point type
    let pointType: 'temple' | 'ashram' | 'kund' | 'other' = 'other';
    switch (spotData.type) {
      case 1: pointType = 'temple'; break;
      case 2: pointType = 'ashram'; break;
      case 3: pointType = 'kund'; break;
      default: pointType = 'other';
    }
    
    return {
      id: spotData.id,
      cityId: spotData.city || '',
      type: pointType,
      name: parsedName as Record<string, string>,
      description: parsedInfo as Record<string, string>,
      media: [],
      images: images,
      thumbnail: images && images.length > 0 ? images[0] : '/placeholder.svg',
      location: {
        latitude: (spotData.point?.coordinates?.[1] as number) || 0,
        longitude: (spotData.point?.coordinates?.[0] as number) || 0
      },
      routeIds: [],
      eventIds: [],
      point: spotData.point
    };
  });
};

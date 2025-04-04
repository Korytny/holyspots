
import { supabase } from '../lib/supabase';
import { Point } from '../types/models';

export const fetchPointById = async (pointId: string): Promise<Point | null> => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', pointId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching point:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Parse and normalize data
  let name = {};
  try {
    name = typeof data.name === 'string' ? JSON.parse(data.name) : data.name;
  } catch (e) {
    name = { en: data.name || 'Unknown', ru: data.name || 'Unknown', hi: data.name || 'Unknown' };
  }
  
  let info = {};
  try {
    info = typeof data.info === 'string' ? JSON.parse(data.info) : data.info;
  } catch (e) {
    info = { en: '', ru: '', hi: '' };
  }
  
  let images: string[] = [];
  try {
    images = Array.isArray(data.images) ? data.images : (
      typeof data.images === 'string' ? JSON.parse(data.images) : []
    );
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
    name: name as Record<string, string>,
    description: info as Record<string, string>,
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

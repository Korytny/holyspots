
import { Route, Language } from '../../types/models';

// Helper function to transform database route to app Route type
export const transformRouteData = (item: any): Route => {
  // Create default language record with empty strings
  const defaultLangRecord: Record<Language, string> = {
    en: '',
    ru: '',
    hi: ''
  };
  
  // Get name with proper language structure or use default
  const name: Record<Language, string> = item.name && typeof item.name === 'object' 
    ? { ...defaultLangRecord, ...item.name }
    : defaultLangRecord;
  
  // Get description with proper language structure or use default
  const description: Record<Language, string> = item.info && typeof item.info === 'object'
    ? { ...defaultLangRecord, ...item.info }
    : defaultLangRecord;
  
  // Process point IDs
  let pointIds: string[] = [];
  if (item.spots && Array.isArray(item.spots)) {
    pointIds = item.spots.filter((spot: any) => typeof spot === 'string');
  }
  
  // Process event IDs
  let eventIds: string[] = [];
  if (item.events && Array.isArray(item.events)) {
    eventIds = item.events.filter((event: any) => typeof event === 'string');
  }
  
  // Get a valid thumbnail
  let thumbnail = '/placeholder.svg';
  if (item.image && typeof item.image === 'string') {
    thumbnail = item.image;
  }
  
  return {
    id: item.id,
    cityId: item.city || '',
    name,
    description,
    thumbnail,
    pointIds,
    eventIds,
    duration: item.duration || 0,
    distance: item.distance || 0
  };
};

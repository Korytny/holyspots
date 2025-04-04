
import { supabase } from '../lib/supabase';
import { Route, Point } from '../types/models';

// Function to fetch all routes with proper parsing
export const fetchAllRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*');
  
  if (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
  
  return data.map((routeData): Route => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof routeData.name === 'string' 
        ? JSON.parse(routeData.name) 
        : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
    } catch (e) {
      parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
    }
    
    // Parse description - use info field from the database if it exists
    let parsedDescription = {};
    try {
      parsedDescription = typeof routeData.info === 'string' 
        ? JSON.parse(routeData.info) 
        : (routeData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    // Parse point IDs from spots array
    let pointIds: string[] = [];
    try {
      pointIds = Array.isArray(routeData.spots) 
        ? routeData.spots 
        : (typeof routeData.spots === 'string' ? JSON.parse(routeData.spots) : []);
    } catch (e) {
      pointIds = [];
    }
    
    return {
      id: routeData.id,
      cityId: routeData.city || '',
      name: parsedName,
      description: parsedDescription,
      media: [], // This would need to be fetched separately
      thumbnail: '/placeholder.svg', // Default thumbnail
      pointIds: pointIds,
      eventIds: [],
      distance: routeData.distance || 0,
      duration: routeData.duration || 0
    };
  });
};

// Function to fetch a specific route by ID
export const fetchRouteById = async (routeId: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Parse JSON data
  let parsedName = {};
  try {
    parsedName = typeof data.name === 'string' 
      ? JSON.parse(data.name) 
      : (data.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
  } catch (e) {
    parsedName = { en: data.name || 'Unknown route', ru: data.name || 'Неизвестный маршрут', hi: data.name || 'अज्ञात मार्ग' };
  }
  
  // Parse description - use info field from database
  let parsedDescription = {};
  try {
    parsedDescription = typeof data.info === 'string' 
      ? JSON.parse(data.info) 
      : (data.info || { en: '', ru: '', hi: '' });
  } catch (e) {
    parsedDescription = { en: '', ru: '', hi: '' };
  }
  
  // Parse point IDs
  let pointIds: string[] = [];
  try {
    pointIds = Array.isArray(data.spots) 
      ? data.spots 
      : (typeof data.spots === 'string' ? JSON.parse(data.spots) : []);
  } catch (e) {
    pointIds = [];
  }
  
  return {
    id: data.id,
    cityId: data.city || '',
    name: parsedName,
    description: parsedDescription,
    media: [], // This would need to be fetched separately
    thumbnail: '/placeholder.svg', // Default thumbnail
    pointIds: pointIds,
    eventIds: [],
    distance: data.distance || 0,
    duration: data.duration || 0
  };
};

// Function to fetch all points associated with a specific route
export const fetchRoutePoints = async (routeId: string): Promise<Point[]> => {
  const route = await fetchRouteById(routeId);
  if (!route) return [];
  
  // If no point IDs, return empty array
  if (!route.pointIds || route.pointIds.length === 0) return [];
  
  // Fetch points by their IDs
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .in('id', route.pointIds);
  
  if (error) {
    console.error('Error fetching route points:', error);
    throw error;
  }
  
  return data.map(point => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof point.name === 'string' 
        ? JSON.parse(point.name) 
        : (point.name || { en: 'Unknown point', ru: 'Неизвестная точка', hi: 'अज्ञात बिंदु' });
    } catch (e) {
      parsedName = { en: point.name || 'Unknown point', ru: point.name || 'Неизвестная точка', hi: point.name || 'अज्ञात बिंदु' };
    }
    
    // Parse description
    let parsedDescription = {};
    try {
      parsedDescription = typeof point.info === 'string' 
        ? JSON.parse(point.info) 
        : (point.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    // Parse location data
    let location = { latitude: 0, longitude: 0 };
    if (point.point && point.point.coordinates) {
      // GeoJSON format: [longitude, latitude]
      location = {
        longitude: point.point.coordinates[0],
        latitude: point.point.coordinates[1]
      };
    }
    
    return {
      id: point.id,
      cityId: point.city || '',
      type: point.type ? 'temple' : 'other',
      name: parsedName,
      description: parsedDescription,
      media: [],
      thumbnail: '/placeholder.svg',
      location: location,
      routeIds: [],
      eventIds: []
    };
  });
};

// Function to fetch routes by city (added to fix import error)
export const fetchRoutesByCity = async (cityId: string): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching city routes:', error);
    throw error;
  }
  
  return data.map((routeData): Route => {
    // Parse JSON data
    let parsedName = {};
    try {
      parsedName = typeof routeData.name === 'string' 
        ? JSON.parse(routeData.name) 
        : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
    } catch (e) {
      parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
    }
    
    // Parse description - use info field from database
    let parsedDescription = {};
    try {
      parsedDescription = typeof routeData.info === 'string' 
        ? JSON.parse(routeData.info) 
        : (routeData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    // Parse point IDs
    let pointIds: string[] = [];
    try {
      pointIds = Array.isArray(routeData.spots) 
        ? routeData.spots 
        : (typeof routeData.spots === 'string' ? JSON.parse(routeData.spots) : []);
    } catch (e) {
      pointIds = [];
    }
    
    return {
      id: routeData.id,
      cityId: routeData.city || '',
      name: parsedName,
      description: parsedDescription,
      media: [], // This would need to be fetched separately
      thumbnail: '/placeholder.svg', // Default thumbnail
      pointIds: pointIds,
      eventIds: [],
      distance: routeData.distance || 0,
      duration: routeData.duration || 0
    };
  });
};

// Function to fetch routes by event (added to fix import error)
export const fetchRoutesByEvent = async (eventId: string): Promise<Route[]> => {
  // First get routes associated with this event from junction table
  const { data: junctionData, error: junctionError } = await supabase
    .from('route_event')
    .select('route_id')
    .eq('event_id', eventId);

  if (junctionError) {
    console.error('Error fetching event routes junction:', junctionError);
    throw junctionError;
  }

  if (!junctionData || junctionData.length === 0) {
    return [];
  }

  // Extract route IDs
  const routeIds = junctionData.map(item => item.route_id);

  // Now fetch the actual routes
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .in('id', routeIds);

  if (error) {
    console.error('Error fetching event routes:', error);
    throw error;
  }

  return data.map((routeData): Route => {
    // Parse name and other fields
    // ... Same parsing logic as above
    let parsedName = {};
    try {
      parsedName = typeof routeData.name === 'string' 
        ? JSON.parse(routeData.name) 
        : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
    } catch (e) {
      parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
    }
    
    let parsedDescription = {};
    try {
      parsedDescription = typeof routeData.info === 'string' 
        ? JSON.parse(routeData.info) 
        : (routeData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    let pointIds: string[] = [];
    try {
      pointIds = Array.isArray(routeData.spots) 
        ? routeData.spots 
        : (typeof routeData.spots === 'string' ? JSON.parse(routeData.spots) : []);
    } catch (e) {
      pointIds = [];
    }
    
    return {
      id: routeData.id,
      cityId: routeData.city || '',
      name: parsedName,
      description: parsedDescription,
      media: [],
      thumbnail: '/placeholder.svg',
      pointIds: pointIds,
      eventIds: [],
      distance: routeData.distance || 0,
      duration: routeData.duration || 0
    };
  });
};

// Function to fetch routes by point ID (added to fix import error)
export const fetchRoutesByPoint = async (pointId: string): Promise<Route[]> => {
  // First check if there's a junction table between spots and routes
  const { data: junctionData, error: junctionError } = await supabase
    .from('spot_route')
    .select('route_id')
    .eq('spot_id', pointId);

  if (junctionError) {
    console.error('Error fetching spot routes junction:', junctionError);
    
    // Fallback: try to find routes that have this spot ID in their spots array
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*');
      
    if (routesError) {
      console.error('Error fetching routes for fallback:', routesError);
      throw routesError;
    }
    
    // Filter routes that contain this point ID
    const filteredRoutes = routesData.filter(route => {
      if (!route.spots) return false;
      
      try {
        const spotIds = Array.isArray(route.spots) 
          ? route.spots 
          : (typeof route.spots === 'string' ? JSON.parse(route.spots) : []);
          
        return spotIds.includes(pointId);
      } catch (e) {
        return false;
      }
    });
    
    // Map to Route objects
    return filteredRoutes.map((routeData): Route => {
      // Parse name and other fields (same as above)
      let parsedName = {};
      try {
        parsedName = typeof routeData.name === 'string' 
          ? JSON.parse(routeData.name) 
          : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
      } catch (e) {
        parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
      }
      
      let parsedDescription = {};
      try {
        parsedDescription = typeof routeData.info === 'string' 
          ? JSON.parse(routeData.info) 
          : (routeData.info || { en: '', ru: '', hi: '' });
      } catch (e) {
        parsedDescription = { en: '', ru: '', hi: '' };
      }
      
      let pointIds: string[] = [];
      try {
        pointIds = Array.isArray(routeData.spots) 
          ? routeData.spots 
          : (typeof routeData.spots === 'string' ? JSON.parse(routeData.spots) : []);
      } catch (e) {
        pointIds = [];
      }
      
      return {
        id: routeData.id,
        cityId: routeData.city || '',
        name: parsedName,
        description: parsedDescription,
        media: [],
        thumbnail: '/placeholder.svg',
        pointIds: pointIds,
        eventIds: [],
        distance: routeData.distance || 0,
        duration: routeData.duration || 0
      };
    });
  }

  if (!junctionData || junctionData.length === 0) {
    return [];
  }

  // Extract route IDs
  const routeIds = junctionData.map(item => item.route_id);

  // Now fetch the actual routes
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .in('id', routeIds);

  if (error) {
    console.error('Error fetching point routes:', error);
    throw error;
  }

  return data.map((routeData): Route => {
    // Parse name and other fields (same as above)
    let parsedName = {};
    try {
      parsedName = typeof routeData.name === 'string' 
        ? JSON.parse(routeData.name) 
        : (routeData.name || { en: 'Unknown route', ru: 'Неизвестный маршрут', hi: 'अज्ञात मार्ग' });
    } catch (e) {
      parsedName = { en: routeData.name || 'Unknown route', ru: routeData.name || 'Неизвестный маршрут', hi: routeData.name || 'अज्ञात मार्ग' };
    }
    
    let parsedDescription = {};
    try {
      parsedDescription = typeof routeData.info === 'string' 
        ? JSON.parse(routeData.info) 
        : (routeData.info || { en: '', ru: '', hi: '' });
    } catch (e) {
      parsedDescription = { en: '', ru: '', hi: '' };
    }
    
    let pointIds: string[] = [];
    try {
      pointIds = Array.isArray(routeData.spots) 
        ? routeData.spots 
        : (typeof routeData.spots === 'string' ? JSON.parse(routeData.spots) : []);
    } catch (e) {
      pointIds = [];
    }
    
    return {
      id: routeData.id,
      cityId: routeData.city || '',
      name: parsedName,
      description: parsedDescription,
      media: [],
      thumbnail: '/placeholder.svg',
      pointIds: pointIds,
      eventIds: [],
      distance: routeData.distance || 0,
      duration: routeData.duration || 0
    };
  });
};

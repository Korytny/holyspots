
// Re-export all functionality from pointsService to maintain compatibility
import { 
  fetchPointsByCity, 
  fetchPointById,
  fetchAllPoints,
  fetchPointsByRouteId,
  fetchPointsByEventId
} from './pointsService';

// Create alias functions for backward compatibility
export const fetchAllSpots = fetchAllPoints;
export const fetchSpotById = fetchPointById;
export const fetchSpotsByCity = fetchPointsByCity;
export const fetchSpotsByRoute = fetchPointsByRouteId;
export const fetchSpotsByEvent = fetchPointsByEventId;

// Re-export everything else from pointsService
export * from './pointsService';

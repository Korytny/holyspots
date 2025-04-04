
import { fetchPointById } from '../pointsService';
import { fetchEventById } from '../eventsService';
import { Point, Event } from '../../types/models';

// Helper functions for fetching related entities
export const fetchPointsByIds = async (pointIds: string[]): Promise<Point[]> => {
  if (!pointIds.length) return [];
  
  const points = [];
  for (const id of pointIds) {
    const point = await fetchPointById(id);
    if (point) points.push(point);
  }
  
  return points;
};

export const fetchEventsByIds = async (eventIds: string[]): Promise<Event[]> => {
  if (!eventIds.length) return [];
  
  const events = [];
  for (const id of eventIds) {
    const event = await fetchEventById(id);
    if (event) events.push(event);
  }
  
  return events;
};

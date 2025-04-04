
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Point, Route } from '../types/models';

interface RouteMapProps {
  route: Route;
  points: Point[];
  height?: string;
}

const RouteMap = ({ route, points, height = '400px' }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');

  // Get valid coordinates from the points
  const getRouteCoordinates = (): [number, number][] => {
    if (!points || points.length === 0) {
      // Default to center of India if no points
      return [[78.9629, 20.5937]];
    }
    
    return points
      .filter(point => {
        // Filter out points without valid coordinates
        if (point.point?.coordinates) {
          const [lng, lat] = point.point.coordinates;
          return !isNaN(lng) && !isNaN(lat);
        }
        if (point.location) {
          return !isNaN(point.location.longitude) && !isNaN(point.location.latitude);
        }
        return false;
      })
      .map(point => {
        // First try to get from the geometry point field
        if (point.point?.coordinates) {
          return point.point.coordinates;
        }
        // Fallback to the location object
        return [point.location.longitude, point.location.latitude];
      });
  };

  // Get spot type name for display
  const getSpotTypeName = (type: string): string => {
    switch (type) {
      case 'temple': return 'Храм';
      case 'ashram': return 'Ашрам';
      case 'kund': return 'Кунда';
      default: return 'Видовое место';
    }
  };

  // Get icon element based on spot type
  const getSpotIcon = (type: string): string => {
    switch (type) {
      case 'temple': return '🏛️'; // Temple
      case 'ashram': return '🧘'; // Ashram
      case 'kund': return '💦';   // Kund
      default: return '🗻';       // Scenic place
    }
  };

  // Get background color for the marker based on type
  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'temple': return '#8B5CF6'; // Purple for temples
      case 'ashram': return '#F97316'; // Orange for ashrams
      case 'kund': return '#0EA5E9';   // Blue for kunds
      default: return '#10B981';       // Green for scenic places
    }
  };

  // Load Mapbox token from storage or use default
  useEffect(() => {
    const storedToken = localStorage.getItem('mapboxToken');
    // Use the provided token if available
    const defaultToken = 'pk.eyJ1Ijoia29yeXRueSIsImEiOiJjazM2OWk0aWgwaXNlM29wbmFxYmcybDA1In0.3bQx9mdXq9p3PTkxb8soeQ';
    
    if (storedToken) {
      setMapToken(storedToken);
    } else {
      // Save and use the default token
      localStorage.setItem('mapboxToken', defaultToken);
      setMapToken(defaultToken);
    }
  }, []);

  const handleSetToken = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = formData.get('token') as string;
    if (token) {
      localStorage.setItem('mapboxToken', token);
      setMapToken(token);
    }
  };

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapToken) return;
    
    const coordinates = getRouteCoordinates();
    console.log('Route map coordinates:', coordinates);
    
    // Don't proceed if we don't have valid coordinates
    if (coordinates.length === 0) {
      console.error('No valid coordinates found for the route');
      return;
    }
    
    mapboxgl.accessToken = mapToken;
    
    try {
      // Initialize map with first coordinate or default to India
      const initialCenter = coordinates[0] || [78.9629, 20.5937];
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: initialCenter,
        zoom: 13
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Wait for map to load before adding markers and lines
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add markers for all points in the route
        points.forEach((point, index) => {
          if (!map.current) return;
          
          // Check if point has valid coordinates
          let markerCoords: [number, number] | null = null;
          
          if (point.point?.coordinates) {
            const [lng, lat] = point.point.coordinates;
            if (!isNaN(lng) && !isNaN(lat)) {
              markerCoords = [lng, lat];
            }
          } else if (point.location) {
            const { longitude, latitude } = point.location;
            if (!isNaN(longitude) && !isNaN(latitude)) {
              markerCoords = [longitude, latitude];
            }
          }
          
          if (!markerCoords) {
            console.warn(`Point ${point.id} has invalid coordinates`);
            return;
          }
          
          const markerEl = document.createElement('div');
          markerEl.className = 'flex flex-col items-center';
          
          const icon = document.createElement('div');
          icon.className = 'w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md';
          icon.style.backgroundColor = getMarkerColor(point.type);
          
          // Add point number to identify route sequence
          const numberBadge = document.createElement('div');
          numberBadge.className = 'absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold';
          numberBadge.textContent = (index + 1).toString();
          
          // Different icon based on point type
          const iconContent = getSpotIcon(point.type);
          
          icon.innerHTML = iconContent;
          markerEl.appendChild(icon);
          markerEl.appendChild(numberBadge);
          
          // Add a label below
          const label = document.createElement('div');
          label.className = 'text-xs font-bold mt-1 px-2 py-1 bg-white/80 rounded shadow-sm';
          
          // Get the spot name based on available languages
          const spotName = point.name.en || Object.values(point.name)[0];
          label.innerText = spotName;
          markerEl.appendChild(label);
          
          // Create and add the marker
          new mapboxgl.Marker(markerEl)
            .setLngLat(markerCoords)
            .addTo(map.current);
        });

        // Draw a line connecting all the points if there are at least 2 valid points
        if (coordinates.length >= 2) {
          map.current.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
              }
            }
          });
          
          map.current.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
          
          // Fit bounds to include all coordinates with some padding
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord as mapboxgl.LngLatLike);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 }
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, [mapToken, points]);

  if (!mapToken) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg" style={{ height }}>
        <h3 className="text-lg mb-2 font-serif">Mapbox Token Required</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Please provide your Mapbox token to enable the map feature. 
          You can get one by creating an account at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="underline text-primary">mapbox.com</a>
        </p>
        <form onSubmit={handleSetToken} className="w-full max-w-md space-y-2">
          <input 
            type="text" 
            name="token"
            placeholder="Enter your Mapbox token" 
            className="w-full p-2 border rounded-md"
            required
          />
          <Button type="submit" size="sm" className="w-full">Set Token</Button>
        </form>
      </div>
    );
  }
  
  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg" style={{ height }}>
        <p className="text-muted-foreground">No points available for this route</p>
      </div>
    );
  }
  
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default RouteMap;

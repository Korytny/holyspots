
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

  // Get coordinates from the points
  const getRouteCoordinates = (): [number, number][] => {
    if (!points || points.length === 0) {
      // Default to center of India if no points
      return [[78.9629, 20.5937]];
    }
    
    return points.map(point => {
      // First try to get from the geometry point field
      if (point.point?.coordinates) {
        return point.point.coordinates;
      }
      // Fallback to the location object
      if (point.location) {
        return [point.location.longitude, point.location.latitude];
      }
      // Default to India if no coordinates available
      return [78.9629, 20.5937];
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
    if (!mapContainer.current || !mapToken || points.length === 0) return;
    
    const coordinates = getRouteCoordinates();
    console.log('Route map coordinates:', coordinates);
    
    // Calculate the bounds of all points to fit them on the map
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(coord => {
      bounds.extend(coord as [number, number]);
    });
    
    mapboxgl.accessToken = mapToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      bounds: coordinates.length > 1 ? bounds : undefined,
      center: coordinates.length === 1 ? coordinates[0] : undefined,
      zoom: coordinates.length === 1 ? 13 : undefined,
      padding: 50 // Add padding around the bounds
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for all points in the route
    points.forEach((point, index) => {
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

      // Get coordinates for the marker
      const markerCoords = point.point?.coordinates || 
        [point.location.longitude, point.location.latitude];
      
      // Create and add the marker
      new mapboxgl.Marker(markerEl)
        .setLngLat(markerCoords as [number, number])
        .addTo(map.current);
    });

    // Draw a line connecting all the points if there are at least 2 points
    if (coordinates.length >= 2 && map.current) {
      map.current.on('load', () => {
        map.current?.addSource('route', {
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
        
        map.current?.addLayer({
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
      });
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

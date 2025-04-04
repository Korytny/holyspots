
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Point } from '../types/models';

interface SpotMapProps {
  spot: Point;
  height?: string;
}

const SpotMap = ({ spot, height = '300px' }: SpotMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');

  // Get coordinates from the spot
  const getCoordinates = (): [number, number] => {
    // First try to get from the geometry point field
    if (spot.point?.coordinates) {
      return spot.point.coordinates;
    }
    // Fallback to the location object
    if (spot.location) {
      return [spot.location.longitude, spot.location.latitude];
    }
    // Default to India if no coordinates available
    return [78.9629, 20.5937];
  };

  // Ask user for mapbox token if not available
  useEffect(() => {
    const storedToken = localStorage.getItem('mapboxToken');
    if (storedToken) {
      setMapToken(storedToken);
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

    const coordinates = getCoordinates();
    
    mapboxgl.accessToken = mapToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: coordinates,
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Create and add marker for the spot
    const markerEl = document.createElement('div');
    markerEl.className = 'flex flex-col items-center';
    
    const icon = document.createElement('div');
    icon.className = 'w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md';
    
    // Different icon based on point type
    let iconContent = '🏛️'; // Default temple
    if (spot.type === 'ashram') iconContent = '🧘';
    else if (spot.type === 'kund') iconContent = '💦';
    
    icon.innerHTML = iconContent;
    markerEl.appendChild(icon);
    
    // Add a label below
    const label = document.createElement('div');
    label.className = 'text-xs font-bold mt-1 px-2 py-1 bg-white/80 rounded shadow-sm';
    
    // Get the spot name based on available languages
    const spotName = spot.name.en || Object.values(spot.name)[0];
    label.innerText = spotName;
    markerEl.appendChild(label);
    
    // Create and add the marker
    new mapboxgl.Marker(markerEl)
      .setLngLat(coordinates)
      .addTo(map.current);

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, [mapToken, spot]);

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
  
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default SpotMap;


import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Point } from '../types/models';

interface MapProps {
  points?: Point[];
  center?: [number, number];
  zoom?: number;
  onPointSelect?: (pointId: string) => void;
}

const Map = ({ points = [], center = [78.9629, 20.5937], zoom = 4, onPointSelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');

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

    mapboxgl.accessToken = mapToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, [mapToken, center, zoom]);

  // Add markers for points
  useEffect(() => {
    if (!map.current || points.length === 0) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each point
    points.forEach(point => {
      if (!map.current) return;
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'flex flex-col items-center';
      
      const icon = document.createElement('div');
      icon.className = 'w-6 h-6 rounded-full bg-burgundy text-white flex items-center justify-center shadow-md';
      
      // Different icon based on point type
      let iconContent = '🏛️'; // Default temple
      if (point.type === 'ashram') iconContent = '🧘';
      else if (point.type === 'kund') iconContent = '💦';
      
      icon.innerHTML = iconContent;
      markerEl.appendChild(icon);
      
      // Add a label below
      const label = document.createElement('div');
      label.className = 'text-xs font-bold mt-1 px-1 py-0.5 bg-white/80 rounded shadow-sm';
      label.innerText = point.name.en; // Use English name for simplicity
      markerEl.appendChild(label);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([point.location.longitude, point.location.latitude])
        .addTo(map.current);
        
      // Add click handler if onPointSelect is provided
      if (onPointSelect) {
        markerEl.addEventListener('click', () => {
          onPointSelect(point.id);
        });
      }
    });
  }, [points, onPointSelect, mapToken]);

  if (!mapToken) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
        <h3 className="text-xl mb-4 font-serif">Mapbox Token Required</h3>
        <p className="mb-6 text-muted-foreground">
          Please provide your Mapbox token to enable the map feature. 
          You can get one by creating an account at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="underline text-primary">mapbox.com</a>
        </p>
        <form onSubmit={handleSetToken} className="w-full max-w-md space-y-4">
          <input 
            type="text" 
            name="token"
            placeholder="Enter your Mapbox token" 
            className="w-full p-2 border rounded-md"
            required
          />
          <Button type="submit" className="w-full">Set Token</Button>
        </form>
      </div>
    );
  }
  
  return (
    <div className="w-full h-[70vh] rounded-lg overflow-hidden shadow-lg relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default Map;

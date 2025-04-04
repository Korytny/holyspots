
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

  // Get valid coordinates from the spot
  const getCoordinates = (): [number, number] | null => {
    // First try to get from the geometry point field
    if (spot.point?.coordinates) {
      const [lng, lat] = spot.point.coordinates;
      if (!isNaN(lng) && !isNaN(lat)) {
        return spot.point.coordinates;
      }
    }
    // Fallback to the location object
    if (spot.location) {
      const { longitude, latitude } = spot.location;
      if (!isNaN(longitude) && !isNaN(latitude)) {
        return [longitude, latitude];
      }
    }
    // Default to India if no valid coordinates available
    return [78.9629, 20.5937];
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

    const coordinates = getCoordinates();
    console.log('Map coordinates:', coordinates);
    
    // Don't proceed if we don't have valid coordinates
    if (!coordinates) {
      console.error('No valid coordinates found for the spot');
      return;
    }
    
    mapboxgl.accessToken = mapToken;
    
    try {
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
      map.current.on('load', () => {
        if (!map.current) return;
        
        const markerEl = document.createElement('div');
        markerEl.className = 'flex flex-col items-center';
        
        const icon = document.createElement('div');
        icon.className = 'w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md';
        icon.style.backgroundColor = getMarkerColor(spot.type);
        
        // Different icon based on point type
        const iconContent = getSpotIcon(spot.type);
        
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
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

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

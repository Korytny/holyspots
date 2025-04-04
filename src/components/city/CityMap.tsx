import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Point } from '../../types/models';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChurchIcon, PersonStanding, MapPin, Navigation } from 'lucide-react';

interface CityMapProps {
  points: Point[];
  cityLocation?: { latitude: number; longitude: number };
  height?: string;
  onPointSelect?: (pointId: string) => void;
}

const CityMap = ({ 
  points, 
  cityLocation, 
  height = '500px', 
  onPointSelect 
}: CityMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('mapboxToken');
    const defaultToken = 'pk.eyJ1Ijoia29yeXRueSIsImEiOiJjazM2OWk0aWgwaXNlM29wbmFxYmcybDA1In0.3bQx9mdXq9p3PTkxb8soeQ';
    
    if (storedToken) {
      setMapToken(storedToken);
    } else {
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

  const getMapCenter = (): [number, number] => {
    if (cityLocation) {
      return [cityLocation.longitude, cityLocation.latitude];
    }

    if (points.length > 0) {
      let totalLng = 0;
      let totalLat = 0;
      let validPoints = 0;

      points.forEach(point => {
        if (point.point?.coordinates) {
          totalLng += point.point.coordinates[0];
          totalLat += point.point.coordinates[1];
          validPoints++;
        } else if (point.location) {
          totalLng += point.location.longitude;
          totalLat += point.location.latitude;
          validPoints++;
        }
      });

      if (validPoints > 0) {
        return [totalLng / validPoints, totalLat / validPoints];
      }
    }

    return [78.9629, 20.5937];
  };

  const getSpotTypeName = (type: string): string => {
    switch (type) {
      case 'temple': return 'Храм';
      case 'ashram': return 'Ашрам';
      case 'kund': return 'Кунда';
      default: return 'Видовое место';
    }
  };

  const getSpotIcon = (type: string): string => {
    switch (type) {
      case 'temple': return '🏛️';
      case 'ashram': return '🧘';
      case 'kund': return '💦';
      default: return '🗻';
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'temple': return '#8B5CF6';
      case 'ashram': return '#F97316';
      case 'kund': return '#0EA5E9';
      default: return '#10B981';
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapToken || points.length === 0) return;

    const center = getMapCenter();
    console.log('City map center:', center);
    
    mapboxgl.accessToken = mapToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 11
    });

    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    points.forEach(point => {
      let coordinates: [number, number];
      
      if (point.point?.coordinates) {
        coordinates = point.point.coordinates;
      } else {
        coordinates = [point.location.longitude, point.location.latitude];
      }
      
      const markerEl = document.createElement('div');
      markerEl.className = 'flex flex-col items-center';
      markerEl.style.cursor = 'pointer';
      
      const icon = document.createElement('div');
      icon.className = 'w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md';
      icon.style.backgroundColor = getMarkerColor(point.type);
      
      const iconContent = getSpotIcon(point.type);
      
      icon.innerHTML = iconContent;
      markerEl.appendChild(icon);
      
      const label = document.createElement('div');
      label.className = 'text-xs font-bold mt-1 px-2 py-1 bg-white/80 rounded shadow-sm';
      
      const spotName = point.name.en || Object.values(point.name)[0];
      label.innerText = spotName;
      markerEl.appendChild(label);
      
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coordinates)
        .addTo(map.current);
      
      markerEl.addEventListener('click', () => {
        navigate(`/points/${point.id}`);
      });
    });

    if (points.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      
      points.forEach(point => {
        if (point.point?.coordinates) {
          bounds.extend(point.point.coordinates);
        } else if (point.location) {
          bounds.extend([point.location.longitude, point.location.latitude]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapToken, points, cityLocation, navigate]);

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

export default CityMap;

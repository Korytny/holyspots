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
    if (cityLocation && !isNaN(cityLocation.longitude) && !isNaN(cityLocation.latitude)) {
      return [cityLocation.longitude, cityLocation.latitude];
    }

    if (points.length > 0) {
      let totalLng = 0;
      let totalLat = 0;
      let validPoints = 0;

      points.forEach(point => {
        if (point.point?.coordinates) {
          const [lng, lat] = point.point.coordinates;
          if (!isNaN(lng) && !isNaN(lat)) {
            totalLng += lng;
            totalLat += lat;
            validPoints++;
          }
        } else if (point.location) {
          const { longitude, latitude } = point.location;
          if (!isNaN(longitude) && !isNaN(latitude)) {
            totalLng += longitude;
            totalLat += latitude;
            validPoints++;
          }
        }
      });

      if (validPoints > 0) {
        return [totalLng / validPoints, totalLat / validPoints];
      }
    }

    return [78.9629, 20.5937]; // Default to India
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
    
    try {
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

      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add markers for points with valid coordinates
        points.forEach(point => {
          if (!map.current) return;
          
          // Get coordinates from point (either from point geometry or location)
          let coordinates: [number, number] | null = null;
          
          if (point.point?.coordinates) {
            const [lng, lat] = point.point.coordinates;
            if (!isNaN(lng) && !isNaN(lat)) {
              coordinates = [lng, lat];
            }
          } else if (point.location) {
            const { longitude, latitude } = point.location;
            if (!isNaN(longitude) && !isNaN(latitude)) {
              coordinates = [longitude, latitude];
            }
          }
          
          if (!coordinates) {
            console.warn(`Point ${point.id} has invalid coordinates`);
            return;
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
          
          // Create and add the marker
          new mapboxgl.Marker(markerEl)
            .setLngLat(coordinates)
            .addTo(map.current);
          
          markerEl.addEventListener('click', () => {
            handleMarkerClick(point.id);
          });
        });

        // If we have multiple points, fit the map to show all of them
        if (points.length > 1) {
          // Collect all valid coordinates
          const validCoordinates = points
            .map(point => {
              if (point.point?.coordinates) {
                const [lng, lat] = point.point.coordinates;
                return !isNaN(lng) && !isNaN(lat) ? point.point.coordinates as mapboxgl.LngLatLike : null;
              } 
              if (point.location) {
                const { longitude, latitude } = point.location;
                return !isNaN(longitude) && !isNaN(latitude) ? [longitude, latitude] as mapboxgl.LngLatLike : null;
              }
              return null;
            })
            .filter(coord => coord !== null) as mapboxgl.LngLatLike[];
          
          if (validCoordinates.length > 1) {
            // Create bounds from the first coordinate
            const bounds = new mapboxgl.LngLatBounds(
              validCoordinates[0],
              validCoordinates[0]
            );
            
            // Extend the bounds with the rest of the coordinates
            validCoordinates.slice(1).forEach(coord => {
              bounds.extend(coord);
            });
            
            // Fit the map to the bounds
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              maxZoom: 15
            });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapToken, points, cityLocation, navigate]);

  const handleMarkerClick = (pointId: string) => {
    if (onPointSelect) {
      onPointSelect(pointId);
    } else {
      navigate(`/points/${pointId}`);
    }
  };

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

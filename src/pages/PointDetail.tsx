import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import SpotMap from '../components/SpotMap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Navigation as NavigationIcon, 
  Calendar,
  MapPin,
  Home
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSpotById } from '../services/spotsService';
import { fetchRoutesBySpot } from '../services/routesService';
import { fetchEventsBySpot } from '../services/eventsService';
import { MediaItem } from '../types/models';
import CityRoutes from '../components/city/CityRoutes';
import CityEvents from '../components/city/CityEvents';
import FavoriteDetailButton from '../components/FavoriteDetailButton';

const PointDetail = () => {
  const { pointId } = useParams<{ pointId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('routes');

  const { 
    data: spot,
    isLoading: isLoadingSpot,
    error: spotError
  } = useQuery({
    queryKey: ['spot', pointId],
    queryFn: () => fetchSpotById(pointId as string),
    enabled: !!pointId,
  });

  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ['spot-routes', pointId],
    queryFn: () => fetchRoutesBySpot(pointId as string),
    enabled: !!pointId,
  });
  
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['spot-events', pointId],
    queryFn: () => fetchEventsBySpot(pointId as string),
    enabled: !!pointId,
  });

  if (isLoadingSpot) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }

  if (!spot || spotError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">
              {spotError ? 'Error loading spot data' : 'Spot not found'}
            </h2>
            {spotError && <p className="mt-2 text-red-500">{(spotError as Error).message}</p>}
          </div>
        </div>
      </div>
    );
  }

  const getSpotName = () => {
    if (!spot || !spot.name) return 'Unknown Spot';
    
    if (typeof spot.name === 'object') {
      return spot.name[language] || spot.name.en || 'Unknown Spot';
    }
    
    return typeof spot.name === 'string' ? spot.name : 'Unknown Spot';
  };
  
  const getSpotDescription = () => {
    if (!spot || !spot.description) return '';
    
    if (typeof spot.description === 'object') {
      return spot.description[language] || spot.description.en || '';
    }
    
    return typeof spot.description === 'string' ? spot.description : '';
  };
  
  const spotName = getSpotName();
  const spotDescription = getSpotDescription();

  const getCoordinatesDisplay = () => {
    if (spot.point?.coordinates) {
      const [longitude, latitude] = spot.point.coordinates;
      return `${t('longitude')}: ${longitude.toFixed(6)}, ${t('latitude')}: ${latitude.toFixed(6)}`;
    }
    if (spot.location) {
      return `${t('latitude')}: ${spot.location.latitude.toFixed(6)}, ${t('longitude')}: ${spot.location.longitude.toFixed(6)}`;
    }
    return 'Coordinates not available';
  };

  const createMediaItems = (): MediaItem[] => {
    const mediaItems: MediaItem[] = [];
    
    if (spot && Array.isArray(spot.media) && spot.media.length > 0) {
      spot.media.forEach((item, index) => {
        if (typeof item === 'object' && item.type && item.url) {
          mediaItems.push(item as MediaItem);
        }
      });
    }
    
    if (mediaItems.length === 0 && spot && spot.images && Array.isArray(spot.images)) {
      spot.images.forEach((url, index) => {
        if (typeof url === 'string') {
          mediaItems.push({
            id: `image-${index}`,
            type: 'image',
            url,
            thumbnailUrl: url,
          });
        }
      });
    }
    
    return mediaItems;
  };
  
  const mediaItems = createMediaItems();

  const handleRouteClick = (routeId: string) => {
    window.location.href = `/routes/${routeId}`;
  };
  
  const handleEventClick = (eventId: string) => {
    window.location.href = `/events/${eventId}`;
  };

  const getSpotTypeLabel = (type: string) => {
    switch (type) {
      case 'temple': return 'Temple';
      case 'ashram': return 'Ashram';
      case 'kund': return 'Kund';
      default: return 'Other';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-secondary/20 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-grow">
                <h1 className="text-3xl font-bold">{spotName}</h1>
                <div className="mt-3">
                  <div className="flex items-center text-sm mb-2">
                    <span className="font-medium mr-2">{t('type')}:</span>
                    <span className="inline-flex items-center px-3 py-1 bg-secondary rounded-full">
                      {spot?.type && getSpotTypeLabel(spot.type)}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{spotDescription}</p>
              </div>
              
              <div className="md:ml-4 bg-white p-4 rounded-lg shadow-sm min-w-[220px] flex flex-col gap-2">
                {spot.cityId && (
                  <div className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{spot.cityId}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span><span className="font-medium">{getCoordinatesDisplay()}</span></span>
                </div>
                
                <div className="flex items-center text-sm">
                  <NavigationIcon className="h-4 w-4 mr-2 text-primary" />
                  <span><span className="font-medium">{routes.length || 0}</span> {t('routes')}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span><span className="font-medium">{events.length || 0}</span> {t('events')}</span>
                </div>
                
                <div className="mt-2">
                  <FavoriteDetailButton
                    itemId={spot.id}
                    itemType="point"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
            
          <div className="p-6">
            <MediaGallery media={mediaItems} />
            
            {/* Map component */}
            <div className="mt-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('location')}</h3>
              <SpotMap spot={spot} height="400px" />
            </div>
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="routes" className="flex items-center">
                    <NavigationIcon className="mr-1 h-4 w-4" />
                    {t('routes')}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('events')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="routes" className="pt-4">
                  <CityRoutes 
                    routes={routes}
                    isLoading={activeTab === 'routes' && isLoadingRoutes}
                    error={routesError as Error | null}
                    onRouteClick={handleRouteClick}
                  />
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  <CityEvents
                    events={events}
                    isLoading={activeTab === 'events' && isLoadingEvents}
                    error={eventsError as Error | null}
                    onEventClick={handleEventClick}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PointDetail;

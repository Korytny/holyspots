
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Navigation as NavigationIcon, 
  Calendar,
  MapPin,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSpotById } from '../services/spotsService';
import { fetchRoutesBySpot } from '../services/routesService';
import { fetchEventsBySpot } from '../services/eventsService';
import { MediaItem } from '../types/models';
import CityRoutes from '../components/city/CityRoutes';
import CityEvents from '../components/city/CityEvents';

const PointDetail = () => {
  const { pointId } = useParams<{ pointId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

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
    enabled: !!pointId && activeTab === 'routes',
  });
  
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['spot-events', pointId],
    queryFn: () => fetchEventsBySpot(pointId as string),
    enabled: !!pointId && activeTab === 'events',
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

  const mediaItems: MediaItem[] = spot?.media || [];
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const renderSpotStats = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <NavigationIcon className="h-4 w-4 mr-1" />
          {routes.length || 0}
        </div>
        
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <Calendar className="h-4 w-4 mr-1" />
          {events.length || 0}
        </div>
      </div>
    );
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
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <h1 className="text-3xl font-bold">{spotName}</h1>
                </div>
                {renderSpotStats()}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{spotDescription}</p>
            
            <MediaGallery media={mediaItems} />
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="info" className="flex items-center">
                    <Info className="mr-1 h-4 w-4" />
                    {t('info')}
                  </TabsTrigger>
                  <TabsTrigger value="routes" className="flex items-center">
                    <NavigationIcon className="mr-1 h-4 w-4" />
                    {t('routes')}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('events')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="pt-4">
                  <div className="prose max-w-none">
                    {spotDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                    {spot.type && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">{t('type')}:</h3>
                        <div className="inline-flex items-center px-3 py-1 bg-secondary rounded-full">
                          {spot.type}
                        </div>
                      </div>
                    )}
                    {spot.location && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">{t('location')}:</h3>
                        <div className="text-sm">
                          {t('latitude')}: {spot.location.latitude.toFixed(6)}, {t('longitude')}: {spot.location.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
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

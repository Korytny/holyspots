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
import { fetchRouteById } from '../services/routesService';
import { fetchSpotsByIds } from '../services/spotsService';
import { fetchEventsByRoute } from '../services/eventsService';
import { MediaItem } from '../types/models';
import CitySpots from '../components/city/CitySpots';
import CityEvents from '../components/city/CityEvents';

const RouteDetail = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const { 
    data: route,
    isLoading: isLoadingRoute,
    error: routeError
  } = useQuery({
    queryKey: ['route', routeId],
    queryFn: () => fetchRouteById(routeId as string),
    enabled: !!routeId,
  });

  const {
    data: spots = [],
    isLoading: isLoadingSpots,
    error: spotsError
  } = useQuery({
    queryKey: ['route-spots', routeId, route?.pointIds],
    queryFn: () => fetchSpotsByIds(route?.pointIds || []),
    enabled: !!route?.pointIds && route.pointIds.length > 0 && activeTab === 'spots',
  });
  
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['route-events', routeId],
    queryFn: () => fetchEventsByRoute(routeId as string),
    enabled: !!routeId && activeTab === 'events',
  });

  if (isLoadingRoute) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }

  if (!route || routeError) {
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
              {routeError ? 'Error loading route data' : 'Route not found'}
            </h2>
            {routeError && <p className="mt-2 text-red-500">{(routeError as Error).message}</p>}
          </div>
        </div>
      </div>
    );
  }

  const getRouteName = () => {
    if (!route || !route.name) return 'Unknown Route';
    
    if (typeof route.name === 'object') {
      return route.name[language] || route.name.en || 'Unknown Route';
    }
    
    return typeof route.name === 'string' ? route.name : 'Unknown Route';
  };
  
  const getRouteDescription = () => {
    if (!route || !route.description) return '';
    
    if (typeof route.description === 'object') {
      return route.description[language] || route.description.en || '';
    }
    
    return typeof route.description === 'string' ? route.description : '';
  };
  
  const routeName = getRouteName();
  const routeDescription = getRouteDescription();

  const mediaItems: MediaItem[] = route?.media || [];
  
  const handleSpotClick = (spotId: string) => {
    navigate(`/points/${spotId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const renderRouteStats = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <MapPin className="h-4 w-4 mr-1" />
          {route.pointIds?.length || 0}
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
                  <NavigationIcon className="h-5 w-5 mr-2 text-primary" />
                  <h1 className="text-3xl font-bold">{routeName}</h1>
                </div>
                {renderRouteStats()}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{routeDescription}</p>
            
            <MediaGallery media={mediaItems} />
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="info" className="flex items-center">
                    <Info className="mr-1 h-4 w-4" />
                    {t('info')}
                  </TabsTrigger>
                  <TabsTrigger value="spots" className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {t('spots')}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('events')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="pt-4">
                  <div className="prose max-w-none">
                    {routeDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                    {route.distance && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">{t('distance')}:</h3>
                        <div className="inline-flex items-center px-3 py-1 bg-secondary rounded-full">
                          {route.distance} km
                        </div>
                      </div>
                    )}
                    {route.duration && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">{t('duration')}:</h3>
                        <div className="inline-flex items-center px-3 py-1 bg-secondary rounded-full">
                          {route.duration} {t('minutes')}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="spots" className="pt-4">
                  <CitySpots 
                    spots={spots}
                    isLoading={activeTab === 'spots' && isLoadingSpots}
                    error={spotsError as Error | null}
                    selectedSpot={null}
                    onSpotClick={handleSpotClick}
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

export default RouteDetail;

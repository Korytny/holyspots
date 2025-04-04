import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft,
  Navigation as NavigationIcon, 
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEventById } from '../services/eventsService';
import { fetchSpotsByIds } from '../services/spotsService';
import { fetchRoutesByEvent } from '../services/routesService';
import { MediaItem } from '../types/models';

// Now continue with the EventDetail page
const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const { 
    data: event,
    isLoading: isLoadingEvent,
    error: eventError
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId as string),
    enabled: !!eventId,
  });

  const {
    data: spots = [],
    isLoading: isLoadingSpots,
  } = useQuery({
    queryKey: ['event-spots', eventId, event?.pointIds],
    queryFn: () => fetchSpotsByIds(event?.pointIds || []),
    enabled: !!event?.pointIds && event.pointIds.length > 0,
  });
  
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
  } = useQuery({
    queryKey: ['event-routes', eventId],
    queryFn: () => fetchRoutesByEvent(eventId as string),
    enabled: !!eventId,
  });

  if (isLoadingEvent || isLoadingSpots || isLoadingRoutes) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }

  if (!event || eventError) {
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
              {eventError ? 'Error loading event data' : 'Event not found'}
            </h2>
            {eventError && <p className="mt-2 text-red-500">{(eventError as Error).message}</p>}
          </div>
        </div>
      </div>
    );
  }

  const getEventName = () => {
    if (!event || !event.name) return 'Unknown Event';
    
    if (typeof event.name === 'object') {
      return event.name[language] || event.name.en || 'Unknown Event';
    }
    
    return typeof event.name === 'string' ? event.name : 'Unknown Event';
  };
  
  const getEventDescription = () => {
    if (!event || !event.description) return '';
    
    if (typeof event.description === 'object') {
      return event.description[language] || event.description.en || '';
    }
    
    return typeof event.description === 'string' ? event.description : '';
  };
  
  const eventName = getEventName();
  const eventDescription = getEventDescription();
  const formattedDate = event.startDate 
    ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') 
    : '';

  const mediaItems: MediaItem[] = event?.media || [];
  
  const handleSpotClick = (spotId: string) => {
    navigate(`/points/${spotId}`);
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
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
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <h1 className="text-3xl font-bold">{eventName}</h1>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {formattedDate && (
                    <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
                      <Clock className="h-4 w-4 mr-1" />
                      {formattedDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{eventDescription}</p>
            
            <MediaGallery media={mediaItems} />
            
            <div className="mt-6">
              <div className="prose max-w-none">
                {eventDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {spots.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {t('relatedSpots')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spots.map(spot => (
                      <Card 
                        key={spot.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSpotClick(spot.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div 
                              className="w-12 h-12 rounded-md bg-cover bg-center mr-4" 
                              style={{backgroundImage: `url(${spot.thumbnail || '/placeholder.svg'})`}}
                            />
                            <div>
                              <h3 className="font-medium">
                                {spot.name?.[language] || spot.name?.en || 'Unnamed Spot'}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {spot.description?.[language] || spot.description?.en || ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {routes.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <NavigationIcon className="mr-2 h-4 w-4" />
                    {t('relatedRoutes')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {routes.map(route => (
                      <Card 
                        key={route.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleRouteClick(route.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div 
                              className="w-12 h-12 rounded-md bg-cover bg-center mr-4" 
                              style={{backgroundImage: `url(${route.thumbnail || '/placeholder.svg'})`}}
                            />
                            <div>
                              <h3 className="font-medium">
                                {route.name?.[language] || route.name?.en || 'Unnamed Route'}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {route.description?.[language] || route.description?.en || ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;

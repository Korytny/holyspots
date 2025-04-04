import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemCard from '../components/ItemCard';
import { 
  ArrowLeft,
  Navigation as NavigationIcon, 
  Calendar,
  MapPin,
  Info,
  Clock,
  Home
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEventById, fetchAllEvents } from '../services/eventsService';
import { fetchSpotsByEvent } from '../services/spotsService';
import { fetchRoutesByEvent } from '../services/routesService';
import { MediaItem } from '../types/models';
import DailyEvents from '../components/events/DailyEvents';
import EventCalendar from '../components/events/EventCalendar';
import FavoriteDetailButton from '../components/FavoriteDetailButton';

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

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
    error: spotsError
  } = useQuery({
    queryKey: ['event-spots', eventId],
    queryFn: () => fetchSpotsByEvent(eventId as string),
    enabled: !!eventId,
  });
  
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ['event-routes', eventId],
    queryFn: () => fetchRoutesByEvent(eventId as string),
    enabled: !!eventId,
  });

  const {
    data: allEvents = [],
    isLoading: isLoadingAllEvents,
    error: allEventsError
  } = useQuery({
    queryKey: ['all-events'],
    queryFn: () => fetchAllEvents(),
    enabled: activeTab === 'events',
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

  const mediaItems: MediaItem[] = event.media || [];
  if (event.thumbnail && mediaItems.length === 0) {
    mediaItems.push({
      id: 'main-image',
      type: 'image',
      url: event.thumbnail,
      title: eventName
    });
  }
  
  const handleSpotClick = (spotId: string) => {
    navigate(`/points/${spotId}`);
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (evtId: string) => {
    navigate(`/events/${evtId}`);
  };

  const renderEventStats = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <MapPin className="h-4 w-4 mr-1" />
          {spots.length || 0}
        </div>
        
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <NavigationIcon className="h-4 w-4 mr-1" />
          {routes.length || 0}
        </div>
        
        {formattedDate && (
          <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
            <Clock className="h-4 w-4 mr-1" />
            {formattedDate}
          </div>
        )}
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
          <div className="bg-secondary/20 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-grow">
                <h1 className="text-3xl font-bold">{eventName}</h1>
                <p className="text-muted-foreground mt-3">{eventDescription}</p>
              </div>
              
              <div className="md:ml-4 bg-white p-4 rounded-lg shadow-sm min-w-[220px] flex flex-col gap-2">
                {event.cityId && (
                  <div className="flex items-center text-sm">
                    <Home className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{event.cityId}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span><span className="font-medium">{spots.length || 0}</span> {t('spots')}</span>
                </div>
                
                {formattedDate && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>{formattedDate}</span>
                  </div>
                )}
                
                <div className="mt-2">
                  <FavoriteDetailButton
                    itemId={event.id}
                    itemType="event"
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <MediaGallery media={mediaItems} />
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="info" className="flex items-center">
                    <Info className="mr-1 h-4 w-4" />
                    {t('info')}
                  </TabsTrigger>
                  <TabsTrigger value="related" className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {t('related')}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('events')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="pt-4">
                  <div className="prose max-w-none">
                    {eventDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="related" className="pt-4">
                  {spots.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {t('relatedSpots')}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spots.map(spot => (
                          <ItemCard 
                            key={spot.id}
                            id={spot.id}
                            type="point"
                            name={spot.name}
                            description={spot.description}
                            thumbnail={spot.thumbnail || '/placeholder.svg'}
                            onClick={() => handleSpotClick(spot.id)}
                            location={spot.cityId}
                            spotType={spot.type}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {routes.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <NavigationIcon className="mr-2 h-4 w-4" />
                        {t('relatedRoutes')}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {routes.map(route => (
                          <ItemCard 
                            key={route.id}
                            id={route.id}
                            type="route"
                            name={route.name}
                            description={route.description}
                            thumbnail={route.thumbnail || '/placeholder.svg'}
                            onClick={() => handleRouteClick(route.id)}
                            pointCount={route.pointIds?.length || 0}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {spots.length === 0 && routes.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      {t('noRelatedItems')}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  <div className="space-y-8">
                    <DailyEvents 
                      events={allEvents}
                      isLoading={isLoadingAllEvents}
                      error={allEventsError as Error | null}
                      onEventClick={handleEventClick}
                    />
                    
                    <EventCalendar 
                      events={allEvents}
                      isLoading={isLoadingAllEvents}
                      error={allEventsError as Error | null}
                      onEventClick={handleEventClick}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;

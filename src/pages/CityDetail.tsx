import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import ItemCard from '../components/ItemCard';
import Map from '../components/Map';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation as NavigationIcon, 
  Calendar,
  ArrowLeft,
  Eye,
  Info,
  ChevronLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCityById } from '../services/citiesService';
import { fetchSpotsByCity } from '../services/spotsService';
import { fetchRoutesByCity, fetchRoutesBySpot } from '../services/routesService';
import { fetchEventsByCity, fetchEventsBySpot } from '../services/eventsService';
import { MediaItem, Point } from '../types/models';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('info');
  const [showMap, setShowMap] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [spotRoutes, setSpotRoutes] = useState<any[]>([]);
  const [spotEvents, setSpotEvents] = useState<any[]>([]);
  
  const { 
    data: city,
    isLoading: isLoadingCity,
    error: cityError
  } = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => fetchCityById(cityId as string),
    enabled: !!cityId,
  });
  
  const shouldFetchSpots = activeTab === 'spots' || showMap;
  const shouldFetchRoutes = activeTab === 'routes';
  const shouldFetchEvents = activeTab === 'events';
  
  const {
    data: spots = [],
    isLoading: isLoadingSpots,
    error: spotsError
  } = useQuery({
    queryKey: ['spots', cityId],
    queryFn: () => fetchSpotsByCity(cityId as string),
    enabled: !!cityId && shouldFetchSpots,
  });
  
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ['routes', cityId],
    queryFn: () => fetchRoutesByCity(cityId as string),
    enabled: !!cityId && shouldFetchRoutes,
  });
  
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['events', cityId],
    queryFn: () => fetchEventsByCity(cityId as string),
    enabled: !!cityId && shouldFetchEvents,
  });
  
  useEffect(() => {
    const fetchSpotRelatedData = async () => {
      if (selectedSpot) {
        try {
          const spotRoutesData = await fetchRoutesBySpot(selectedSpot);
          setSpotRoutes(spotRoutesData);
          
          const spotEventsData = await fetchEventsBySpot(selectedSpot);
          setSpotEvents(spotEventsData);
        } catch (error) {
          console.error("Error fetching spot related data:", error);
        }
      } else {
        setSpotRoutes([]);
        setSpotEvents([]);
      }
    };
    
    fetchSpotRelatedData();
  }, [selectedSpot]);
  
  const isLoading = isLoadingCity || 
    (shouldFetchSpots && isLoadingSpots) || 
    (shouldFetchRoutes && isLoadingRoutes) || 
    (shouldFetchEvents && isLoadingEvents);
  
  if (isLoadingCity) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!city || cityError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/cities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cities')}
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">
              {cityError ? 'Error loading city data' : 'City not found'}
            </h2>
            {cityError && <p className="mt-2 text-red-500">{(cityError as Error).message}</p>}
          </div>
        </div>
      </div>
    );
  }
  
  const getCityName = () => {
    if (!city || !city.name) return 'Unknown City';
    
    if (typeof city.name === 'object') {
      return city.name[language] || city.name.en || 'Unknown City';
    }
    
    return typeof city.name === 'string' ? city.name : 'Unknown City';
  };
  
  const getCityDescription = () => {
    if (!city) return '';
    
    if (city.description && typeof city.description === 'object') {
      return city.description[language] || city.description.en || '';
    }
    
    if (!city.description && city.info && typeof city.info === 'object') {
      return city.info[language] || city.info.en || '';
    }
    
    return '';
  };
  
  const getCityInfo = () => {
    if (!city || !city.info) return '';
    
    if (typeof city.info === 'object') {
      return city.info[language] || city.info.en || '';
    }
    
    return typeof city.info === 'string' ? city.info : '';
  };
  
  const cityName = getCityName();
  const cityDescription = getCityDescription();
  const cityInfo = getCityInfo();
  
  const mediaItems: MediaItem[] = Array.isArray(city?.images) ? city.images.map((url: string, index: number) => {
    const isVideo = typeof url === 'string' && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov'));
    return {
      id: `media-${index}`,
      type: isVideo ? 'video' as const : 'image' as const,
      url: url,
      thumbnailUrl: isVideo ? undefined : url,
    };
  }) : (city?.media || []);

  const handleSpotClick = (spotId: string) => {
    if (selectedSpot === spotId) {
      navigate(`/points/${spotId}`);
      return;
    }
    
    setSelectedSpot(spotId);
    
    if (activeTab !== 'spots') {
      setActiveTab('spots');
    }
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const toggleMapView = () => {
    setShowMap(!showMap);
  };
  
  const clearSelectedSpot = () => {
    setSelectedSpot(null);
  };
  
  const selectedSpotObject = selectedSpot ? spots.find(spot => spot.id === selectedSpot) : null;

  const renderCityStats = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <MapPin className="h-4 w-4 mr-1" />
          {city.spots_count || spots.length || 0}
        </div>
        
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <NavigationIcon className="h-4 w-4 mr-1" />
          {city.routes_count || routes.length || 0}
        </div>
        
        <div className="inline-flex items-center px-2 py-1 text-sm bg-secondary rounded-full">
          <Calendar className="h-4 w-4 mr-1" />
          {city.events_count || events.length || 0}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/cities')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('cities')}
        </Button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{cityName}</h1>
                {renderCityStats()}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">{cityDescription}</p>
            
            <MediaGallery media={mediaItems} />
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={toggleMapView}>
                {showMap ? t('hideMap') : t('viewOnMap')}
                <Eye className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {showMap && spots.length > 0 && (
              <div className="mt-4">
                <Map 
                  points={spots} 
                  center={city.location ? [city.location.longitude, city.location.latitude] : [0, 0]} 
                  zoom={12} 
                  onPointSelect={handleSpotClick} 
                />
              </div>
            )}
            
            <div className="mt-6">
              {selectedSpot && (
                <div className="mb-6 bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      {selectedSpotObject?.name?.[language] || selectedSpotObject?.name?.en || 'Selected Spot'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={clearSelectedSpot}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      {t('back')}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedSpotObject?.description?.[language] || selectedSpotObject?.description?.en || 'No description available'}
                  </p>
                  
                  {spotRoutes.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <NavigationIcon className="mr-2 h-4 w-4" />
                        {t('relatedRoutes')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {spotRoutes.map(route => (
                          <ItemCard
                            key={route.id}
                            id={route.id}
                            type="route"
                            name={route.name || { en: 'Unnamed Route' }}
                            description={route.description || { en: 'No description available' }}
                            thumbnail={route.thumbnail || '/placeholder.svg'}
                            onClick={() => handleRouteClick(route.id)}
                            pointCount={route.pointIds?.length || 0}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {spotEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t('relatedEvents')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {spotEvents.map(event => (
                          <ItemCard
                            key={event.id}
                            id={event.id}
                            type="event"
                            name={event.name || { en: 'Unnamed Event' }}
                            description={event.description || { en: 'No description available' }}
                            thumbnail={event.thumbnail || '/placeholder.svg'}
                            onClick={() => handleEventClick(event.id)}
                            date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {spotRoutes.length === 0 && spotEvents.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No related routes or events found for this spot</p>
                    </div>
                  )}
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center">
                    <Info className="mr-1 h-4 w-4" />
                    {t('info')}
                  </TabsTrigger>
                  <TabsTrigger value="spots" className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {t('spots')}
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
                  {cityInfo ? (
                    <div className="prose max-w-none">
                      {cityInfo.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No detailed information available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="spots" className="pt-4">
                  {shouldFetchSpots && isLoadingSpots ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-pulse-gentle">Loading spots...</div>
                    </div>
                  ) : spotsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error loading spots: {(spotsError as Error).message}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {spots.length > 0 ? (
                        spots.map(spot => (
                          <ItemCard
                            key={spot.id}
                            id={spot.id}
                            type="point"
                            name={spot.name || { en: 'Unnamed Spot' }}
                            description={spot.description || { en: 'No description available' }}
                            thumbnail={spot.thumbnail || '/placeholder.svg'}
                            onClick={() => handleSpotClick(spot.id)}
                            extraContent={selectedSpot === spot.id ? (
                              <div className="mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full inline-block">
                                Selected
                              </div>
                            ) : null}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No spots available</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="routes" className="pt-4">
                  {shouldFetchRoutes && isLoadingRoutes ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-pulse-gentle">Loading routes...</div>
                    </div>
                  ) : routesError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error loading routes: {(routesError as Error).message}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {routes.length > 0 ? (
                        routes.map(route => (
                          <ItemCard
                            key={route.id}
                            id={route.id}
                            type="route"
                            name={route.name || { en: 'Unnamed Route' }}
                            description={route.description || { en: 'No description available' }}
                            thumbnail={route.thumbnail || '/placeholder.svg'}
                            onClick={() => handleRouteClick(route.id)}
                            pointCount={route.pointIds?.length || 0}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No routes available</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  {shouldFetchEvents && isLoadingEvents ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-pulse-gentle">Loading events...</div>
                    </div>
                  ) : eventsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error loading events: {(eventsError as Error).message}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.length > 0 ? (
                        events.map(event => (
                          <ItemCard
                            key={event.id}
                            id={event.id}
                            type="event"
                            name={event.name || { en: 'Unnamed Event' }}
                            description={event.description || { en: 'No description available' }}
                            thumbnail={event.thumbnail || '/placeholder.svg'}
                            onClick={() => handleEventClick(event.id)}
                            date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No events available</p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CityDetail;

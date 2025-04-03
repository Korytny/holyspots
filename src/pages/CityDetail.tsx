
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import ItemCard from '../components/ItemCard';
import Map from '../components/Map';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation as NavigationIcon, 
  Calendar,
  ArrowLeft,
  Eye,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCityById } from '../services/citiesService';
import { fetchSpotsByCity } from '../services/spotsService';
import { fetchRoutesByCity } from '../services/routesService';
import { fetchEventsByCity } from '../services/eventsService';
import { MediaItem } from '../types/models';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('info');
  const [showMap, setShowMap] = useState(false);
  
  // Fetch city data
  const { 
    data: city,
    isLoading: isLoadingCity,
    error: cityError
  } = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => fetchCityById(cityId as string),
    enabled: !!cityId,
  });
  
  // Only fetch spots, routes and events data when the respective tab is active to improve performance
  const shouldFetchSpots = activeTab === 'spots' || showMap;
  const shouldFetchRoutes = activeTab === 'routes';
  const shouldFetchEvents = activeTab === 'events';
  
  // Fetch spots data only when needed
  const {
    data: spots = [],
    isLoading: isLoadingSpots,
    error: spotsError
  } = useQuery({
    queryKey: ['spots', cityId],
    queryFn: () => fetchSpotsByCity(cityId as string),
    enabled: !!cityId && shouldFetchSpots,
  });
  
  // Fetch routes data only when needed
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ['routes', cityId],
    queryFn: () => fetchRoutesByCity(cityId as string),
    enabled: !!cityId && shouldFetchRoutes,
  });
  
  // Fetch events data only when needed
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['events', cityId],
    queryFn: () => fetchEventsByCity(cityId as string),
    enabled: !!cityId && shouldFetchEvents,
  });
  
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
    navigate(`/points/${spotId}`);
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
            <h1 className="text-3xl font-bold mb-2">{cityName}</h1>
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

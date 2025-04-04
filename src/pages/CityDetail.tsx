import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
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
import { fetchRoutesByCity, fetchRoutesBySpot } from '../services/routesService';
import { fetchEventsByCity, fetchEventsBySpot } from '../services/eventsService';
import { MediaItem, Point } from '../types/models';
import CitySpots from '../components/city/CitySpots';
import CityRoutes from '../components/city/CityRoutes';
import CityEvents from '../components/city/CityEvents';
import SelectedSpotDetails from '../components/city/SelectedSpotDetails';

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
  
  const handleMapSpotClick = (spotId: string) => {
    setSelectedSpot(spotId === selectedSpot ? null : spotId);
    
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
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
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
                  onPointSelect={handleMapSpotClick} 
                />
              </div>
            )}
            
            <div className="mt-6">
              {selectedSpot && (
                <SelectedSpotDetails 
                  selectedSpot={selectedSpotObject}
                  spotRoutes={spotRoutes}
                  spotEvents={spotEvents}
                  onClearSelectedSpot={clearSelectedSpot}
                  onRouteClick={handleRouteClick}
                  onEventClick={handleEventClick}
                />
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
                      <h3 className="text-lg font-medium mb-2">{t('info')}</h3>
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
                  <CitySpots 
                    spots={spots}
                    isLoading={shouldFetchSpots && isLoadingSpots}
                    error={spotsError as Error | null}
                    selectedSpot={selectedSpot}
                    onSpotClick={handleSpotClick}
                  />
                </TabsContent>
                
                <TabsContent value="routes" className="pt-4">
                  <CityRoutes 
                    routes={routes}
                    isLoading={shouldFetchRoutes && isLoadingRoutes}
                    error={routesError as Error | null}
                    onRouteClick={handleRouteClick}
                  />
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  <CityEvents
                    events={events}
                    isLoading={shouldFetchEvents && isLoadingEvents}
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

export default CityDetail;

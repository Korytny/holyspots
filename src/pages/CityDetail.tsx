
import { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';
import { City, Point, Route, Event } from '../types/models';
import { useQuery } from '@tanstack/react-query';
import { fetchCityById } from '../services/citiesService';
import { fetchSpotsByCity } from '../services/spotsService';
import { fetchRoutesByCity } from '../services/routesService';
import { fetchEventsByCity } from '../services/eventsService';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('points');
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
  
  // Fetch points data
  const {
    data: points = [],
    isLoading: isLoadingPoints
  } = useQuery({
    queryKey: ['points', cityId],
    queryFn: () => fetchSpotsByCity(cityId as string),
    enabled: !!cityId,
  });
  
  // Fetch routes data
  const {
    data: routes = [],
    isLoading: isLoadingRoutes
  } = useQuery({
    queryKey: ['routes', cityId],
    queryFn: () => fetchRoutesByCity(cityId as string),
    enabled: !!cityId,
  });
  
  // Fetch events data
  const {
    data: events = [],
    isLoading: isLoadingEvents
  } = useQuery({
    queryKey: ['events', cityId],
    queryFn: () => fetchEventsByCity(cityId as string),
    enabled: !!cityId,
  });
  
  const isLoading = isLoadingCity || isLoadingPoints || isLoadingRoutes || isLoadingEvents;
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/cities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cities')}
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">City not found</h2>
          </div>
        </div>
      </div>
    );
  }
  
  const handlePointClick = (pointId: string) => {
    navigate(`/points/${pointId}`);
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
            <h1 className="text-3xl font-bold mb-2">{city.name[language]}</h1>
            <p className="text-muted-foreground mb-6">{city.description[language]}</p>
            
            <MediaGallery media={city.media} />
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={toggleMapView}>
                {showMap ? t('hideMap') : t('viewOnMap')}
                <Eye className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {showMap && points.length > 0 && (
              <div className="mt-4">
                <Map 
                  points={points} 
                  center={[city.location.longitude, city.location.latitude]} 
                  zoom={12} 
                  onPointSelect={handlePointClick} 
                />
              </div>
            )}
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="points" className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {t('points')}
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
                
                <TabsContent value="points" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {points.length > 0 ? (
                      points.map(point => (
                        <ItemCard
                          key={point.id}
                          id={point.id}
                          type="point"
                          name={point.name}
                          description={point.description}
                          thumbnail={point.thumbnail}
                          onClick={() => handlePointClick(point.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No points available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="routes" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.length > 0 ? (
                      routes.map(route => (
                        <ItemCard
                          key={route.id}
                          id={route.id}
                          type="route"
                          name={route.name}
                          description={route.description}
                          thumbnail={route.thumbnail}
                          onClick={() => handleRouteClick(route.id)}
                          pointCount={route.pointIds.length}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No routes available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                      events.map(event => (
                        <ItemCard
                          key={event.id}
                          id={event.id}
                          type="event"
                          name={event.name}
                          description={event.description}
                          thumbnail={event.thumbnail}
                          onClick={() => handleEventClick(event.id)}
                          date={new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU')}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No events available</p>
                      </div>
                    )}
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

export default CityDetail;

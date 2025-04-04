
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCityById } from '../services/citiesService';
import { fetchPointsByCity } from '../services/pointsService';
import { fetchRoutesByCity } from '../services/routesService';
import { fetchEventsByCity } from '../services/eventsService';
import { City, Point, Route, Event, GeoPoint } from '../types/models';
import { useLanguage } from '../contexts/LanguageContext';
import CityMap from '../components/city/CityMap';
import CitySpots from '../components/city/CitySpots';
import CityRoutes from '../components/city/CityRoutes';
import CityEvents from '../components/city/CityEvents';
import Navigation from '../components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchRoutesByPoint } from '../services/routesService';
import { fetchEventsByPoint } from '../services/eventsService';
import SelectedSpotDetails from '../components/city/SelectedSpotDetails';

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
  const [city, setCity] = useState<City | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<Error | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Point | null>(null);
  const [selectedSpotRoutes, setSelectedSpotRoutes] = useState<Route[]>([]);
  const [selectedSpotEvents, setSelectedSpotEvents] = useState<Event[]>([]);
  const [centerPoint, setCenterPoint] = useState<GeoPoint | null>(null);
  const [isSpotDetailsOpen, setIsSpotDetailsOpen] = useState(false);
  
  useEffect(() => {
    if (!cityId) {
      toast({
        title: "Error",
        description: "City ID is missing",
        variant: "destructive"
      });
      navigate('/cities');
      return;
    }
    
    const loadCityData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        console.log('Fetching city data for ID:', cityId);
        const cityData = await fetchCityById(cityId);
        
        if (!cityData) {
          toast({
            title: "Error",
            description: "City not found",
            variant: "destructive"
          });
          navigate('/cities');
          return;
        }
        
        setCity(cityData);
        
        // Load related data in parallel
        try {
          console.log('Fetching city points...');
          const spotsData = await fetchPointsByCity(cityId);
          setPoints(spotsData);
          
          // Set center point for the map
          if (spotsData.length > 0 && spotsData[0].location) {
            const firstPoint = spotsData[0].location;
            
            const geoPoint: GeoPoint = {
              type: "Point",
              coordinates: [firstPoint.longitude, firstPoint.latitude]
            };
            
            setCenterPoint(geoPoint);
          }
        } catch (spotsError) {
          console.error('Error loading city spots:', spotsError);
        }
        
        try {
          console.log('Fetching city routes...');
          const routesData = await fetchRoutesByCity(cityId);
          setRoutes(routesData);
        } catch (routesError) {
          console.error('Error loading city routes:', routesError);
        }
        
        try {
          console.log('Fetching city events...');
          const eventsData = await fetchEventsByCity(cityId);
          setEvents(eventsData);
        } catch (eventsError) {
          console.error('Error loading city events:', eventsError);
        }
      } catch (error) {
        console.error('Error loading city data:', error);
        setLoadingError(error instanceof Error ? error : new Error('Failed to load city data'));
        toast({
          title: "Error",
          description: "Failed to load city data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCityData();
  }, [cityId, navigate, toast]);
  
  const handleSpotClick = async (spotId: string) => {
    // При клике на достопримечательность переходим на страницу этой достопримечательности
    navigate(`/points/${spotId}`);
  };
  
  const handleMapSpotClick = async (spotId: string) => {
    const spot = points.find(p => p.id === spotId);
    if (!spot) return;
    
    setSelectedSpot(spot);
    
    if (spot.location) {
      const geoPoint: GeoPoint = {
        type: "Point",
        coordinates: [spot.location.longitude, spot.location.latitude]
      };
      setCenterPoint(geoPoint);
    }
    
    setIsSpotDetailsOpen(true);
    
    try {
      const [spotRoutes, spotEvents] = await Promise.all([
        fetchRoutesByPoint(spot.id),
        fetchEventsByPoint(spot.id)
      ]);
      
      setSelectedSpotRoutes(spotRoutes);
      setSelectedSpotEvents(spotEvents);
    } catch (error) {
      console.error('Error loading spot details:', error);
      toast({
        title: "Error",
        description: "Failed to load spot details",
        variant: "destructive"
      });
    }
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const handleCloseSpotDetails = () => {
    setIsSpotDetailsOpen(false);
    setSelectedSpot(null);
    setSelectedSpotRoutes([]);
    setSelectedSpotEvents([]);
  };

  const handleViewSpotDetails = (pointId: string) => {
    navigate(`/points/${pointId}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading city details...</p>
        </div>
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">City not found</p>
          <Button onClick={() => navigate('/cities')} className="mt-4">
            Go back to cities
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      
      <div className="container mx-auto py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">
            {typeof city.name === 'object' 
              ? city.name[language] || city.name.en || 'Unknown City'
              : city.name || 'Unknown City'}
          </h1>
          
          {city.description && (
            <p className="mt-2 text-muted-foreground">
              {typeof city.description === 'object' 
                ? city.description[language] || city.description.en || ''
                : city.description || ''}
            </p>
          )}
          
          {/* City images */}
          {city.images && Array.isArray(city.images) && city.images.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {city.images.slice(0, 3).map((image, index) => (
                <img 
                  key={index}
                  src={image}
                  alt={`City view ${index + 1}`}
                  className="w-full h-48 object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </header>
        
        <div className="space-y-8">
          {/* Map goes first */}
          <div className="w-full">
            <CityMap 
              points={points}
              cityLocation={city.location}
              onPointSelect={handleMapSpotClick}
            />
          </div>
          
          {/* Selected spot details when available */}
          {isSpotDetailsOpen && selectedSpot && (
            <SelectedSpotDetails
              selectedSpot={selectedSpot}
              spotRoutes={selectedSpotRoutes}
              spotEvents={selectedSpotEvents}
              onClearSelectedSpot={handleCloseSpotDetails}
              onRouteClick={handleRouteClick}
              onEventClick={handleEventClick}
              onViewSpotDetails={handleViewSpotDetails}
            />
          )}
          
          {/* Tabs for different sections */}
          <Tabs defaultValue="spots" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spots">
                {t('pointsOfInterest')} ({points.length})
              </TabsTrigger>
              <TabsTrigger value="routes">
                {t('routes')} ({routes.length})
              </TabsTrigger>
              <TabsTrigger value="events">
                {t('events')} ({events.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spots">
              <CitySpots 
                spots={points} 
                isLoading={false}
                error={loadingError}
                selectedSpot={selectedSpot ? selectedSpot.id : null}
                onSpotClick={handleSpotClick} 
              />
            </TabsContent>
            
            <TabsContent value="routes">
              <CityRoutes 
                routes={routes}
                isLoading={false}
                error={loadingError}
                onRouteClick={handleRouteClick}
              />
            </TabsContent>
            
            <TabsContent value="events">
              <CityEvents 
                events={events}
                isLoading={false}
                error={loadingError}
                onEventClick={handleEventClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CityDetail;

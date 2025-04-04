
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Heart, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ItemCardWrapper from '../components/ItemCardWrapper';
import { City, Point, Route, Event } from '../types/models';

const Profile = () => {
  const { t, language } = useLanguage();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('cities');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [favorites, setFavorites] = useState<{
    cities: City[];
    points: Point[];
    routes: Route[];
    events: Event[];
    isLoading: boolean;
    error: Error | null;
  }>({
    cities: [],
    points: [],
    routes: [],
    events: [],
    isLoading: false,
    error: null
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    
    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, navigate]);
  
  const fetchFavorites = async () => {
    if (!user) return;
    
    setFavorites(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch favorite cities
      if (user.favorites.cities.length > 0) {
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .in('id', user.favorites.cities);
          
        if (citiesError) throw citiesError;
        
        const cities = citiesData.map(city => ({
          id: city.id,
          name: typeof city.name === 'object' ? city.name : { en: city.name, ru: city.name },
          description: city.info || { en: '', ru: '' },
          thumbnail: city.images?.[0] || '/placeholder.svg',
          pointIds: [],
          routeIds: [],
          eventIds: [],
          location: { latitude: 0, longitude: 0 }
        }));
        
        setFavorites(prev => ({ ...prev, cities }));
      }
      
      // Fetch favorite spots (points)
      if (user.favorites.points.length > 0) {
        const { data: pointsData, error: pointsError } = await supabase
          .from('spots')
          .select('*')
          .in('id', user.favorites.points);
          
        if (pointsError) throw pointsError;
        
        const points = pointsData.map(point => ({
          id: point.id,
          cityId: point.city || '',
          type: point.type === 1 ? 'temple' : point.type === 2 ? 'ashram' : point.type === 3 ? 'kund' : 'other',
          name: point.name || { en: 'Unnamed Point', ru: 'Безымянная точка' },
          description: point.info || { en: '', ru: '' },
          media: [],
          thumbnail: point.images?.[0] || '/placeholder.svg',
          location: point.coordinates ? {
            latitude: point.coordinates.lat || 0,
            longitude: point.coordinates.lng || 0
          } : { latitude: 0, longitude: 0 },
          routeIds: [],
          eventIds: []
        }));
        
        setFavorites(prev => ({ ...prev, points }));
      }
      
      // Fetch favorite routes
      if (user.favorites.routes.length > 0) {
        const { data: routesData, error: routesError } = await supabase
          .from('routes')
          .select('*')
          .in('id', user.favorites.routes);
          
        if (routesError) throw routesError;
        
        const routes = routesData.map(route => ({
          id: route.id,
          cityId: '',
          name: route.name || { en: 'Unnamed Route', ru: 'Безымянный маршрут' },
          description: { en: '', ru: '' },
          media: [],
          thumbnail: '/placeholder.svg',
          pointIds: [],
          eventIds: []
        }));
        
        setFavorites(prev => ({ ...prev, routes }));
      }
      
      // Fetch favorite events
      if (user.favorites.events.length > 0) {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', user.favorites.events);
          
        if (eventsError) throw eventsError;
        
        const events = eventsData.map(event => ({
          id: event.id,
          cityId: '',
          name: event.name || { en: 'Unnamed Event', ru: 'Безымянное событие' },
          description: event.info || { en: '', ru: '' },
          media: [],
          thumbnail: event.images?.[0] || '/placeholder.svg',
          pointIds: [],
          startDate: event.time || new Date().toISOString(),
          endDate: event.time || new Date().toISOString()
        }));
        
        setFavorites(prev => ({ ...prev, events }));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('Failed to fetch favorites') 
      }));
      
      toast({
        title: "Error",
        description: "Failed to fetch your favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFavorites(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCityClick = (cityId: string) => {
    navigate(`/cities/${cityId}`);
  };
  
  const handlePointClick = (pointId: string) => {
    navigate(`/points/${pointId}`);
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const getCounts = () => {
    return {
      cities: favorites.cities.length || 0,
      points: favorites.points.length || 0,
      routes: favorites.routes.length || 0,
      events: favorites.events.length || 0
    };
  };
  
  const counts = getCounts();
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
              <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('') || user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-auto">
              <Button variant="outline" className="flex items-center" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('logOut')}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b flex items-center">
            <Heart className="mr-2 h-5 w-5 text-burgundy" />
            {t('favorites')}
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="cities" className="flex justify-center items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('cities')} ({counts.cities})</span>
              </TabsTrigger>
              <TabsTrigger value="points" className="flex justify-center items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('points')} ({counts.points})</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex justify-center items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('routes')} ({counts.routes})</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex justify-center items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{t('events')} ({counts.events})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cities" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-muted h-64 rounded-lg"></div>
                  ))
                ) : favorites.cities.length > 0 ? (
                  favorites.cities.map(city => (
                    <ItemCardWrapper
                      key={city.id}
                      id={city.id}
                      type="city"
                      name={city.name}
                      description={city.description}
                      thumbnail={city.thumbnail}
                      location={`${city.name[language] || city.name.en}`}
                      onClick={() => handleCityClick(city.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">{t('noFavoriteCities')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="points" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-muted h-64 rounded-lg"></div>
                  ))
                ) : favorites.points.length > 0 ? (
                  favorites.points.map(point => (
                    <ItemCardWrapper
                      key={point.id}
                      id={point.id}
                      type="point"
                      name={point.name}
                      description={point.description}
                      thumbnail={point.thumbnail}
                      location={`${point.name[language] || point.name.en}`}
                      spotType={point.type}
                      onClick={() => handlePointClick(point.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">{t('noFavoritePoints')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="routes" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-muted h-64 rounded-lg"></div>
                  ))
                ) : favorites.routes.length > 0 ? (
                  favorites.routes.map(route => (
                    <ItemCardWrapper
                      key={route.id}
                      id={route.id}
                      type="route"
                      name={route.name}
                      description={route.description}
                      thumbnail={route.thumbnail}
                      pointCount={route.pointIds?.length}
                      onClick={() => handleRouteClick(route.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">{t('noFavoriteRoutes')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-muted h-64 rounded-lg"></div>
                  ))
                ) : favorites.events.length > 0 ? (
                  favorites.events.map(event => (
                    <ItemCardWrapper
                      key={event.id}
                      id={event.id}
                      type="event"
                      name={event.name}
                      description={event.description}
                      thumbnail={event.thumbnail}
                      date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
                      onClick={() => handleEventClick(event.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">{t('noFavoriteEvents')}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;

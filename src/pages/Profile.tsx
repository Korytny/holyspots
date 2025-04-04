
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Heart, LogOut } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { useToast } from '@/components/ui/use-toast';

// Define proper types for the favorites to avoid type errors
interface FavoriteItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  location: string;
  pointCount?: number;
  date?: string;
}

const Profile = () => {
  const { t } = useLanguage();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('cities');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Temporary mock data for favorites (replace with real data from API later)
  const [favorites, setFavorites] = useState<{
    cities: FavoriteItem[];
    points: FavoriteItem[];
    routes: FavoriteItem[];
    events: FavoriteItem[];
  }>({
    cities: [],
    points: [],
    routes: [],
    events: []
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    
    // For now, just set mock data
    // In a real app, you would fetch this from an API
    if (user) {
      setFavorites({
        cities: user.favorites.cities as unknown as FavoriteItem[] || [],
        points: user.favorites.points as unknown as FavoriteItem[] || [],
        routes: user.favorites.routes as unknown as FavoriteItem[] || [],
        events: user.favorites.events as unknown as FavoriteItem[] || []
      });
    }
  }, [user, authLoading, navigate]);
  
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
                {favorites.cities.length > 0 ? (
                  favorites.cities.map(city => (
                    <ItemCard
                      key={city.id}
                      id={city.id}
                      type="city"
                      name={city.name}
                      description={city.description}
                      thumbnail={city.thumbnail}
                      location={city.location}
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
                {favorites.points.length > 0 ? (
                  favorites.points.map(point => (
                    <ItemCard
                      key={point.id}
                      id={point.id}
                      type="point"
                      name={point.name}
                      description={point.description}
                      thumbnail={point.thumbnail}
                      location={point.location}
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
                {favorites.routes.length > 0 ? (
                  favorites.routes.map(route => (
                    <ItemCard
                      key={route.id}
                      id={route.id}
                      type="route"
                      name={route.name}
                      description={route.description}
                      thumbnail={route.thumbnail}
                      location={route.location}
                      pointCount={route.pointCount}
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
                {favorites.events.length > 0 ? (
                  favorites.events.map(event => (
                    <ItemCard
                      key={event.id}
                      id={event.id}
                      type="event"
                      name={event.name}
                      description={event.description}
                      thumbnail={event.thumbnail}
                      location={event.location}
                      date={event.date}
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

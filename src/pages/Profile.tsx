import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { City, Point, Route, Event } from '../types/models';
import { fetchCityById } from '../services/citiesService';
import { fetchPointById } from '../services/pointsService';
import { fetchRouteById } from '../services/routesService';
import { fetchEventById } from '../services/eventsService';
import ItemCardWrapper from '../components/ItemCardWrapper';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Navigation from '../components/Navigation';
import { useToast } from '@/components/ui/use-toast';

interface FavoritesData {
  cities: City[];
  points: Point[];
  routes: Route[];
  events: Event[];
}

const Profile = () => {
  const { user, signOut, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [favorites, setFavorites] = useState<FavoritesData>({
    cities: [],
    points: [],
    routes: [],
    events: [],
  });
  
  useEffect(() => {
    console.log("Profile component mounted");
    console.log("Auth loading:", authLoading);
    console.log("Is authenticated:", isAuthenticated);
    console.log("User:", user);
    
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to auth page");
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, authLoading, user]);
  
  useEffect(() => {
    if (user && isAuthenticated && !authLoading) {
      console.log("User is authenticated, fetching favorites");
      fetchFavorites();
    }
  }, [user, isAuthenticated, authLoading]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('signedOut'),
        description: t('youHaveBeenSignedOut'),
      });
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out', error);
      toast({
        title: t('error'),
        description: t('failedToSignOut'),
        variant: 'destructive'
      });
    }
  };

  const fetchFavorites = async () => {
    try {
      if (!user || !user.favorites) {
        console.log("No user or favorites available");
        setIsLoadingFavorites(false);
        return;
      }

      setIsLoadingFavorites(true);
      setError(null);
      console.log("Fetching favorites for user:", user?.id);
      console.log("User favorites:", user?.favorites);

      if (user.favorites.cities?.length) {
        const citiesPromises = user.favorites.cities.map(cityId => 
          fetchCityById(cityId)
        );
        const citiesResults = await Promise.all(citiesPromises);
        const validCities = citiesResults.filter(city => city !== null) as City[];
        
        setFavorites(prev => ({ 
          ...prev, 
          cities: validCities
        }));
      }

      if (user.favorites.points?.length) {
        const pointsPromises = user.favorites.points.map(pointId => 
          fetchPointById(pointId)
        );
        const pointsResults = await Promise.all(pointsPromises);
        const validPoints = pointsResults.filter(point => point !== null) as Point[];
        
        setFavorites(prev => ({ 
          ...prev, 
          points: validPoints
        }));
      }

      if (user.favorites.routes?.length) {
        const routesPromises = user.favorites.routes.map(routeId => 
          fetchRouteById(routeId)
        );
        const routesResults = await Promise.all(routesPromises);
        const validRoutes = routesResults.filter(route => route !== null) as Route[];
        
        setFavorites(prev => ({ 
          ...prev, 
          routes: validRoutes
        }));
      }

      if (user.favorites.events?.length) {
        const eventsPromises = user.favorites.events.map(eventId => 
          fetchEventById(eventId)
        );
        const eventsResults = await Promise.all(eventsPromises);
        const validEvents = eventsResults.filter(event => event !== null) as Event[];
        
        setFavorites(prev => ({ 
          ...prev, 
          events: validEvents
        }));
      }
      
      setIsLoadingFavorites(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error as Error);
      setIsLoadingFavorites(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('redirecting')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{t('profile')}</h1>
        
        <div className="mb-4 bg-white p-4 rounded-md shadow">
          <p className="mb-2">
            {t('loggedInAs')}: {user?.email}
          </p>
          <Button onClick={handleSignOut}>{t('signOut')}</Button>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{t('favorites')}</h2>
        
        {isLoadingFavorites ? (
          <p>{t('loading')}...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : (
          <>
            {favorites.cities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">{t('cities')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.cities.map((city) => (
                    <ItemCardWrapper
                      key={city.id}
                      id={city.id}
                      type="city"
                      name={city.name}
                      description={city.description}
                      thumbnail={city.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {favorites.points.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">{t('pointsOfInterest')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.points.map((point) => (
                    <ItemCardWrapper
                      key={point.id}
                      id={point.id}
                      type="point"
                      name={point.name}
                      description={point.description}
                      thumbnail={point.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {favorites.routes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">{t('routes')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.routes.map((route) => (
                    <ItemCardWrapper
                      key={route.id}
                      id={route.id}
                      type="route"
                      name={route.name}
                      description={route.description}
                      thumbnail={route.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {favorites.events.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">{t('events')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.events.map((event) => (
                    <ItemCardWrapper
                      key={event.id}
                      id={event.id}
                      type="event"
                      name={event.name}
                      description={event.description}
                      thumbnail={event.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {favorites.cities.length === 0 &&
              favorites.points.length === 0 &&
              favorites.routes.length === 0 &&
              favorites.events.length === 0 && (
                <p className="bg-white p-4 rounded-md shadow">{t('noFavorites')}</p>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

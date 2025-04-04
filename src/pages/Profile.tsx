
import React, { useState, useEffect } from 'react';
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

// Mock user data since we're removing authentication
const mockUser = {
  id: "mock-user-id",
  email: "user@example.com",
  favorites: {
    cities: [],
    points: [],
    routes: [],
    events: []
  }
};

const Profile = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [favorites, setFavorites] = useState<FavoritesData>({
    cities: [],
    points: [],
    routes: [],
    events: [],
  });

  useEffect(() => {
    // Simple loading message instead of auth check
    toast({
      title: t('welcome'),
      description: t('profileWithoutAuth'),
    });
  }, []);
  
  const handleSignOut = () => {
    toast({
      title: t('notice'),
      description: t('authRemoved'),
    });
  };

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{t('profile')}</h1>
        
        <div className="mb-4 bg-white p-4 rounded-md shadow">
          <p className="mb-2">
            {t('loggedInAs')}: {mockUser.email}
          </p>
          <p className="text-gray-500 mb-4">{t('authDisabled')}</p>
          <Button onClick={handleSignOut}>{t('signOut')}</Button>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{t('favorites')}</h2>
        
        <p className="bg-white p-4 rounded-md shadow">{t('noFavorites')}</p>
      </div>
    </div>
  );
};

export default Profile;

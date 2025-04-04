import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Event, Route, Point } from '../types/models';
import { fetchEventById } from '../services/eventsService';
import { fetchRoutesByEvent } from '../services/routesService';
import { fetchPointsByEventId } from '../services/pointsService';
import { Button } from '@/components/ui/button';
import ItemCardWrapper from '../components/ItemCardWrapper';
import { MapPin, Calendar, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import FavoriteDetailButton from '../components/FavoriteDetailButton';
import { useToast } from '@/components/ui/use-toast';

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        if (!eventId) {
          toast({
            title: t('error'),
            description: t('eventNotFound'),
            variant: 'destructive'
          });
          navigate('/cities');
          return;
        }
        
        const eventData = await fetchEventById(eventId);
        if (!eventData) {
          toast({
            title: t('error'),
            description: t('eventNotFound'),
            variant: 'destructive'
          });
          navigate('/cities');
          return;
        }
        
        setEvent(eventData);
        
        // Fetch related routes with the eventId parameter
        const routesData = await fetchRoutesByEvent(eventId);
        setRoutes(routesData);
        
        // Fetch related points with the eventId parameter
        const pointsData = await fetchPointsByEventId(eventId);
        setPoints(pointsData);
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast({
          title: t('error'),
          description: t('errorFetchingEventData'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, navigate, t, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen bg-muted">
        <Navigation />
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">{t('eventDetails')}</h1>
          <p className="text-red-500">{t('eventNotFound')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{t('eventDetails')}</h1>
        
        <div className="mb-4">
          <MediaGallery media={event.media} />
        </div>
        
        <div className="bg-white p-4 rounded-md shadow mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{event.name[language] || event.name['en']}</h2>
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                {event.startDate ? new Date(event.startDate).toLocaleDateString(language) : t('noDateAvailable')}
              </div>
              {event.cityId && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  <Link to={`/cities/${event.cityId}`} className="hover:underline">
                    {t('city')}
                  </Link>
                </div>
              )}
            </div>
            <FavoriteDetailButton itemId={event.id} itemType="event" />
          </div>
          
          <p className="text-gray-700">{event.description[language] || event.description['en']}</p>
        </div>
        
        {routes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('relatedRoutes')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
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
        
        {points.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('relatedPoints')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {points.map((point) => (
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
        
        {routes.length === 0 && points.length === 0 && (
          <div className="bg-white p-4 rounded-md shadow">
            <p>{t('noRelatedItems')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;

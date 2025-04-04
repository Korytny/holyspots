import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchAllPoints } from '../services/pointsService';
import { fetchRoutes } from "../services/routesService";
import { fetchEvents } from "../services/eventsService";
import { Point, Route, Event } from '../types/models';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ItemCardWrapper from '../components/ItemCardWrapper';

const Search = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [spots, setSpots] = useState<Point[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const spotsData = await fetchAllPoints();
        const routesData = await fetchRoutes();
        const eventsData = await fetchEvents();
        
        setSpots(spotsData);
        setRoutes(routesData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Filter spots, routes, and events based on the search term
  const filterItems = (items: any[], term: string) => {
    if (!Array.isArray(items)) {
      return [];
    }
    
    const lowerTerm = term.toLowerCase();
    
    return items.filter(item => {
      const name = item.name?.[language]?.toLowerCase() || item.name?.en?.toLowerCase() || '';
      const description = item.description?.[language]?.toLowerCase() || item.description?.en?.toLowerCase() || '';
      
      return name.includes(lowerTerm) || description.includes(lowerTerm);
    });
  };
  
  const filteredSpots = Array.isArray(spots) ? spots.filter((spot) => {
    const name = spot.name?.[language]?.toLowerCase() || spot.name?.en?.toLowerCase() || '';
    const description = spot.description?.[language]?.toLowerCase() || spot.description?.en?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  }) : [];
  
  const filteredRoutes = Array.isArray(routes) ? routes.filter((route) => {
    const name = route.name?.[language]?.toLowerCase() || route.name?.en?.toLowerCase() || '';
    const description = route.description?.[language]?.toLowerCase() || route.description?.en?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  }) : [];
  
  const filteredEvents = Array.isArray(events) ? events.filter((event) => {
    const name = event.name?.[language]?.toLowerCase() || event.name?.en?.toLowerCase() || '';
    const description = event.description?.[language]?.toLowerCase() || event.description?.en?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  }) : [];
  
  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{t('search')}</h1>
        
        <div className="mb-4">
          <Label htmlFor="search">{t('search')}</Label>
          <Input
            type="text"
            id="search"
            placeholder={t('search')}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse-gentle">Loading search results...</div>
          </div>
        ) : (
          <>
            {filteredSpots.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('pointsOfInterest')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpots.map(spot => (
                    <ItemCardWrapper
                      key={spot.id}
                      id={spot.id}
                      type="point"
                      name={spot.name}
                      description={spot.description}
                      thumbnail={spot.thumbnail}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {filteredRoutes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('routes')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoutes.map(route => (
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
            
            {filteredEvents.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('events')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.map(event => (
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
            
            {filteredSpots.length === 0 && filteredRoutes.length === 0 && filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;

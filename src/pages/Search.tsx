import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchAllPoints } from '../services/pointsService';
import { fetchAllRoutes } from "../services/routesService";
import { fetchEvents } from "../services/eventsService";
import { fetchCities } from "../services/citiesService"; // Fixed import
import { Point, Route, Event, City } from '../types/models';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import ItemCardWrapper from '../components/ItemCardWrapper';
import Navigation from '../components/Navigation';

const Search = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpotType, setSelectedSpotType] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [spots, setSpots] = useState<Point[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize from URL params
  useEffect(() => {
    const term = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const type = searchParams.get('type') || '';
    const tab = searchParams.get('tab') || 'all';
    
    setSearchTerm(term);
    setSelectedCity(city);
    setSelectedSpotType(type);
    setActiveTab(tab);
  }, [searchParams]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [citiesData, spotsData, routesData, eventsData] = await Promise.all([
          fetchCities(), // Using the correct import
          fetchAllPoints(),
          fetchAllRoutes(),
          fetchEvents()
        ]);
        
        setCities(citiesData);
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
  
  const updateSearchParams = (params: { 
    q?: string; 
    city?: string; 
    type?: string;
    tab?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (params.q !== undefined) {
      if (params.q) newParams.set('q', params.q);
      else newParams.delete('q');
    }
    
    if (params.city !== undefined) {
      if (params.city) newParams.set('city', params.city);
      else newParams.delete('city');
    }
    
    if (params.type !== undefined) {
      if (params.type) newParams.set('type', params.type);
      else newParams.delete('type');
    }
    
    if (params.tab !== undefined) {
      if (params.tab !== 'all') newParams.set('tab', params.tab);
      else newParams.delete('tab');
    }
    
    setSearchParams(newParams);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateSearchParams({ q: value });
  };
  
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    updateSearchParams({ city: value });
  };
  
  const handleSpotTypeChange = (value: string) => {
    setSelectedSpotType(value);
    updateSearchParams({ type: value });
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateSearchParams({ tab: value });
  };
  
  const filterItems = <T extends Point | Route | Event>(
    items: T[],
    nameGetter: (item: T) => Record<string, string> | undefined,
    descriptionGetter: (item: T) => Record<string, string> | undefined,
    cityGetter: (item: T) => string | undefined,
    typeGetter?: (item: T) => string | undefined
  ) => {
    return Array.isArray(items) ? items.filter((item) => {
      const name = nameGetter(item)?.[language]?.toLowerCase() || nameGetter(item)?.en?.toLowerCase() || '';
      const description = descriptionGetter(item)?.[language]?.toLowerCase() || descriptionGetter(item)?.en?.toLowerCase() || '';
      const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
      
      const itemCity = cityGetter(item);
      const matchesCity = !selectedCity || itemCity === selectedCity;
      
      const matchesType = !selectedSpotType || !typeGetter || (typeGetter(item) === selectedSpotType);
      
      return matchesSearch && matchesCity && matchesType;
    }) : [];
  };
  
  const filteredSpots = filterItems(
    spots,
    (spot) => spot.name,
    (spot) => spot.description,
    (spot) => spot.cityId,
    (spot) => spot.type
  );
  
  const filteredRoutes = filterItems(
    routes,
    (route) => route.name,
    (route) => route.description,
    (route) => route.cityId
  );
  
  const filteredEvents = filterItems(
    events,
    (event) => event.name,
    (event) => event.description,
    (event) => event.cityId
  );
  
  const getSpotTypeName = (type: string) => {
    switch (type) {
      case 'temple': return t('temple');
      case 'ashram': return t('ashram');
      case 'kund': return t('kund');
      default: return t('other');
    }
  };
  
  const spotTypes = ['temple', 'ashram', 'kund', 'other'];
  
  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">{t('search')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <Label htmlFor="search">{t('searchTerm')}</Label>
            <Input
              type="text"
              id="search"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">{t('city')}</Label>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger id="city">
                <SelectValue placeholder={t('allCities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCities')}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name[language] || city.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spotType">{t('spotType')}</Label>
            <Select value={selectedSpotType} onValueChange={handleSpotTypeChange}>
              <SelectTrigger id="spotType">
                <SelectValue placeholder={t('allSpotTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSpotTypes')}</SelectItem>
                {spotTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getSpotTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="spots">{t('pointsOfInterest')}</TabsTrigger>
            <TabsTrigger value="routes">{t('routes')}</TabsTrigger>
            <TabsTrigger value="events">{t('events')}</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse-gentle">Loading search results...</div>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-8">
                {(filteredSpots.length > 0 || filteredRoutes.length > 0 || filteredEvents.length > 0) ? (
                  <>
                    {filteredSpots.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">{t('pointsOfInterest')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredSpots.slice(0, 6).map(spot => (
                            <ItemCardWrapper
                              key={spot.id}
                              id={spot.id}
                              type="point"
                              name={spot.name}
                              description={spot.description}
                              thumbnail={spot.thumbnail}
                              spotType={spot.type}
                            />
                          ))}
                        </div>
                        {filteredSpots.length > 6 && (
                          <div className="mt-3 text-right">
                            <button 
                              onClick={() => handleTabChange('spots')} 
                              className="text-primary hover:underline"
                            >
                              {t('viewMore')} ({filteredSpots.length - 6})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {filteredRoutes.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">{t('routes')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRoutes.slice(0, 6).map(route => (
                            <ItemCardWrapper
                              key={route.id}
                              id={route.id}
                              type="route"
                              name={route.name}
                              description={route.description}
                              thumbnail={route.thumbnail}
                              pointCount={route.pointIds?.length || 0}
                            />
                          ))}
                        </div>
                        {filteredRoutes.length > 6 && (
                          <div className="mt-3 text-right">
                            <button 
                              onClick={() => handleTabChange('routes')} 
                              className="text-primary hover:underline"
                            >
                              {t('viewMore')} ({filteredRoutes.length - 6})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {filteredEvents.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">{t('events')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredEvents.slice(0, 6).map(event => (
                            <ItemCardWrapper
                              key={event.id}
                              id={event.id}
                              type="event"
                              name={event.name}
                              description={event.description}
                              thumbnail={event.thumbnail}
                              date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
                            />
                          ))}
                        </div>
                        {filteredEvents.length > 6 && (
                          <div className="mt-3 text-right">
                            <button 
                              onClick={() => handleTabChange('events')} 
                              className="text-primary hover:underline"
                            >
                              {t('viewMore')} ({filteredEvents.length - 6})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found for your search</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="spots">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpots.length > 0 ? (
                    filteredSpots.map(spot => (
                      <ItemCardWrapper
                        key={spot.id}
                        id={spot.id}
                        type="point"
                        name={spot.name}
                        description={spot.description}
                        thumbnail={spot.thumbnail}
                        spotType={spot.type}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No spots found for your search</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="routes">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map(route => (
                      <ItemCardWrapper
                        key={route.id}
                        id={route.id}
                        type="route"
                        name={route.name}
                        description={route.description}
                        thumbnail={route.thumbnail}
                        pointCount={route.pointIds?.length || 0}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No routes found for your search</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="events">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <ItemCardWrapper
                        key={event.id}
                        id={event.id}
                        type="event"
                        name={event.name}
                        description={event.description}
                        thumbnail={event.thumbnail}
                        date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">No events found for your search</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Search;


import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import Navigation from '../components/Navigation';
import ItemCardWrapper from '../components/ItemCardWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Navigation as NavigationIcon, 
  Calendar 
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

import { City, Point, Route, Event } from '../types/models';
import { fetchCities } from '../services/citiesService';
import { fetchAllPoints } from '../services/pointsService';
import { fetchAllRoutes } from '../services/routesService';
import { fetchAllEvents } from '../services/eventsService';

const matchesSearchTerm = (text: string | Record<string, string> | undefined, searchTerm: string): boolean => {
  if (!text) return false;
  if (typeof text === 'string') {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }
  if (typeof text === 'object') {
    return Object.values(text).some(val => 
      val && typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return false;
};

const Search = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const {
    data: cities = [],
    isLoading: isLoadingCities,
    error: citiesError
  } = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
  });

  const {
    data: spots = [],
    isLoading: isLoadingSpots,
    error: spotsError
  } = useQuery({
    queryKey: ['spots'],
    queryFn: () => fetchAllPoints(),
  });

  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ['allRoutes'],
    queryFn: fetchAllRoutes,
  });

  const {
    data: events = [],
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['allEvents'],
    queryFn: fetchAllEvents,
  });

  const isLoading = isLoadingCities || isLoadingSpots || isLoadingRoutes || isLoadingEvents;

  const filteredCities = cities.filter(city => {
    if (cityFilter !== 'all' && city.id !== cityFilter) {
      return false;
    }
    
    if (!searchQuery) return true;
    
    const nameMatches = matchesSearchTerm(city.name, searchQuery);
    
    const descMatches = matchesSearchTerm(city.description, searchQuery) || 
                        matchesSearchTerm(city.info, searchQuery);
    
    return nameMatches || descMatches;
  });

  const filteredSpots = useMemo(() => {
    if (!spots || !Array.isArray(spots)) return [];
    
    return spots.filter(spot => {
      if (!spot || typeof spot !== 'object') return false;
      
      // City filter
      if (cityFilter !== 'all' && spot.cityId !== cityFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && spot.type !== typeFilter) {
        return false;
      }
      
      // Search query filter
      if (searchQuery === '') return true;
      
      const nameMatches = spot.name && typeof spot.name === 'object' && 
        Object.values(spot.name).some(val => 
          typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const descMatches = spot.description && typeof spot.description === 'object' && 
        Object.values(spot.description).some(val => 
          typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      return nameMatches || descMatches;
    });
  }, [spots, searchQuery, typeFilter, cityFilter]);

  const filteredRoutes = routes.filter(route => {
    if (cityFilter !== 'all' && route.cityId !== cityFilter) {
      return false;
    }
    
    if (!searchQuery) return true;
    
    const nameMatches = matchesSearchTerm(route.name, searchQuery);
    
    const descMatches = matchesSearchTerm(route.description, searchQuery);
    
    return nameMatches || descMatches;
  });

  const filteredEvents = events.filter(event => {
    if (cityFilter !== 'all' && event.cityId !== cityFilter) {
      return false;
    }
    
    if (!searchQuery) return true;
    
    const nameMatches = matchesSearchTerm(event.name, searchQuery);
    
    const descMatches = matchesSearchTerm(event.description, searchQuery);
    
    return nameMatches || descMatches;
  });

  const cityOptions = cities.map(city => ({
    id: city.id,
    name: typeof city.name === 'object' ? (city.name[language] || city.name.en || '') : city.name
  }));

  const spotTypeOptions = [
    { id: 'temple', name: t('temple') || 'Temple' },
    { id: 'ashram', name: t('ashram') || 'Ashram' },
    { id: 'kund', name: t('kund') || 'Kund' },
    { id: 'other', name: t('other') || 'Other' }
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('searchComplete') || 'Search complete');
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
      all: filteredCities.length + filteredSpots.length + 
           filteredRoutes.length + filteredEvents.length,
      cities: filteredCities.length,
      points: filteredSpots.length,
      routes: filteredRoutes.length,
      events: filteredEvents.length
    };
  };
  
  const counts = getCounts();
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">{t('search')}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder') || "Search cities, temples, ashrams..."}
                  className="pl-10"
                />
              </div>
              <Button type="button" variant="outline" onClick={toggleFilters}>
                <Filter className="h-5 w-5" />
              </Button>
              <Button type="submit">
                {t('search')}
              </Button>
            </div>
            
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('city')}
                  </label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('allCities') || "All Cities"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allCities') || "All Cities"}</SelectItem>
                      {cityOptions.map(city => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('type')}
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('allTypes') || "All Types"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allTypes') || "All Types"}</SelectItem>
                      {spotTypeOptions.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse-gentle">{t('loading')}</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="p-0 border-b grid grid-cols-5">
                <TabsTrigger value="all" className="rounded-none px-4 py-3">
                  {t('all')} ({counts.all})
                </TabsTrigger>
                <TabsTrigger value="cities" className="rounded-none px-4 py-3 flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {t('cities')} ({counts.cities})
                </TabsTrigger>
                <TabsTrigger value="points" className="rounded-none px-4 py-3 flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {t('points')} ({counts.points})
                </TabsTrigger>
                <TabsTrigger value="routes" className="rounded-none px-4 py-3 flex items-center">
                  <NavigationIcon className="mr-1 h-4 w-4" />
                  {t('routes')} ({counts.routes})
                </TabsTrigger>
                <TabsTrigger value="events" className="rounded-none px-4 py-3 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {t('events')} ({counts.events})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-6">
                {counts.all > 0 ? (
                  <div className="space-y-8">
                    {counts.cities > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <MapPin className="mr-2 h-5 w-5" />
                          {t('cities')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredCities.map(city => (
                            <ItemCardWrapper
                              key={city.id}
                              id={city.id}
                              type="city"
                              name={city.name}
                              description={city.description}
                              thumbnail={city.thumbnail}
                              onClick={() => handleCityClick(city.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {counts.points > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <MapPin className="mr-2 h-5 w-5" />
                          {t('points')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredSpots.map(spot => (
                            <ItemCardWrapper
                              key={spot.id}
                              id={spot.id}
                              type="point"
                              name={spot.name}
                              description={spot.description}
                              thumbnail={spot.thumbnail}
                              onClick={() => handlePointClick(spot.id)}
                              spotType={spot.type}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {counts.routes > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <NavigationIcon className="mr-2 h-5 w-5" />
                          {t('routes')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredRoutes.map(route => (
                            <ItemCardWrapper
                              key={route.id}
                              id={route.id}
                              type="route"
                              name={route.name}
                              description={route.description}
                              thumbnail={route.thumbnail}
                              onClick={() => handleRouteClick(route.id)}
                              pointCount={route.pointIds?.length || 0}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {counts.events > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          {t('events')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredEvents.map(event => (
                            <ItemCardWrapper
                              key={event.id}
                              id={event.id}
                              type="event"
                              name={event.name}
                              description={event.description}
                              thumbnail={event.thumbnail}
                              onClick={() => handleEventClick(event.id)}
                              date={event.startDate}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-2">{t('noResultsFound')}</p>
                    <p className="text-sm">{t('tryAdjustingSearch')}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cities" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCities.length > 0 ? (
                    filteredCities.map(city => (
                      <ItemCardWrapper
                        key={city.id}
                        id={city.id}
                        type="city"
                        name={city.name}
                        description={city.description}
                        thumbnail={city.thumbnail}
                        onClick={() => handleCityClick(city.id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground mb-2">{t('noCitiesFound')}</p>
                      <p className="text-sm">{t('tryAdjustingSearch')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="points" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpots.length > 0 ? (
                    filteredSpots.map(spot => (
                      <ItemCardWrapper
                        key={spot.id}
                        id={spot.id}
                        type="point"
                        name={spot.name}
                        description={spot.description}
                        thumbnail={spot.thumbnail}
                        onClick={() => handlePointClick(spot.id)}
                        spotType={spot.type}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground mb-2">{t('noPointsFound')}</p>
                      <p className="text-sm">{t('tryAdjustingSearch')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="routes" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map(route => (
                      <ItemCardWrapper
                        key={route.id}
                        id={route.id}
                        type="route"
                        name={route.name}
                        description={route.description}
                        thumbnail={route.thumbnail}
                        onClick={() => handleRouteClick(route.id)}
                        pointCount={route.pointIds?.length || 0}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground mb-2">{t('noRoutesFound')}</p>
                      <p className="text-sm">{t('tryAdjustingSearch')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="events" className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <ItemCardWrapper
                        key={event.id}
                        id={event.id}
                        type="event"
                        name={event.name}
                        description={event.description}
                        thumbnail={event.thumbnail}
                        onClick={() => handleEventClick(event.id)}
                        date={event.startDate}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground mb-2">{t('noEventsFound')}</p>
                      <p className="text-sm">{t('tryAdjustingSearch')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;

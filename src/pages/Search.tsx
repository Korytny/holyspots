
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import ItemCard from '../components/ItemCard';
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
} from "@/components/ui/select";

import { City, Point, Route, Event } from '../types/models';

// Mock search results
const mockSearchResults = {
  cities: [
    {
      id: '1',
      name: {
        en: 'Varanasi',
        ru: 'Варанаси'
      },
      description: {
        en: 'One of the oldest continuously inhabited cities in the world and a major religious hub in India.',
        ru: 'Один из старейших постоянно населенных городов мира и крупный религиозный центр Индии.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1561361058-c24e01238a46?auto=format&fit=crop&w=600&h=400',
      location: 'Uttar Pradesh, India'
    },
    {
      id: '2',
      name: {
        en: 'Rishikesh',
        ru: 'Ришикеш'
      },
      description: {
        en: 'Known as the "Yoga Capital of the World", situated in the foothills of the Himalayas.',
        ru: 'Известен как "Мировая столица йоги", расположенная в предгорьях Гималаев.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1592385862434-b3246b5f3814?auto=format&fit=crop&w=600&h=400',
      location: 'Uttarakhand, India'
    }
  ],
  points: [
    {
      id: '1',
      name: {
        en: 'Kashi Vishwanath Temple',
        ru: 'Храм Каши Вишванатх'
      },
      description: {
        en: 'One of the most famous Hindu temples dedicated to Lord Shiva. It is one of the twelve Jyotirlingas, the holiest of Shiva temples.',
        ru: 'Один из самых известных индуистских храмов, посвященных Господу Шиве. Это один из двенадцати Джйотирлингамов, наиболее священных храмов Шивы.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1625125976244-8a1f64b12c43?auto=format&fit=crop&w=600&h=400',
      location: 'Varanasi, Uttar Pradesh'
    },
    {
      id: '3',
      name: {
        en: 'Parmarth Niketan',
        ru: 'Пармартх Никетан'
      },
      description: {
        en: 'One of the largest ashrams in Rishikesh, located on the banks of the Ganges River.',
        ru: 'Один из крупнейших ашрамов в Ришикеше, расположенный на берегу реки Ганг.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1573479957980-e482cf9a8a7e?auto=format&fit=crop&w=600&h=400',
      location: 'Rishikesh, Uttarakhand'
    }
  ],
  routes: [
    {
      id: '1',
      name: {
        en: 'Varanasi Temple Tour',
        ru: 'Тур по храмам Варанаси'
      },
      description: {
        en: 'A guided tour to the most significant temples in Varanasi, including Kashi Vishwanath and nearby ghats.',
        ru: 'Экскурсия по самым значимым храмам Варанаси, включая Каши Вишванатх и близлежащие гхаты.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1577644923446-a636be1d1d4d?auto=format&fit=crop&w=600&h=400',
      location: 'Varanasi, Uttar Pradesh',
      pointCount: 5
    }
  ],
  events: [
    {
      id: '1',
      name: {
        en: 'Ganga Aarti Ceremony',
        ru: 'Церемония Ганга Аарти'
      },
      description: {
        en: 'The spectacular Ganga Aarti is performed every evening at Dashashwamedh Ghat. It is an elaborate ritual using fire as an offering to Goddess Ganga.',
        ru: 'Впечатляющая церемония Ганга Аарти проводится каждый вечер на гхате Дашашвамедх. Это сложный ритуал с использованием огня в качестве подношения богине Ганге.'
      },
      thumbnail: 'https://images.unsplash.com/photo-1627894005990-9e32d9009759?auto=format&fit=crop&w=600&h=400',
      location: 'Varanasi, Uttar Pradesh',
      date: '2023-06-01'
    }
  ]
};

const Search = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // In a real app, this would come from the backend
  const [searchResults, setSearchResults] = useState<{
    cities: any[];
    points: any[];
    routes: any[];
    events: any[];
  }>(mockSearchResults);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call with searchQuery and filters
    console.log('Searching for:', searchQuery);
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
  
  // Get result count for each category
  const getCounts = () => {
    return {
      all: searchResults.cities.length + searchResults.points.length + 
           searchResults.routes.length + searchResults.events.length,
      cities: searchResults.cities.length,
      points: searchResults.points.length,
      routes: searchResults.routes.length,
      events: searchResults.events.length
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
                  placeholder="Search cities, temples, ashrams..."
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
                    City
                  </label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="varanasi">Varanasi</SelectItem>
                      <SelectItem value="rishikesh">Rishikesh</SelectItem>
                      <SelectItem value="vrindavan">Vrindavan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="temple">Temples</SelectItem>
                      <SelectItem value="ashram">Ashrams</SelectItem>
                      <SelectItem value="kund">Kunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="p-0 border-b grid grid-cols-5">
              <TabsTrigger value="all" className="rounded-none px-4 py-3">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="cities" className="rounded-none px-4 py-3 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Cities ({counts.cities})
              </TabsTrigger>
              <TabsTrigger value="points" className="rounded-none px-4 py-3 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                Points ({counts.points})
              </TabsTrigger>
              <TabsTrigger value="routes" className="rounded-none px-4 py-3 flex items-center">
                <NavigationIcon className="mr-1 h-4 w-4" />
                Routes ({counts.routes})
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-none px-4 py-3 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Events ({counts.events})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="p-6">
              {counts.all > 0 ? (
                <div className="space-y-8">
                  {counts.cities > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Cities
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.cities.map(city => (
                          <ItemCard
                            key={city.id}
                            id={city.id}
                            type="city"
                            name={city.name}
                            description={city.description}
                            thumbnail={city.thumbnail}
                            onClick={() => handleCityClick(city.id)}
                            location={city.location}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {counts.points > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        Points
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.points.map(point => (
                          <ItemCard
                            key={point.id}
                            id={point.id}
                            type="point"
                            name={point.name}
                            description={point.description}
                            thumbnail={point.thumbnail}
                            onClick={() => handlePointClick(point.id)}
                            location={point.location}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {counts.routes > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <NavigationIcon className="mr-2 h-5 w-5" />
                        Routes
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.routes.map(route => (
                          <ItemCard
                            key={route.id}
                            id={route.id}
                            type="route"
                            name={route.name}
                            description={route.description}
                            thumbnail={route.thumbnail}
                            onClick={() => handleRouteClick(route.id)}
                            location={route.location}
                            pointCount={route.pointCount}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {counts.events > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        Events
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.events.map(event => (
                          <ItemCard
                            key={event.id}
                            id={event.id}
                            type="event"
                            name={event.name}
                            description={event.description}
                            thumbnail={event.thumbnail}
                            onClick={() => handleEventClick(event.id)}
                            location={event.location}
                            date={event.date}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No results found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cities" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.cities.length > 0 ? (
                  searchResults.cities.map(city => (
                    <ItemCard
                      key={city.id}
                      id={city.id}
                      type="city"
                      name={city.name}
                      description={city.description}
                      thumbnail={city.thumbnail}
                      onClick={() => handleCityClick(city.id)}
                      location={city.location}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No cities found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="points" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.points.length > 0 ? (
                  searchResults.points.map(point => (
                    <ItemCard
                      key={point.id}
                      id={point.id}
                      type="point"
                      name={point.name}
                      description={point.description}
                      thumbnail={point.thumbnail}
                      onClick={() => handlePointClick(point.id)}
                      location={point.location}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No points found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="routes" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.routes.length > 0 ? (
                  searchResults.routes.map(route => (
                    <ItemCard
                      key={route.id}
                      id={route.id}
                      type="route"
                      name={route.name}
                      description={route.description}
                      thumbnail={route.thumbnail}
                      onClick={() => handleRouteClick(route.id)}
                      location={route.location}
                      pointCount={route.pointCount}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No routes found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.events.length > 0 ? (
                  searchResults.events.map(event => (
                    <ItemCard
                      key={event.id}
                      id={event.id}
                      type="event"
                      name={event.name}
                      description={event.description}
                      thumbnail={event.thumbnail}
                      onClick={() => handleEventClick(event.id)}
                      location={event.location}
                      date={event.date}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No events found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
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

export default Search;

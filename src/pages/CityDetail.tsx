
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import MediaGallery from '../components/MediaGallery';
import ItemCard from '../components/ItemCard';
import Map from '../components/Map';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation as NavigationIcon, 
  Calendar,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { City, Point, Route, Event } from '../types/models';

// Mock data for city details
const mockCity: City = {
  id: '1',
  name: {
    en: 'Varanasi',
    ru: 'Варанаси'
  },
  description: {
    en: 'Varanasi, also known as Benares or Kashi, is one of the oldest continuously inhabited cities in the world and a major religious hub in India. It is situated on the banks of the holy river Ganges and is considered sacred by Hindus, Buddhists, and Jains. The city is famous for its ghats, ancient temples, and spiritual atmosphere.',
    ru: 'Варанаси, также известный как Бенарес или Каши, является одним из старейших непрерывно населенных городов в мире и главным религиозным центром в Индии. Он расположен на берегу священной реки Ганг и считается священным местом для индуистов, буддистов и джайнов. Город известен своими гхатами, древними храмами и духовной атмосферой.'
  },
  media: [
    {
      id: 'v1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1561361058-c24e01238a46',
      title: 'Varanasi Ghats',
      description: 'View of the holy ghats along the Ganges river'
    },
    {
      id: 'v2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8',
      title: 'Evening Ceremony',
      description: 'The famous Ganga Aarti ceremony at Dashashwamedh Ghat'
    },
    {
      id: 'v3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1567942295400-8888228468be',
      title: 'Morning Rituals',
      description: 'Devotees performing morning rituals at the Ganges'
    }
  ],
  thumbnail: 'https://images.unsplash.com/photo-1561361058-c24e01238a46?auto=format&fit=crop&w=600&h=400',
  pointIds: ['1', '2'],
  routeIds: ['1'],
  eventIds: ['1'],
  location: {
    latitude: 25.3176,
    longitude: 82.9739
  }
};

// Mock points data
const mockPoints: Point[] = [
  {
    id: '1',
    cityId: '1',
    type: 'temple',
    name: {
      en: 'Kashi Vishwanath Temple',
      ru: 'Храм Каши Вишванатх'
    },
    description: {
      en: 'One of the most famous Hindu temples dedicated to Lord Shiva. It is one of the twelve Jyotirlingas, the holiest of Shiva temples.',
      ru: 'Один из самых известных индуистских храмов, посвященных Господу Шиве. Это один из двенадцати Джйотирлингамов, наиболее священных храмов Шивы.'
    },
    media: [
      {
        id: 'p1-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1625125976244-8a1f64b12c43',
        title: 'Kashi Vishwanath Temple',
        description: 'Main entrance to the temple'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1625125976244-8a1f64b12c43?auto=format&fit=crop&w=600&h=400',
    location: {
      latitude: 25.3109,
      longitude: 83.0107
    },
    routeIds: ['1'],
    eventIds: ['1']
  },
  {
    id: '2',
    cityId: '1',
    type: 'kund',
    name: {
      en: 'Dashashwamedh Ghat',
      ru: 'Гхат Дашашвамедх'
    },
    description: {
      en: 'The main and probably the most spectacular ghat in Varanasi. It is located close to Vishwanath Temple and is probably the most spectacular ghat.',
      ru: 'Главный и, вероятно, самый впечатляющий гхат в Варанаси. Он расположен недалеко от храма Вишванатх и является, вероятно, самым впечатляющим гхатом.'
    },
    media: [
      {
        id: 'p2-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1627894006066-b9323481beb9',
        title: 'Dashashwamedh Ghat',
        description: 'Evening ceremony at the ghat'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1627894006066-b9323481beb9?auto=format&fit=crop&w=600&h=400',
    location: {
      latitude: 25.3052,
      longitude: 83.0173
    },
    routeIds: ['1'],
    eventIds: []
  }
];

// Mock routes data
const mockRoutes: Route[] = [
  {
    id: '1',
    cityId: '1',
    name: {
      en: 'Varanasi Temple Tour',
      ru: 'Тур по храмам Варанаси'
    },
    description: {
      en: 'A guided tour to the most significant temples in Varanasi, including Kashi Vishwanath and nearby ghats.',
      ru: 'Экскурсия по самым значимым храмам Варанаси, включая Каши Вишванатх и близлежащие гхаты.'
    },
    media: [
      {
        id: 'r1-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1577644923446-a636be1d1d4d',
        title: 'Temple Route',
        description: 'Path through the old city'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1577644923446-a636be1d1d4d?auto=format&fit=crop&w=600&h=400',
    pointIds: ['1', '2'],
    eventIds: [],
    distance: 3.5,
    duration: 180
  }
];

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    cityId: '1',
    name: {
      en: 'Ganga Aarti Ceremony',
      ru: 'Церемония Ганга Аарти'
    },
    description: {
      en: 'The spectacular Ganga Aarti is performed every evening at Dashashwamedh Ghat. It is an elaborate ritual using fire as an offering to Goddess Ganga.',
      ru: 'Впечатляющая церемония Ганга Аарти проводится каждый вечер на гхате Дашашвамедх. Это сложный ритуал с использованием огня в качестве подношения богине Ганге.'
    },
    media: [
      {
        id: 'e1-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1627894005990-9e32d9009759',
        title: 'Ganga Aarti',
        description: 'Priests performing the ceremony'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1627894005990-9e32d9009759?auto=format&fit=crop&w=600&h=400',
    pointIds: ['2'],
    startDate: '2023-06-01T18:30:00',
    endDate: '2023-06-01T19:30:00',
    ownerId: 'user123'
  }
];

const CityDetail = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [city, setCity] = useState<City | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('points');
  const [showMap, setShowMap] = useState(false);
  
  // Fetch city data
  useEffect(() => {
    // In a real app, this would be an API call
    setIsLoading(true);
    
    setTimeout(() => {
      // Mock API response with city details
      if (cityId === '1') {
        setCity(mockCity);
        setPoints(mockPoints);
        setRoutes(mockRoutes);
        setEvents(mockEvents);
      }
      setIsLoading(false);
    }, 500);
  }, [cityId]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-gentle">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate('/cities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cities')}
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">City not found</h2>
          </div>
        </div>
      </div>
    );
  }
  
  const handlePointClick = (pointId: string) => {
    navigate(`/points/${pointId}`);
  };
  
  const handleRouteClick = (routeId: string) => {
    navigate(`/routes/${routeId}`);
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };
  
  const toggleMapView = () => {
    setShowMap(!showMap);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/cities')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('cities')}
        </Button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{city.name[language]}</h1>
            <p className="text-muted-foreground mb-6">{city.description[language]}</p>
            
            <MediaGallery media={city.media} />
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={toggleMapView}>
                {showMap ? t('hideMap') : t('viewOnMap')}
                <Eye className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            {showMap && (
              <div className="mt-4">
                <Map points={points} center={[city.location.longitude, city.location.latitude]} zoom={12} onPointSelect={handlePointClick} />
              </div>
            )}
            
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="points" className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {t('points')}
                  </TabsTrigger>
                  <TabsTrigger value="routes" className="flex items-center">
                    <NavigationIcon className="mr-1 h-4 w-4" />
                    {t('routes')}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('events')}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="points" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {points.length > 0 ? (
                      points.map(point => (
                        <ItemCard
                          key={point.id}
                          id={point.id}
                          type="point"
                          name={point.name}
                          description={point.description}
                          thumbnail={point.thumbnail}
                          onClick={() => handlePointClick(point.id)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No points available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="routes" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.length > 0 ? (
                      routes.map(route => (
                        <ItemCard
                          key={route.id}
                          id={route.id}
                          type="route"
                          name={route.name}
                          description={route.description}
                          thumbnail={route.thumbnail}
                          onClick={() => handleRouteClick(route.id)}
                          pointCount={route.pointIds.length}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No routes available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="events" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                      events.map(event => (
                        <ItemCard
                          key={event.id}
                          id={event.id}
                          type="event"
                          name={event.name}
                          description={event.description}
                          thumbnail={event.thumbnail}
                          onClick={() => handleEventClick(event.id)}
                          date={new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU')}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No events available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CityDetail;

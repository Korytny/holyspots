import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Heart, LogOut } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const Profile = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('cities');
  
  // Mock user data
  const user = {
    name: 'Alex Traveler',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120',
    favorites: {
      cities: [
        {
          id: '1',
          name: {
            en: 'Varanasi',
            ru: 'Варанаси'
          },
          description: {
            en: 'One of the oldest continuously inhabited cities in the world.',
            ru: 'Один из старейших постоянно населенных городов мира.'
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
            en: 'Known as the "Yoga Capital of the World".',
            ru: 'Известен как "Мировая столица йоги".'
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
            en: 'One of the most famous Hindu temples dedicated to Lord Shiva.',
            ru: 'Один из самых известных индуистских храмов, посвященных Господу Шиве.'
          },
          thumbnail: 'https://images.unsplash.com/photo-1625125976244-8a1f64b12c43?auto=format&fit=crop&w=600&h=400',
          location: 'Varanasi, Uttar Pradesh'
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
            en: 'A guided tour to the most significant temples in Varanasi.',
            ru: 'Экскурсия по самым значимым храмам Варанаси.'
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
            en: 'The spectacular Ganga Aarti is performed every evening at Dashashwamedh Ghat.',
            ru: 'Впечатляющая церемония Ганга Аарти проводится каждый вечер на гхате Дашашвамедх.'
          },
          thumbnail: 'https://images.unsplash.com/photo-1627894005990-9e32d9009759?auto=format&fit=crop&w=600&h=400',
          location: 'Varanasi, Uttar Pradesh',
          date: '2023-06-01'
        }
      ]
    }
  };
  
  const handleLogout = () => {
    console.log('User logged out');
    // In real app, would call auth context logout method and redirect to auth page
  };
  
  const getCounts = () => {
    return {
      cities: user.favorites.cities.length,
      points: user.favorites.points.length,
      routes: user.favorites.routes.length,
      events: user.favorites.events.length
    };
  };
  
  const counts = getCounts();
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                {user.favorites.cities.length > 0 ? (
                  user.favorites.cities.map(city => (
                    <ItemCard
                      key={city.id}
                      id={city.id}
                      type="city"
                      name={city.name}
                      description={city.description}
                      thumbnail={city.thumbnail}
                      location={city.location}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No favorite cities found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="points" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.favorites.points.length > 0 ? (
                  user.favorites.points.map(point => (
                    <ItemCard
                      key={point.id}
                      id={point.id}
                      type="point"
                      name={point.name}
                      description={point.description}
                      thumbnail={point.thumbnail}
                      location={point.location}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No favorite points found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="routes" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.favorites.routes.length > 0 ? (
                  user.favorites.routes.map(route => (
                    <ItemCard
                      key={route.id}
                      id={route.id}
                      type="route"
                      name={route.name}
                      description={route.description}
                      thumbnail={route.thumbnail}
                      location={route.location}
                      pointCount={route.pointCount}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No favorite routes found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.favorites.events.length > 0 ? (
                  user.favorites.events.map(event => (
                    <ItemCard
                      key={event.id}
                      id={event.id}
                      type="event"
                      name={event.name}
                      description={event.description}
                      thumbnail={event.thumbnail}
                      location={event.location}
                      date={event.date}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground mb-2">No favorite events found</p>
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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  Settings, 
  Heart, 
  Map,
  Calendar,
  Navigation as NavigationIcon,
  User as UserIcon
} from 'lucide-react';
import ItemCard from '../components/ItemCard';

// Mock favorites data (in a real app, this would come from the backend)
const mockFavorites = {
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
      thumbnail: 'https://images.unsplash.com/photo-1561361058-c24e01238a46?auto=format&fit=crop&w=600&h=400'
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
      thumbnail: 'https://images.unsplash.com/photo-1625125976244-8a1f64b12c43?auto=format&fit=crop&w=600&h=400'
    }
  ],
  routes: [],
  events: []
};

const Profile = () => {
  const { t } = useLanguage();
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="sacred-header p-6 text-center flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4 ring-4 ring-white">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <h1 className="text-xl font-semibold">{user?.name || 'User'}</h1>
            <p className="text-sm opacity-80">{user?.email}</p>
          </div>
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('profile')}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  {t('favorites')}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('settings')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{user?.name || 'Not provided'}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Account</h3>
                    <Button variant="destructive" onClick={handleSignOut} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('signOut')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Map className="mr-2 h-5 w-5" />
                      Favorite Cities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockFavorites.cities.length > 0 ? (
                        mockFavorites.cities.map(city => (
                          <ItemCard
                            key={city.id}
                            id={city.id}
                            type="city"
                            name={city.name}
                            description={city.description}
                            thumbnail={city.thumbnail}
                            onClick={() => handleCityClick(city.id)}
                            isFavorite={true}
                            onToggleFavorite={() => {/* Handle toggle */}}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 bg-muted rounded-lg">
                          <p className="text-muted-foreground">No favorite cities yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Favorite Points
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockFavorites.points.length > 0 ? (
                        mockFavorites.points.map(point => (
                          <ItemCard
                            key={point.id}
                            id={point.id}
                            type="point"
                            name={point.name}
                            description={point.description}
                            thumbnail={point.thumbnail}
                            onClick={() => handlePointClick(point.id)}
                            isFavorite={true}
                            onToggleFavorite={() => {/* Handle toggle */}}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 bg-muted rounded-lg">
                          <p className="text-muted-foreground">No favorite points yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <NavigationIcon className="mr-2 h-5 w-5" />
                      Favorite Routes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockFavorites.routes.length > 0 ? (
                        mockFavorites.routes.map(route => (
                          <ItemCard
                            key={route.id}
                            id={route.id}
                            type="route"
                            name={route.name}
                            description={route.description}
                            thumbnail={route.thumbnail}
                            onClick={() => handleRouteClick(route.id)}
                            isFavorite={true}
                            onToggleFavorite={() => {/* Handle toggle */}}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 bg-muted rounded-lg">
                          <p className="text-muted-foreground">No favorite routes yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Favorite Events
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockFavorites.events.length > 0 ? (
                        mockFavorites.events.map(event => (
                          <ItemCard
                            key={event.id}
                            id={event.id}
                            type="event"
                            name={event.name}
                            description={event.description}
                            thumbnail={event.thumbnail}
                            onClick={() => handleEventClick(event.id)}
                            isFavorite={true}
                            onToggleFavorite={() => {/* Handle toggle */}}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 bg-muted rounded-lg">
                          <p className="text-muted-foreground">No favorite events yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">App Settings</h3>
                    <p className="text-muted-foreground mb-4">Customize your app experience</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h4 className="font-medium mb-2">Language</h4>
                        <p className="text-sm text-muted-foreground mb-4">Select your preferred language</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">English</Button>
                          <Button variant="outline" size="sm">Русский</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h4 className="font-medium mb-2">Notifications</h4>
                        <p className="text-sm text-muted-foreground mb-4">Manage notification settings</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="events-notify" className="text-sm">Event notifications</label>
                            <input
                              id="events-notify"
                              type="checkbox"
                              className="h-4 w-4"
                              defaultChecked
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="updates-notify" className="text-sm">App updates</label>
                            <input
                              id="updates-notify"
                              type="checkbox"
                              className="h-4 w-4"
                              defaultChecked
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Privacy</h3>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Privacy Policy
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

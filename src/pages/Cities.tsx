
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import ItemCard from '../components/ItemCard';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation as NavigationIcon, Calendar } from 'lucide-react';
import { City } from '../types/models';
import { fetchCities } from '../services/citiesService';
import { useQuery } from '@tanstack/react-query';

const Cities = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Fetch cities from Supabase
  const { data: cities = [], isLoading, error } = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
  });
  
  // Filter cities based on search term
  const filteredCities = cities.filter(city => {
    // Get the city name safely
    const getCityName = () => {
      if (!city.name) return '';
      
      if (typeof city.name === 'object') {
        return city.name[language] || city.name.en || '';
      }
      
      return typeof city.name === 'string' ? city.name : '';
    };
    
    // Get the city description safely
    const getCityDescription = () => {
      if (!city.description) return '';
      
      if (typeof city.description === 'object') {
        return city.description[language] || city.description.en || '';
      }
      
      return typeof city.description === 'string' ? city.description : '';
    };
    
    const cityName = getCityName().toLowerCase();
    const cityDesc = getCityDescription().toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return cityName.includes(search) || cityDesc.includes(search);
  });
  
  const handleCityClick = (cityId: string) => {
    navigate(`/cities/${cityId}`);
  };
  
  const toggleFavorite = (cityId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(cityId)) {
        newFavorites.delete(cityId);
      } else {
        newFavorites.add(cityId);
      }
      return newFavorites;
    });
  };

  // Generate stats badge for city with white background and black text
  const renderCityStats = (city: City) => {
    return (
      <div className="flex flex-wrap gap-1">
        {city.pointIds?.length > 0 || city.spots_count ? (
          <div className="inline-flex items-center px-2 py-1 text-xs bg-white/90 text-black rounded-full shadow-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {city.spots_count || city.pointIds?.length || 0}
          </div>
        ) : null}
        
        {city.routeIds?.length > 0 || city.routes_count ? (
          <div className="inline-flex items-center px-2 py-1 text-xs bg-white/90 text-black rounded-full shadow-sm">
            <NavigationIcon className="h-3 w-3 mr-1" />
            {city.routes_count || city.routeIds?.length || 0}
          </div>
        ) : null}
        
        {city.eventIds?.length > 0 || city.events_count ? (
          <div className="inline-flex items-center px-2 py-1 text-xs bg-white/90 text-black rounded-full shadow-sm">
            <Calendar className="h-3 w-3 mr-1" />
            {city.events_count || city.eventIds?.length || 0}
          </div>
        ) : null}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">{t('cities')}</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="pl-10"
            placeholder={`${t('search')} ${t('cities').toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse-gentle">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading cities. Please try again.</p>
            <p className="text-sm mt-2">{(error as Error).message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => {
                // Get city name and description from the city object
                const cityName = city.name;
                const cityDesc = city.description || city.info || { en: 'No description available' };
                
                return (
                  <ItemCard
                    key={city.id}
                    id={city.id}
                    type="city"
                    name={cityName}
                    description={cityDesc}
                    thumbnail={city.thumbnail || '/placeholder.svg'}
                    onClick={() => handleCityClick(city.id)}
                    isFavorite={favorites.has(city.id)}
                    onToggleFavorite={() => toggleFavorite(city.id)}
                    extraContent={renderCityStats(city)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No cities found matching your search</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Cities;

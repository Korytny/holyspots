
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import ItemCard from '../components/ItemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
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
  const filteredCities = cities.filter(city => 
    city.name[language]?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    city.description[language]?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <ItemCard
                  key={city.id}
                  id={city.id}
                  type="city"
                  name={city.name}
                  description={city.description}
                  thumbnail={city.thumbnail}
                  onClick={() => handleCityClick(city.id)}
                  isFavorite={favorites.has(city.id)}
                  onToggleFavorite={() => toggleFavorite(city.id)}
                  pointCount={city.pointIds.length}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">{t('No cities found matching your search')}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Cities;

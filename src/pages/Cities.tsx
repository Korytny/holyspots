
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import ItemCard from '../components/ItemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { City } from '../types/models';

// Mock data for cities
const mockCities: City[] = [
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
    media: [
      {
        id: 'v1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1561361058-c24e01238a46',
        title: 'Varanasi Ghats',
        description: 'View of the holy ghats along the Ganges river'
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
    media: [
      {
        id: 'r1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1592385862434-b3246b5f3814',
        title: 'Ram Jhula',
        description: 'The iconic suspension bridge over the Ganges'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1592385862434-b3246b5f3814?auto=format&fit=crop&w=600&h=400',
    pointIds: ['3', '4'],
    routeIds: ['2'],
    eventIds: ['2'],
    location: {
      latitude: 30.0869,
      longitude: 78.2676
    }
  },
  {
    id: '3',
    name: {
      en: 'Vrindavan',
      ru: 'Вриндаван'
    },
    description: {
      en: 'A holy town associated with Lord Krishna and a place of pilgrimage for devotees.',
      ru: 'Священный город, связанный с Господом Кришной и место паломничества для верующих.'
    },
    media: [
      {
        id: 'vd1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1644104777233-9fb7b3eea88d',
        title: 'Krishna Temple',
        description: 'Temple dedicated to Lord Krishna'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1644104777233-9fb7b3eea88d?auto=format&fit=crop&w=600&h=400',
    pointIds: ['5', '6'],
    routeIds: ['3'],
    eventIds: ['3'],
    location: {
      latitude: 27.5795,
      longitude: 77.7032
    }
  },
  {
    id: '4',
    name: {
      en: 'Hampi',
      ru: 'Хампи'
    },
    description: {
      en: 'An ancient city with magnificent ruins of temples and monuments, a UNESCO World Heritage site.',
      ru: 'Древний город с величественными руинами храмов и памятников, объект Всемирного наследия ЮНЕСКО.'
    },
    media: [
      {
        id: 'h1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8',
        title: 'Virupaksha Temple',
        description: 'Ancient temple complex'
      }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=600&h=400',
    pointIds: ['7', '8'],
    routeIds: ['4'],
    eventIds: ['4'],
    location: {
      latitude: 15.3350,
      longitude: 76.4600
    }
  }
];

const Cities = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>(mockCities);
  const [filteredCities, setFilteredCities] = useState<City[]>(mockCities);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Filter cities based on search term
  useEffect(() => {
    const filtered = cities.filter(city => 
      city.name[language].toLowerCase().includes(searchTerm.toLowerCase()) || 
      city.description[language].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm, cities, language]);
  
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
      </main>
    </div>
  );
};

export default Cities;

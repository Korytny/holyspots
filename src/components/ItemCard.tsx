
import { Button } from '@/components/ui/button';
import { 
  MapPin,
  Calendar,
  Navigation,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type ItemType = 'city' | 'point' | 'route' | 'event';

interface ItemCardProps {
  id: string;
  type: ItemType;
  name: Record<string, string>;
  description: Record<string, string>;
  thumbnail: string;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  location?: string;
  date?: string;
  pointCount?: number;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  type,
  name,
  description,
  thumbnail,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  location,
  date,
  pointCount
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language, t } = useLanguage();

  // Determine icon based on type
  const getIcon = () => {
    switch (type) {
      case 'city': return <MapPin className="h-5 w-5" />;
      case 'point': return <MapPin className="h-5 w-5" />;
      case 'route': return <Navigation className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };
  
  return (
    <div 
      className="sacred-card card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-48">
        <img 
          src={thumbnail} 
          alt={name[language]} 
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? 'opacity-30' : 'opacity-0'}`}></div>
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full z-10"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-burgundy text-burgundy' : 'text-muted-foreground'}`} 
            />
          </Button>
        )}
        
        {/* Type indicator */}
        <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          {getIcon()}
          <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{name[language]}</h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description[language]}
        </p>
        
        <div className="flex flex-col gap-2">
          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          )}
          
          {date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
          )}
          
          {pointCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{pointCount} {pointCount === 1 ? 'point' : 'points'}</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-3 justify-between"
          onClick={onClick}
        >
          {t('details')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ItemCard;

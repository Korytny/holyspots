
import { 
  MapPin,
  Calendar,
  Navigation,
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

type ItemType = 'city' | 'point' | 'route' | 'event';

export interface ItemCardProps {
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
  extraContent?: React.ReactNode;
  spotType?: string; // Added for spot type display
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
  pointCount,
  extraContent,
  spotType
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { language } = useLanguage();

  // Safety check to ensure name and description are valid objects
  const displayName = name && typeof name === 'object' && name[language] 
    ? name[language] 
    : (name?.en || 'Unnamed Item');
    
  const displayDescription = description && typeof description === 'object' && description[language]
    ? description[language]
    : (description?.en || 'No description available');

  // Truncate description for display
  const truncatedDescription = displayDescription.length > 120
    ? displayDescription.substring(0, 120) + '...'
    : displayDescription;

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

  // Get spot type name for display
  const getSpotTypeName = (type: string): string => {
    switch (type) {
      case 'temple': return 'Храм';
      case 'ashram': return 'Ашрам';
      case 'kund': return 'Кунда';
      default: return 'Видовое место';
    }
  };

  // Get spot type badge color
  const getSpotTypeColor = (type: string): string => {
    switch (type) {
      case 'temple': return 'bg-purple-500';
      case 'ashram': return 'bg-orange-500';
      case 'kund': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  // Get spot type emoji
  const getSpotTypeEmoji = (type: string): string => {
    switch (type) {
      case 'temple': return '🏛️';
      case 'ashram': return '🧘';
      case 'kund': return '💦';
      default: return '🗻';
    }
  };

  // Fallback image if the thumbnail URL is invalid
  const defaultThumbnail = '/placeholder.svg';
  
  return (
    <div 
      className="sacred-card card-hover cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden h-48">
        <img 
          src={imageError ? defaultThumbnail : thumbnail} 
          alt={displayName} 
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={() => setImageError(true)}
        />
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? 'opacity-30' : 'opacity-0'}`}></div>
        
        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full z-10 p-2"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-burgundy text-burgundy' : 'text-muted-foreground'}`} 
            />
          </button>
        )}
        
        {/* Type indicator */}
        <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
          {getIcon()}
          <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>

        {/* Spot type badge for point items */}
        {type === 'point' && spotType && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 ${getSpotTypeColor(spotType)}`}>
            <span>{getSpotTypeEmoji(spotType)}</span>
            <span>{getSpotTypeName(spotType)}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2 line-clamp-1">{displayName}</h3>
        
        {/* Show description for city and point cards */}
        {(type === 'city' || type === 'point') && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{truncatedDescription}</p>
        )}
        
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
          
          {/* Render the extra content if provided */}
          {extraContent}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

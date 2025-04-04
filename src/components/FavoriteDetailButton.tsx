
import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteDetailButtonProps {
  itemId: string;
  itemType: 'city' | 'point' | 'route' | 'event';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const FavoriteDetailButton: React.FC<FavoriteDetailButtonProps> = ({
  itemId,
  itemType,
  size = 'default',
  className = ''
}) => {
  const { isAuthenticated, addFavorite, removeFavorite, isFavorite } = useAuth();
  const isFav = isFavorite(itemId, itemType);
  
  const handleToggleFavorite = () => {
    if (!isAuthenticated) return;
    
    if (isFav) {
      removeFavorite(itemId, itemType);
    } else {
      addFavorite(itemId, itemType);
    }
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isFav ? "secondary" : "outline"} 
            size={size}
            className={`${className} ${isFav ? 'bg-pink-100 hover:bg-pink-200 text-pink-700' : ''}`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-5 w-5 mr-2 ${isFav ? 'fill-current' : ''}`} />
            {isFav ? 'Saved to Favorites' : 'Add to Favorites'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFav ? 'Remove from favorites' : 'Add to favorites'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteDetailButton;

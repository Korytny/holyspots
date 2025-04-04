
import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'city' | 'point' | 'route' | 'event';
  variant?: 'default' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  variant = 'ghost',
  size = 'icon',
  className = ''
}) => {
  const { isAuthenticated, addFavorite, removeFavorite, isFavorite } = useAuth();
  const isFav = isFavorite(itemId, itemType);
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
            variant={variant}
            size={size}
            className={`${className} ${isFav ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={handleToggleFavorite}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFav ? 'Remove from favorites' : 'Add to favorites'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteButton;

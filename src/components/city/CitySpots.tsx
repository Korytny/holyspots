
import { useLanguage } from '../../contexts/LanguageContext';
import ItemCard from '../ItemCard';
import { Point } from '../../types/models';
import { MapPin } from 'lucide-react';

interface CitySpotProps {
  spots: Point[];
  isLoading: boolean;
  error: Error | null;
  selectedSpot: string | null;
  onSpotClick: (spotId: string) => void;
}

const CitySpots: React.FC<CitySpotProps> = ({ 
  spots, 
  isLoading, 
  error, 
  selectedSpot,
  onSpotClick 
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse-gentle">Loading spots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading spots: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {spots.length > 0 ? (
        spots.map(spot => (
          <ItemCard
            key={spot.id}
            id={spot.id}
            type="point"
            name={spot.name || { en: 'Unnamed Spot' }}
            description={spot.description || { en: 'No description available' }}
            thumbnail={spot.thumbnail || '/placeholder.svg'}
            onClick={() => onSpotClick(spot.id)}
            spotType={spot.type}
            extraContent={selectedSpot === spot.id ? (
              <div className="mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full inline-block">
                Selected
              </div>
            ) : null}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No spots available</p>
        </div>
      )}
    </div>
  );
};

export default CitySpots;

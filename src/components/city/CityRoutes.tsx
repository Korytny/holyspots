
import { useLanguage } from '../../contexts/LanguageContext';
import ItemCard from '../ItemCard';
import { Route } from '../../types/models';

interface CityRoutesProps {
  routes: Route[];
  isLoading: boolean;
  error: Error | null;
  onRouteClick: (routeId: string) => void;
}

const CityRoutes: React.FC<CityRoutesProps> = ({ 
  routes, 
  isLoading, 
  error, 
  onRouteClick 
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse-gentle">Loading routes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading routes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {routes.length > 0 ? (
        routes.map(route => (
          <ItemCard
            key={route.id}
            id={route.id}
            type="route"
            name={route.name || { en: 'Unnamed Route' }}
            description={route.description || { en: 'No description available' }}
            thumbnail={route.thumbnail || '/placeholder.svg'}
            onClick={() => onRouteClick(route.id)}
            pointCount={route.pointIds?.length || 0}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No routes available</p>
        </div>
      )}
    </div>
  );
};

export default CityRoutes;

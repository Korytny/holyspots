
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Point, Route, Event } from "../../types/models";
import { ChevronLeft, MapPin, Navigation, Calendar, ExternalLink } from "lucide-react";
import ItemCardWrapper from "../ItemCardWrapper";
import FavoriteDetailButton from "../FavoriteDetailButton";

interface SelectedSpotDetailsProps {
  selectedSpot: Point | null;
  spotRoutes: Route[];
  spotEvents: Event[];
  onClearSelectedSpot: () => void;
  onRouteClick: (routeId: string) => void;
  onEventClick: (eventId: string) => void;
  onViewSpotDetails?: (pointId: string) => void;
}

const SelectedSpotDetails: React.FC<SelectedSpotDetailsProps> = ({
  selectedSpot,
  spotRoutes,
  spotEvents,
  onClearSelectedSpot,
  onRouteClick,
  onEventClick,
  onViewSpotDetails
}) => {
  const { language, t } = useLanguage();

  if (!selectedSpot) return null;

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          {selectedSpot?.name?.[language] || selectedSpot?.name?.en || 'Selected Spot'}
        </h2>
        <div className="flex space-x-2">
          {onViewSpotDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewSpotDetails(selectedSpot.id)}
              className="flex items-center"
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              {t('viewDetails')}
            </Button>
          )}
          <FavoriteDetailButton 
            itemId={selectedSpot.id}
            itemType="point"
            size="sm"
          />
          <Button variant="ghost" size="sm" onClick={onClearSelectedSpot}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('back')}
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {selectedSpot?.description?.[language] || selectedSpot?.description?.en || 'No description available'}
      </p>
      
      {selectedSpot.images && selectedSpot.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedSpot.images.slice(0, 3).map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`${selectedSpot.name?.[language] || selectedSpot.name?.en} - ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      )}
      
      {spotRoutes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Navigation className="mr-2 h-4 w-4" />
            {t('relatedRoutes')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spotRoutes.map(route => (
              <ItemCardWrapper
                key={route.id}
                id={route.id}
                type="route"
                name={route.name || { en: 'Unnamed Route' }}
                description={route.description || { en: 'No description available' }}
                thumbnail={route.thumbnail || '/placeholder.svg'}
                onClick={() => onRouteClick(route.id)}
                pointCount={route.pointIds?.length || 0}
              />
            ))}
          </div>
        </div>
      )}
      
      {spotEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {t('relatedEvents')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spotEvents.map(event => (
              <ItemCardWrapper
                key={event.id}
                id={event.id}
                type="event"
                name={event.name || { en: 'Unnamed Event' }}
                description={event.description || { en: 'No description available' }}
                thumbnail={event.thumbnail || '/placeholder.svg'}
                onClick={() => onEventClick(event.id)}
                date={event.startDate ? new Date(event.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU') : undefined}
              />
            ))}
          </div>
        </div>
      )}
      
      {spotRoutes.length === 0 && spotEvents.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No related routes or events found for this spot</p>
        </div>
      )}
    </div>
  );
};

export default SelectedSpotDetails;

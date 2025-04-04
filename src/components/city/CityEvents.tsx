
import { useLanguage } from '../../contexts/LanguageContext';
import { Event } from '../../types/models';
import ItemCardWrapper from '../ItemCardWrapper';

interface CityEventsProps {
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  onEventClick: (eventId: string) => void;
}

const CityEvents: React.FC<CityEventsProps> = ({ 
  events, 
  isLoading, 
  error, 
  onEventClick 
}) => {
  const { language, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse-gentle">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.length > 0 ? (
        events.map(event => (
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
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No events available</p>
        </div>
      )}
    </div>
  );
};

export default CityEvents;

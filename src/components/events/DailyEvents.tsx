
import React from 'react';
import { Event } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface DailyEventsProps {
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  onEventClick?: (eventId: string) => void;
}

const DailyEvents = ({ events, isLoading, error, onEventClick }: DailyEventsProps) => {
  const { language, t } = useLanguage();
  
  const formatEventName = (event: Event): string => {
    if (!event.name) return 'Unnamed Event';
    
    if (typeof event.name === 'object') {
      return event.name[language] || event.name.en || 'Unnamed Event';
    }
    
    return String(event.name);
  };
  
  const formatEventDescription = (event: Event): string => {
    if (!event.description) return '';
    
    if (typeof event.description === 'object') {
      return event.description[language] || event.description.en || '';
    }
    
    return String(event.description);
  };
  
  // Filter only daily events (type = false)
  const dailyEvents = events.filter(event => event.type === false);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('dailyEvents')}</h2>
        <div className="animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-lg mb-2"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('dailyEvents')}</h2>
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          {error.message}
        </div>
      </div>
    );
  }
  
  if (dailyEvents.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('dailyEvents')}</h2>
        <div className="p-4 bg-muted text-muted-foreground rounded-lg text-center">
          {t('noEvents')}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        {t('dailyEvents')}
      </h2>
      
      <div className="space-y-2">
        {dailyEvents.map(event => (
          <Card 
            key={event.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventClick && onEventClick(event.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div 
                  className="w-16 h-16 rounded-md bg-cover bg-center mr-4 flex-shrink-0" 
                  style={{backgroundImage: `url(${event.thumbnail || '/placeholder.svg'})`}}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate">{formatEventName(event)}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {formatEventDescription(event)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyEvents;

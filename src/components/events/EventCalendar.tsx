
import React, { useState } from 'react';
import { Event } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { addMonths, format, isWithinInterval, parse, parseISO, startOfDay } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventCalendarProps {
  events: Event[];
  isLoading: boolean;
  error: Error | null;
  onEventClick?: (eventId: string) => void;
}

const EventCalendar = ({ events, isLoading, error, onEventClick }: EventCalendarProps) => {
  const { language, t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filter only calendar events (type = true)
  const calendarEvents = events.filter(event => event.type === true);
  
  // Get locale for date-fns
  const locale = language === 'ru' ? ru : enUS;
  
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
  
  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      if (!event.startDate) return false;
      
      try {
        const startDate = typeof event.startDate === 'string' 
          ? parseISO(event.startDate) 
          : new Date(event.startDate);
        
        const endDate = event.endDate 
          ? (typeof event.endDate === 'string' ? parseISO(event.endDate) : new Date(event.endDate))
          : startDate;
        
        const dateToCheck = startOfDay(date);
        
        return isWithinInterval(dateToCheck, {
          start: startOfDay(startDate),
          end: startOfDay(endDate)
        });
      } catch (e) {
        console.error('Error parsing date:', e);
        return false;
      }
    });
  };
  
  // Get days with events for highlighting in calendar
  const getDaysWithEvents = () => {
    const daysWithEvents: Date[] = [];
    
    calendarEvents.forEach(event => {
      if (!event.startDate) return;
      
      try {
        const startDate = typeof event.startDate === 'string' 
          ? parseISO(event.startDate) 
          : new Date(event.startDate);
        
        daysWithEvents.push(startOfDay(startDate));
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    });
    
    return daysWithEvents;
  };
  
  // Events for the selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('upcomingEvents')}</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-2"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('upcomingEvents')}</h2>
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          {error.message}
        </div>
      </div>
    );
  }
  
  // Calculate disabled days (past dates)
  const today = new Date();
  const disabledDays = { before: today };
  
  // Calculate month range (current month to one month ahead)
  const fromMonth = today;
  const toMonth = addMonths(today, 1);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('upcomingEvents')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={locale}
              fromMonth={fromMonth}
              toMonth={toMonth}
              modifiers={{
                hasEvent: getDaysWithEvents()
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  color: 'rgb(14, 165, 233)',
                  borderRadius: '0'
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">
              {selectedDate ? format(selectedDate, 'PPP', { locale }) : t('selectDate')}
            </h3>
            
            {selectedDateEvents.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {selectedDateEvents.map(event => (
                    <Card 
                      key={event.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onEventClick && onEventClick(event.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start">
                          <div 
                            className="w-12 h-12 rounded-md bg-cover bg-center mr-2 flex-shrink-0" 
                            style={{backgroundImage: `url(${event.thumbnail || '/placeholder.svg'})`}}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{formatEventName(event)}</h4>
                            <p className="text-muted-foreground text-xs line-clamp-1">
                              {formatEventDescription(event)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {selectedDate ? t('noEventsForDate') : t('selectDateToViewEvents')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCalendar;

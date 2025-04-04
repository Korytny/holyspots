import React, { createContext, useState, useContext, useEffect } from 'react';
import { Language } from '../types/models';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations - in a real app, would use a more comprehensive i18n solution
const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to Holy Wanderer',
    selectLanguage: 'Select Language',
    english: 'English',
    russian: 'Russian',
    hindi: 'Hindi',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    cities: 'Cities',
    search: 'Search',
    profile: 'Profile',
    favorites: 'Favorites',
    settings: 'Settings',
    signOut: 'Sign Out',
    temples: 'Temples',
    ashrams: 'Ashrams',
    kunds: 'Kunds',
    routes: 'Routes',
    events: 'Events',
    route: 'Route',
    event: 'Event',
    viewOnMap: 'View on Map',
    hideMap: 'Hide Map',
    details: 'Details',
    points: 'Points',
    spots: 'Spots',
    info: 'Info',
    back: 'Back',
    relatedRoutes: 'Related Routes',
    relatedEvents: 'Related Events',
    relatedSpots: 'Related Spots',
    relatedPoints: 'Related Points',
    type: 'Type',
    location: 'Location',
    latitude: 'Latitude',
    longitude: 'Longitude',
    distance: 'Distance',
    duration: 'Duration',
    minutes: 'minutes',
    eventDetails: 'Event Details',
    loading: 'Loading...',
    error: 'Error',
    eventNotFound: 'Event not found',
    errorFetchingEventData: 'Error fetching event data',
    noDateAvailable: 'No date available',
    city: 'City',
    noRelatedItems: 'No related items found for this event',
  },
  ru: {
    welcome: 'Добро пожаловать в Holy Wanderer',
    selectLanguage: 'Выберите язык',
    english: 'Английский',
    russian: 'Русский',
    hindi: 'Хинди',
    signIn: 'Вход',
    signUp: 'Регистрация',
    email: 'Электронная почта',
    password: 'Пароль',
    name: 'Имя',
    continueWithGoogle: 'Продолжить с Google',
    continueWithApple: 'Продолжить с Apple',
    cities: 'Города',
    search: 'Поиск',
    profile: 'Профиль',
    favorites: 'Избранное',
    settings: 'Настройки',
    signOut: 'Выход',
    temples: 'Храмы',
    ashrams: 'Ашрамы',
    kunds: 'Кунды',
    routes: 'Маршруты',
    events: 'Мероприятия',
    route: 'Маршрут',
    event: 'Мероприятие',
    viewOnMap: 'Посмотреть на карте',
    hideMap: 'Скрыть карту',
    details: 'Подробнее',
    points: 'Точки',
    spots: 'Точки',
    info: 'Информация',
    back: 'Назад',
    relatedRoutes: 'Связанные маршруты',
    relatedEvents: 'Связанные мероприятия',
    relatedSpots: 'Связанные точки',
    relatedPoints: 'Связанные точки',
    type: 'Тип',
    location: 'Местоположение',
    latitude: 'Широта',
    longitude: 'Долгота',
    distance: 'Расстояние',
    duration: 'Продолжительность',
    minutes: 'минут',
    eventDetails: 'Сведения о мероприятии',
    loading: 'Загрузка...',
    error: 'Ошибка',
    eventNotFound: 'Мероприятие не найдено',
    errorFetchingEventData: 'Ошибка при получении данных о мероприятии',
    noDateAvailable: 'Дата не указана',
    city: 'Город',
    noRelatedItems: 'Для этого мероприятия не найдено связанных элементов',
    relatedPoints: 'Связанные точки',
  },
  hi: {
    welcome: 'Holy Wanderer में आपका स्वागत है',
    selectLanguage: 'भाषा चुनें',
    english: 'अंग्रेज़ी',
    russian: 'रूसी',
    hindi: 'हिंदी',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    continueWithGoogle: 'Google के साथ जारी रखें',
    continueWithApple: 'Apple के साथ जारी रखें',
    cities: 'शहर',
    search: 'खोज',
    profile: 'प्रोफ़ाइल',
    favorites: '��संदीदा',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    temples: 'मंदिर',
    ashrams: 'आश्रम',
    kunds: 'कुंड',
    routes: 'मार्ग',
    events: 'कार्यक्रम',
    route: 'मार्ग',
    event: 'कार्यक्रम',
    viewOnMap: 'नक्शे पर देखें',
    hideMap: 'नक्शा छिपाएं',
    details: 'विवरण',
    points: 'स्थान',
    spots: 'स्थान',
    info: 'जानकारी',
    back: 'वापस',
    relatedRoutes: 'संबंधित मार्ग',
    relatedEvents: 'संबंधित कार्यक्रम',
    relatedSpots: 'संबंधित स्थान',
    relatedPoints: 'संबंधित स्थान',
    type: 'प्रकार',
    location: 'स्थान',
    latitude: 'अक्षांश',
    longitude: 'देशांतर',
    distance: 'दूरी',
    duration: 'अवधि',
    minutes: 'मिनट',
    eventDetails: 'कार्यक्रम विवरण',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    eventNotFound: 'कार्यक्रम नहीं मिला',
    errorFetchingEventData: 'कार्यक्रम डेटा प्राप्त करने में त्रुटि',
    noDateAvailable: 'कोई तारीख उपलब्ध नहीं है',
    city: 'शहर',
    noRelatedItems: 'इस कार्यक्रम के लिए कोई संबंधित आइटम नहीं मिले',
    relatedPoints: 'संबंधित स्थान',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('holyWandererLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru' || savedLanguage === 'hi')) {
      setLanguageState(savedLanguage as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('holyWandererLanguage', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchAvailableLanguages, DatabaseLanguage } from '../services/languageService';

// Types
type Language = 'en' | 'ru' | 'hi';

interface Translations {
  [key: string]: string;
}

export interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  supportedLanguages: Language[];
}

interface LanguageProviderProps {
  children: ReactNode;
}

const defaultTranslations: {[key in Language]: Translations} = {
  en: {
    welcome: 'Welcome',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    loading: 'Loading...',
    cities: 'Cities',
    search: 'Search',
    profile: 'Profile',
    city: 'City',
    pointsOfInterest: 'Points of Interest',
    routes: 'Routes',
    events: 'Events',
    favorites: 'Favorites',
    loggedInAs: 'Logged in as',
    noFavorites: 'You have no favorites yet',
    cityDetails: 'City Details',
    pointDetails: 'Point Details',
    routeDetails: 'Route Details',
    eventDetails: 'Event Details',
    noDateAvailable: 'No date available',
    relatedPoints: 'Related Points',
    relatedRoutes: 'Related Routes',
    relatedEvents: 'Related Events',
    noRelatedItems: 'No related items found',
    error: 'Error',
    cityNotFound: 'City not found',
    pointNotFound: 'Point not found',
    routeNotFound: 'Route not found',
    eventNotFound: 'Event not found',
    errorFetchingCityData: 'Error fetching city data',
    errorFetchingPointData: 'Error fetching point data',
    errorFetchingRouteData: 'Error fetching route data',
    errorFetchingEventData: 'Error fetching event data',
    unexpectedError: 'An unexpected error occurred',
    home: 'Home',
    language: 'Language',
    selectLanguage: 'Select Language',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    goToSignIn: 'Already have an account? Sign in',
    goToSignUp: 'Don\'t have an account? Sign up',
    notFound: 'Page Not Found',
    viewAllCities: 'View All Cities',
    seeAllPoints: 'See All Points',
    seeAllRoutes: 'See All Routes',
    seeAllEvents: 'See All Events',
    location: 'Location',
    duration: 'Duration',
    difficulty: 'Difficulty',
    signedOut: 'Signed Out',
    youHaveBeenSignedOut: 'You have been signed out successfully',
    failedToSignOut: 'Failed to sign out. Please try again',
    startDate: 'Start Date',
    endDate: 'End Date',
    dailyEvents: 'Daily Events',
    upcomingEvents: 'Upcoming Events',
    noEvents: 'No events available',
    selectDate: 'Select a date',
    noEventsForDate: 'No events for selected date',
    selectDateToViewEvents: 'Select a date to view events',
    back: 'Back'
  },
  ru: {
    welcome: 'Добро пожаловать',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    signOut: 'Выйти',
    email: 'Электронная почта',
    password: 'Пароль',
    name: 'Имя',
    loading: 'Загрузка...',
    cities: 'Города',
    search: 'Поиск',
    profile: 'Профиль',
    city: 'Город',
    pointsOfInterest: 'Достопримечательности',
    routes: 'Маршруты',
    events: 'События',
    favorites: 'Избранное',
    loggedInAs: 'Вы вошли как',
    noFavorites: 'У вас пока нет избранного',
    cityDetails: 'Информация о городе',
    pointDetails: 'Информация о достопримечательности',
    routeDetails: 'Информация о маршруте',
    eventDetails: 'Информация о событии',
    noDateAvailable: 'Дата не указана',
    relatedPoints: 'Связанные достопримечательности',
    relatedRoutes: 'Связанные маршруты',
    relatedEvents: 'Связанные события',
    noRelatedItems: 'Связанные элементы не найдены',
    error: 'Ошибка',
    cityNotFound: 'Город не найден',
    pointNotFound: 'Достопримечательность не найдена',
    routeNotFound: 'Маршрут не найден',
    eventNotFound: 'Событие не найдено',
    errorFetchingCityData: 'Ошибка при получении данных о городе',
    errorFetchingPointData: 'Ошибка при получении данных о достопримечательности',
    errorFetchingRouteData: 'Ошибка при получении данных о маршруте',
    errorFetchingEventData: 'Ошибка при получении данных о событии',
    unexpectedError: 'Произошла непредвиденная ошибка',
    home: 'Главная',
    language: 'Язык',
    selectLanguage: 'Выберите язык',
    or: 'или',
    continueWithGoogle: 'Продолжить с Google',
    goToSignIn: 'Уже есть аккаунт? Войти',
    goToSignUp: 'Нет аккаунта? Зарегистрироваться',
    notFound: 'Страница не найдена',
    viewAllCities: 'Просмотреть все города',
    seeAllPoints: 'Смотреть все достопримечательности',
    seeAllRoutes: 'Смотреть все маршруты',
    seeAllEvents: 'Смотреть все события',
    location: 'Местоположение',
    duration: 'Продолжительность',
    difficulty: 'Сложность',
    signedOut: 'Выход выполнен',
    youHaveBeenSignedOut: 'Вы успешно вышли из системы',
    failedToSignOut: 'Не удалось выйти. Пожалуйста, попробуйте еще раз',
    startDate: 'Дата начала',
    endDate: 'Дата окончания',
    dailyEvents: 'Ежедневные События',
    upcomingEvents: 'Предстоящие События',
    noEvents: 'Нет событий',
    selectDate: 'Выберите дату',
    noEventsForDate: 'Нет событий на выбранную дату',
    selectDateToViewEvents: 'Выберите дату для просмотра событий',
    back: 'Назад'
  },
  hi: {
    welcome: 'स्वागत',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    signOut: 'साइन आउट',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    loading: 'लोड हो रहा है...',
    cities: 'शहर',
    search: 'खोज',
    profile: 'प्रोफ़ाइल',
    city: 'शहर',
    pointsOfInterest: 'रुचि के स्थान',
    routes: 'मार्ग',
    events: 'आयोजन',
    favorites: 'पसंदीदा',
    loggedInAs: 'के रूप में लॉग इन किया गया',
    noFavorites: 'आपके पास अभी तक कोई पसंदीदा नहीं है',
    cityDetails: 'शहर विवरण',
    pointDetails: 'रुचि के स्थान का विवरण',
    routeDetails: 'मार्ग विवरण',
    eventDetails: 'आयोजन विवरण',
    noDateAvailable: 'कोई तारीख उपलब्ध नहीं',
    relatedPoints: 'संबंधित रुचि के स्थान',
    relatedRoutes: 'संबंधित मार्ग',
    relatedEvents: 'संबंधित आयोजन',
    noRelatedItems: 'कोई संबंधित आइटम नहीं मिला',
    error: 'त्रुटि',
    cityNotFound: 'शहर नहीं मिला',
    pointNotFound: 'रुचि का स्थान नहीं मिला',
    routeNotFound: 'मार्ग नहीं मिला',
    eventNotFound: 'आयोजन नहीं मिला',
    errorFetchingCityData: 'शहर डेटा प्राप्त करने में त्रुटि',
    errorFetchingPointData: 'रुचि के स्थान का डेटा प्राप्त करने में त्रुटि',
    errorFetchingRouteData: 'मार्ग डेटा प्राप्त करने में त्रुटि',
    errorFetchingEventData: 'आयोजन डेटा प्राप्त करने में त्रुटि',
    unexpectedError: 'एक अप्रत्याशित त्रुटि हुई',
    home: 'होम',
    language: 'भाषा',
    selectLanguage: 'भाषा का चयन करें',
    or: 'या',
    continueWithGoogle: 'गूगल के साथ जारी रखें',
    goToSignIn: 'पहले से ही एक खाता है? साइन इन करें',
    goToSignUp: 'खाता नहीं है? साइन अप करें',
    notFound: 'पृष्ठ नहीं मिला',
    viewAllCities: 'सभी शहरों को देखें',
    seeAllPoints: 'सभी रुचि के स्थानों को देखें',
    seeAllRoutes: 'सभी मार्गों को देखें',
    seeAllEvents: 'सभी आयोजनों को देखें',
    location: 'स्थान',
    duration: 'अवधि',
    difficulty: 'कठिनाई',
    signedOut: 'साइन आउट',
    youHaveBeenSignedOut: 'आप सफलतापूर्वक साइन आउट हो गए हैं',
    failedToSignOut: 'साइन आउट करने में विफल। कृपया पुन: प्रयास करें',
    startDate: 'शुरू करने की तारीख',
    endDate: 'अंतिम तिथि',
    dailyEvents: 'दैनिक घटनाएँ',
    upcomingEvents: 'आगामी घटनाएँ',
    noEvents: 'कोई घटनाएँ उपलब्ध नहीं हैं',
    selectDate: 'एक तिथि का चयन करें',
    noEventsForDate: 'चयनित तिथि के लिए कोई घटनाएँ नहीं हैं',
    selectDateToViewEvents: 'घटनाओं को देखने के लिए एक तिथि का चयन करें',
    back: 'वापस'
  }
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key: string) => key,
  setLanguage: () => {},
  supportedLanguages: ['en', 'ru', 'hi']
});

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
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
    return defaultTranslations[language][key] || key;
  };

  // Get supported languages
  const getSupportedLanguages = (): Language[] => {
    return ['en', 'ru', 'hi'];
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      t, 
      setLanguage, 
      supportedLanguages: getSupportedLanguages() 
    }}>
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

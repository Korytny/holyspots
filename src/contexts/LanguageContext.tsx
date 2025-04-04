
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchAvailableLanguages, DatabaseLanguage } from '../services/languageService';

export type Language = 'en' | 'ru' | 'hi';

interface Translations {
  [key: string]: string;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  supportedLanguages: Language[];
}

const defaultTranslations: {[key in Language]: Translations} = {
  en: {
    welcome: 'Welcome to Holy Wanderer',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    loading: 'Loading...',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    cities: 'Cities',
    search: 'Search',
    profile: 'Profile',
    signOut: 'Sign Out',
    selectLanguage: 'Select Language',
    loggedInAs: 'Logged in as',
    favorites: 'Favorites',
    noFavorites: 'No favorites yet',
    pointsOfInterest: 'Points of Interest',
    routes: 'Routes',
    events: 'Events',
    redirecting: 'Redirecting...',
    signedOut: 'Signed Out',
    youHaveBeenSignedOut: 'You have been signed out',
    error: 'Error',
    failedToSignOut: 'Failed to sign out'
  },
  ru: {
    welcome: 'Добро пожаловать в Holy Wanderer',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    email: 'Электронная почта',
    password: 'Пароль',
    name: 'Имя',
    loading: 'Загрузка...',
    continueWithGoogle: 'Продолжить с Google',
    or: 'или',
    cities: 'Города',
    search: 'Поиск',
    profile: 'Профиль',
    signOut: 'Выйти',
    selectLanguage: 'Выберите язык',
    loggedInAs: 'Вы вошли как',
    favorites: 'Избранное',
    noFavorites: 'Избранного пока нет',
    pointsOfInterest: 'Достопримечательности',
    routes: 'Маршруты',
    events: 'События',
    redirecting: 'Перенаправление...',
    signedOut: 'Вы вышли',
    youHaveBeenSignedOut: 'Вы успешно вышли из системы',
    error: 'Ошибка',
    failedToSignOut: 'Не удалось выйти из системы'
  },
  hi: {
    welcome: 'Holy Wanderer में आपका स्वागत है',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    loading: 'लोड हो रहा है...',
    continueWithGoogle: 'Google के साथ जारी रखें',
    or: 'या',
    cities: 'शहर',
    search: 'खोज',
    profile: 'प्रोफ़ाइल',
    signOut: 'साइन आउट',
    selectLanguage: 'भाषा चुनें',
    loggedInAs: 'इस रूप में लॉग इन',
    favorites: 'पसंदीदा',
    noFavorites: 'अभी तक कोई पसंदीदा नहीं',
    pointsOfInterest: 'आकर्षण',
    routes: 'मार्ग',
    events: 'कार्यक्रम',
    redirecting: 'पुनर्निर्देशित...',
    signedOut: 'साइन आउट किया गया',
    youHaveBeenSignedOut: 'आप साइन आउट कर दिए गए हैं',
    error: 'त्रुटि',
    failedToSignOut: 'साइन आउट करने में विफल'
  }
};

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>(['en', 'ru', 'hi']);
  
  useEffect(() => {
    // Load language from localStorage or set default
    const storedLanguage = localStorage.getItem('holyWandererLanguage');
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ru' || storedLanguage === 'hi')) {
      setLanguageState(storedLanguage);
    }
    
    // Load available languages from the database
    fetchAvailableLanguages().then(languages => {
      const langCodes = languages.map(lang => lang.code) as Language[];
      if (langCodes.length > 0) {
        setSupportedLanguages(langCodes);
      }
    }).catch(error => {
      console.error('Error loading languages:', error);
    });
  }, []);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('holyWandererLanguage', lang);
  };
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, supportedLanguages }}>
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

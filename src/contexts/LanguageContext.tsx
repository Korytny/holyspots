
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
    viewOnMap: 'View on Map',
    details: 'Details',
  },
  ru: {
    welcome: 'Добро пожаловать в Holy Wanderer',
    selectLanguage: 'Выберите язык',
    english: 'Английский',
    russian: 'Русский',
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
    viewOnMap: 'Посмотреть на карте',
    details: 'Подробнее',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('holyWandererLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
      setLanguageState(savedLanguage);
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

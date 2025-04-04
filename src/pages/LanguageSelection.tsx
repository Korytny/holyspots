
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageSelection = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If language is already set in localStorage, redirect to auth
    const savedLanguage = localStorage.getItem('holyWandererLanguage');
    if (savedLanguage) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLanguageSelect = (lang: 'en' | 'ru' | 'hi') => {
    setLanguage(lang);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-saffron to-burgundy">
      <div className="max-w-sm w-full mx-4 bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in">
        <div className="p-6 sacred-header text-center">
          <h1 className="text-2xl font-bold">{t('selectLanguage')}</h1>
        </div>
        
        <div className="p-6 space-y-4">
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            className="w-full text-lg py-6"
            onClick={() => handleLanguageSelect('en')}
          >
            English
          </Button>
          
          <Button
            variant={language === 'ru' ? 'default' : 'outline'}
            className="w-full text-lg py-6"
            onClick={() => handleLanguageSelect('ru')}
          >
            Русский
          </Button>
          
          <Button
            variant={language === 'hi' ? 'default' : 'outline'}
            className="w-full text-lg py-6"
            onClick={() => handleLanguageSelect('hi')}
          >
            हिन्दी
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

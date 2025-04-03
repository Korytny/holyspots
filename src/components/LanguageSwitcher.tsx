
import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchAvailableLanguages, DatabaseLanguage } from "../services/languageService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [languages, setLanguages] = useState<DatabaseLanguage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setIsLoading(true);
        const availableLanguages = await fetchAvailableLanguages();
        setLanguages(availableLanguages);
      } catch (error) {
        console.error("Failed to load languages:", error);
        // Fallback to hardcoded languages if database fetch fails
        setLanguages([
          { id: 1, code: 'en', name: 'English', created_at: '' },
          { id: 2, code: 'ru', name: 'Russian', created_at: '' },
          { id: 3, code: 'hi', name: 'Hindi', created_at: '' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === 'en' || langCode === 'ru' || langCode === 'hi') {
      setLanguage(langCode);
    }
  };

  // Find current language name
  const currentLanguageName = languages.find(lang => lang.code === language)?.name || 
    (language === 'en' ? 'English' : language === 'ru' ? 'Russian' : language === 'hi' ? 'Hindi' : 'Unknown');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : (
          languages.map((lang) => (
            <DropdownMenuItem
              key={lang.id}
              onClick={() => handleLanguageChange(lang.code)}
              className={language === lang.code ? "bg-secondary" : ""}
            >
              {lang.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

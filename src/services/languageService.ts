
import { supabase } from '../integrations/supabase/client';

export interface DatabaseLanguage {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export const fetchAvailableLanguages = async (): Promise<DatabaseLanguage[]> => {
  const { data, error } = await supabase
    .from('language')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching languages:', error);
    throw error;
  }
  
  return data || [];
};

// Helper function to get supported languages (used by LanguageContext)
export const getSupportedLanguages = (): string[] => {
  return ['en', 'ru', 'hi'];
};

// Helper function to get translations (placeholder for future use)
export const getTranslations = async (languageCode: string): Promise<Record<string, string>> => {
  // In a real implementation, this might fetch translations from a database or API
  return {};
};

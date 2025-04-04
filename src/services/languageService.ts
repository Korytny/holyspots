
import { supabase } from '../integrations/supabase/client';

export interface DatabaseLanguage {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export const fetchAvailableLanguages = async (): Promise<DatabaseLanguage[]> => {
  try {
    const { data, error } = await supabase
      .from('language')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    // Return default languages if database query fails
    return [
      { id: 1, code: 'en', name: 'English', created_at: '' },
      { id: 2, code: 'ru', name: 'Russian', created_at: '' },
      { id: 3, code: 'hi', name: 'Hindi', created_at: '' }
    ];
  }
};

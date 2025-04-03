
import { supabase } from '../lib/supabase';

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

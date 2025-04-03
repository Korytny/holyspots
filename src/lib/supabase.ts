
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://rxvckkqqunyqtxjyabub.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmNra3FxdW55cXR4anlhYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NzU1MzAsImV4cCI6MjAzNzQ1MTUzMH0.9DiNza2x0UEuGTAgtOz0StXW962pDF6S8b27_Igz6v4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rxvckkqqunyqtxjyabub.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmNra3FxdW55cXR4anlhYnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NzU1MzAsImV4cCI6MjAzNzQ1MTUzMH0.9DiNza2x0UEuGTAgtOz0StXW962pDF6S8b27_Igz6v4";

// Simple client without auth configuration
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);

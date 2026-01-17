
import { createClient } from '@supabase/supabase-js';

// Configuration réelle pour le projet UPG (ID: tlidmidccmqotuqmcydq)
const supabaseUrl = 'https://tlidmidccmqotuqmcydq.supabase.co';
// Clé fournie par l'utilisateur dans le prompt
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWRtaWRjY21xb3R1cW1jeWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMDc2MDcsImV4cCI6MjA1MDc4MzYwN30.e9-bdDQe8HwL-FT6RxZgKgN4dbBj6MvYqPSgWVJBWqY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Vérifie si le client est configuré avec des clés réelles.
 */
export const isSupabaseConfigured = () => {
  return (
    !supabaseUrl.includes('votre-projet') && 
    !supabaseAnonKey.includes('votre-cle')
  );
};

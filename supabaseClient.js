import { createClient } from "@supabase/supabase-js";

// Ces informations sont publiques par conception (clé "anon")
// et peuvent être visibles dans le code envoyé au navigateur.
const SUPABASE_URL = "https://epxiadhfexemtcbifxse.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweGlhZGhmZXhlbXRjYmlmeHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTA3NjYsImV4cCI6MjA5NjkyNjc2Nn0.NkX1BeXcQl6wlY9NoCogzsPQRH8pFIqeHDTXg_lomDc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

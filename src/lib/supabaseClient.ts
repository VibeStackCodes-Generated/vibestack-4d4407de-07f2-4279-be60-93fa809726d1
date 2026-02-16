import type { Database } from "@/lib/dbTypes"
import { type SupabaseClient, createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://xniyqipanlelneyigrbn.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaXlxaXBhbmxlbG5leWlncmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDIzNDYsImV4cCI6MjA4Njc3ODM0Nn0.fd6asVTdohxA8Rc9QlqMURYEpb86DTmNp4PIXBc6_fs"

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

import type { Database } from "@/lib/dbTypes";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

// Fallback constants (useful for local/dev when env vars are not injected)
// NOTE: Replace with your project values if needed.
export const SUPABASE_URL_FALLBACK =
	"https://YOUR_SUPABASE_PROJECT.supabase.co";
export const SUPABASE_ANON_KEY_FALLBACK = "YOUR_SUPABASE_ANON_KEY";

function getEnv(name: string): string | undefined {
	// Vite exposes env vars on import.meta.env
	const env = import.meta.env as Record<string, unknown>;
	const v = env[name];
	return typeof v === "string" && v.length > 0 ? v : undefined;
}

const supabaseUrl =
	getEnv("VITE_SUPABASE_URL") ??
	getEnv("SUPABASE_URL") ??
	SUPABASE_URL_FALLBACK;

const supabaseAnonKey =
	getEnv("VITE_SUPABASE_ANON_KEY") ??
	getEnv("SUPABASE_ANON_KEY") ??
	SUPABASE_ANON_KEY_FALLBACK;

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
);

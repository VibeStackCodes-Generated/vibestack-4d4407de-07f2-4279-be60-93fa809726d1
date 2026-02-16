import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// NOTE: This project slice assumes a typed Supabase client exists at this path.
// If your app places it elsewhere, update the import here (exclusive ownership file).
import { supabase } from "@/lib/supabase";

type SessionState = {
	session: Session | null;
	user: User | null;
	loading: boolean;
};

export function useSession(): SessionState {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;

		const load = async () => {
			try {
				const { data, error } = await supabase.auth.getSession();
				if (error) throw error;
				if (!mounted) return;
				setSession(data.session);
				setUser(data.session?.user ?? null);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		void load();

		const { data: sub } = supabase.auth.onAuthStateChange(
			(_event, nextSession) => {
				if (!mounted) return;
				setSession(nextSession);
				setUser(nextSession?.user ?? null);
				setLoading(false);
			},
		);

		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);

	return { session, user, loading };
}

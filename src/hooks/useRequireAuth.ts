import { useSession } from "@/hooks/useSession";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export type RequireAuthOptions = {
	/** Defaults to '/login' */
	to?: string;
	/** Replace history entry. Defaults to true. */
	replace?: boolean;
	/** If true, does nothing (useful for public pages). */
	disabled?: boolean;
};

/**
 * Redirect unauthenticated users to /login.
 *
 * Usage: call inside a route component.
 * Returns the same session state for convenience.
 */
export function useRequireAuth(options?: RequireAuthOptions) {
	const { to = "/login", replace = true, disabled = false } = options ?? {};
	const navigate = useNavigate();
	const sessionState = useSession();

	useEffect(() => {
		if (disabled) return;
		if (sessionState.loading) return;

		if (!sessionState.user) {
			void navigate({ to, replace });
		}
	}, [
		disabled,
		navigate,
		replace,
		sessionState.loading,
		sessionState.user,
		to,
	]);

	return sessionState;
}

/** Helper for route loaders/actions where hooks can't be used. */
export function requireAuthOrRedirect(args: {
	user: unknown;
	to?: string;
}): void {
	const to = args.to ?? "/login";
	if (!args.user) {
		// TanStack Router supports throwing a redirect from loaders/actions.
		// We keep this tiny and dependency-free.
		const err = new Error("REDIRECT") as Error & { to?: string };
		err.to = to;
		throw err;
	}
}

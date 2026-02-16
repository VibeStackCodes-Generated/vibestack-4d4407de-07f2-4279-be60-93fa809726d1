import { useEffect, useMemo, useState } from "react";

// Wrap the app's data functions. This file intentionally stays thin.
import * as bookmarksApi from "@/lib/bookmarks";

// Prefer TanStack Query if present. (The app uses it, but keep a safe fallback.)
let rq: typeof import("@tanstack/react-query") | null = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	rq = require("@tanstack/react-query");
} catch {
	rq = null;
}

type Awaited<T> = T extends Promise<infer U> ? U : T;

type ListBookmarks = Awaited<ReturnType<typeof bookmarksApi.listBookmarks>>;
type CreateBookmarkInput = Parameters<typeof bookmarksApi.createBookmark>[0];
type UpdateBookmarkInput = Parameters<typeof bookmarksApi.updateBookmark>[0];
type DeleteBookmarkInput = Parameters<typeof bookmarksApi.deleteBookmark>[0];
type ToggleStarInput = Parameters<typeof bookmarksApi.toggleStar>[0];

const keys = {
	all: ["bookmarks"] as const,
	list: (params?: unknown) => ["bookmarks", "list", params ?? null] as const,
};

export function useBookmarks(params?: unknown) {
	if (rq) {
		const { useQuery } = rq;
		return useQuery({
			queryKey: keys.list(params),
			queryFn: async () => bookmarksApi.listBookmarks(params as never),
		});
	}

	const [data, setData] = useState<ListBookmarks | null>(null);
	const [error, setError] = useState<unknown>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);
		setError(null);

		bookmarksApi
			.listBookmarks(params as never)
			.then((res) => {
				if (!mounted) return;
				setData(res as ListBookmarks);
			})
			.catch((e: unknown) => {
				if (!mounted) return;
				setError(e);
			})
			.finally(() => {
				if (!mounted) return;
				setIsLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, [params]);

	return { data, error, isLoading };
}

export function useBookmarkMutations(paramsForInvalidation?: unknown) {
	const queryKey = useMemo(
		() => keys.list(paramsForInvalidation),
		[paramsForInvalidation],
	);

	if (rq) {
		const { useMutation, useQueryClient } = rq;
		const qc = useQueryClient();

		const invalidate = async () => {
			await qc.invalidateQueries({ queryKey });
		};

		const create = useMutation({
			mutationFn: async (input: CreateBookmarkInput) =>
				bookmarksApi.createBookmark(input),
			onSuccess: invalidate,
		});

		const update = useMutation({
			mutationFn: async (input: UpdateBookmarkInput) =>
				bookmarksApi.updateBookmark(input),
			onSuccess: invalidate,
		});

		const remove = useMutation({
			mutationFn: async (input: DeleteBookmarkInput) =>
				bookmarksApi.deleteBookmark(input),
			onSuccess: invalidate,
		});

		const toggleStar = useMutation({
			mutationFn: async (input: ToggleStarInput) =>
				bookmarksApi.toggleStar(input),
			onSuccess: invalidate,
		});

		return { create, update, delete: remove, toggleStar };
	}

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const wrap = <TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) => {
		return async (args: TArgs) => {
			setLoading(true);
			setError(null);
			try {
				return await fn(args);
			} catch (e: unknown) {
				setError(e);
				throw e;
			} finally {
				setLoading(false);
			}
		};
	};

	return {
		create: {
			mutateAsync: wrap(bookmarksApi.createBookmark),
			isPending: loading,
			error,
		},
		update: {
			mutateAsync: wrap(bookmarksApi.updateBookmark),
			isPending: loading,
			error,
		},
		delete: {
			mutateAsync: wrap(bookmarksApi.deleteBookmark),
			isPending: loading,
			error,
		},
		toggleStar: {
			mutateAsync: wrap(bookmarksApi.toggleStar),
			isPending: loading,
			error,
		},
	};
}

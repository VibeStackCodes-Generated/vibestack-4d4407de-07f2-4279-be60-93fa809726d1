import { useEffect, useMemo, useState } from "react";

import * as tagsApi from "@/lib/tags";

let rq: typeof import("@tanstack/react-query") | null = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	rq = require("@tanstack/react-query");
} catch {
	rq = null;
}

type Awaited<T> = T extends Promise<infer U> ? U : T;

type ListTags = Awaited<ReturnType<typeof tagsApi.listTags>>;
type CreateTagInput = Parameters<typeof tagsApi.createTag>[0];
type UpdateTagInput = Parameters<typeof tagsApi.updateTag>[0];
type DeleteTagInput = Parameters<typeof tagsApi.deleteTag>[0];

type AddBookmarkTagInput = Parameters<typeof tagsApi.addBookmarkTag>[0];
type RemoveBookmarkTagInput = Parameters<typeof tagsApi.removeBookmarkTag>[0];

type ListBookmarkTagsInput = Parameters<typeof tagsApi.listBookmarkTags>[0];
type ListBookmarkTags = Awaited<ReturnType<typeof tagsApi.listBookmarkTags>>;

const keys = {
	tags: ["tags"] as const,
	tagsList: (params?: unknown) => ["tags", "list", params ?? null] as const,
	bookmarkTags: (bookmarkId: string) =>
		["bookmark_tags", "by_bookmark", bookmarkId] as const,
};

export function useTags(params?: unknown) {
	if (rq) {
		const { useQuery } = rq;
		return useQuery({
			queryKey: keys.tagsList(params),
			queryFn: async () => tagsApi.listTags(params as never),
		});
	}

	const [data, setData] = useState<ListTags | null>(null);
	const [error, setError] = useState<unknown>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);
		setError(null);

		tagsApi
			.listTags(params as never)
			.then((res) => {
				if (!mounted) return;
				setData(res as ListTags);
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

export function useBookmarkTags(input: ListBookmarkTagsInput) {
	const bookmarkId = (input as { bookmarkId?: string }).bookmarkId;
	if (!bookmarkId) {
		return {
			data: null as ListBookmarkTags | null,
			error: null as unknown,
			isLoading: false,
		};
	}

	if (rq) {
		const { useQuery } = rq;
		return useQuery({
			queryKey: keys.bookmarkTags(bookmarkId),
			queryFn: async () => tagsApi.listBookmarkTags(input),
		});
	}

	const [data, setData] = useState<ListBookmarkTags | null>(null);
	const [error, setError] = useState<unknown>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		let mounted = true;
		setIsLoading(true);
		setError(null);

		tagsApi
			.listBookmarkTags(input)
			.then((res) => {
				if (!mounted) return;
				setData(res as ListBookmarkTags);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bookmarkId]);

	return { data, error, isLoading };
}

export function useTagMutations(paramsForInvalidation?: unknown) {
	const tagsListKey = useMemo(
		() => keys.tagsList(paramsForInvalidation),
		[paramsForInvalidation],
	);

	if (rq) {
		const { useMutation, useQueryClient } = rq;
		const qc = useQueryClient();

		const invalidateTags = async () => {
			await qc.invalidateQueries({ queryKey: tagsListKey });
			await qc.invalidateQueries({ queryKey: keys.tags });
		};

		const create = useMutation({
			mutationFn: async (input: CreateTagInput) => tagsApi.createTag(input),
			onSuccess: invalidateTags,
		});

		const update = useMutation({
			mutationFn: async (input: UpdateTagInput) => tagsApi.updateTag(input),
			onSuccess: invalidateTags,
		});

		const remove = useMutation({
			mutationFn: async (input: DeleteTagInput) => tagsApi.deleteTag(input),
			onSuccess: invalidateTags,
		});

		return { create, update, delete: remove };
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
		create: { mutateAsync: wrap(tagsApi.createTag), isPending: loading, error },
		update: { mutateAsync: wrap(tagsApi.updateTag), isPending: loading, error },
		delete: { mutateAsync: wrap(tagsApi.deleteTag), isPending: loading, error },
	};
}

export function useBookmarkTagMutations(bookmarkId: string) {
	const bookmarkKey = useMemo(
		() => keys.bookmarkTags(bookmarkId),
		[bookmarkId],
	);

	if (rq) {
		const { useMutation, useQueryClient } = rq;
		const qc = useQueryClient();

		const invalidate = async () => {
			await qc.invalidateQueries({ queryKey: bookmarkKey });
		};

		const add = useMutation({
			mutationFn: async (input: AddBookmarkTagInput) =>
				tagsApi.addBookmarkTag(input),
			onSuccess: invalidate,
		});

		const remove = useMutation({
			mutationFn: async (input: RemoveBookmarkTagInput) =>
				tagsApi.removeBookmarkTag(input),
			onSuccess: invalidate,
		});

		return { add, remove };
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
		add: {
			mutateAsync: wrap(tagsApi.addBookmarkTag),
			isPending: loading,
			error,
		},
		remove: {
			mutateAsync: wrap(tagsApi.removeBookmarkTag),
			isPending: loading,
			error,
		},
	};
}

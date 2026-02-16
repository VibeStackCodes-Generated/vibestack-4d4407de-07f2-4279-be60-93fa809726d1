import { replaceTags } from "@/lib/bookmarkTags";
import type { Database } from "@/lib/dbTypes";
import { supabase } from "@/lib/supabaseClient";

export type Bookmark = Database["public"]["Tables"]["bookmark"]["Row"];
export type BookmarkInsert = Database["public"]["Tables"]["bookmark"]["Insert"];
export type BookmarkUpdate = Database["public"]["Tables"]["bookmark"]["Update"];

export type Tag = Database["public"]["Tables"]["tag"]["Row"];

type BookmarkJoinRow = Database["public"]["Tables"]["bookmark_tag"]["Row"];

type BookmarkRowWithJoin = Bookmark & {
	bookmark_tag: Array<
		BookmarkJoinRow & {
			tag: Tag | null;
		}
	>;
};

export type BookmarkWithTags = Bookmark & { tags: Tag[] };

function mapBookmarkWithTags(row: BookmarkRowWithJoin): BookmarkWithTags {
	const tags = (row.bookmark_tag ?? [])
		.map((jt) => jt.tag)
		.filter((t): t is Tag => t !== null);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { bookmark_tag, ...bookmark } = row;
	return { ...bookmark, tags };
}

export async function listBookmarks(params?: {
	query?: string;
	starred?: boolean;
	tagId?: string;
	limit?: number;
	offset?: number;
}): Promise<BookmarkWithTags[]> {
	const { query, starred, tagId, limit = 50, offset = 0 } = params ?? {};

	let q = supabase
		.from("bookmark")
		.select("*, bookmark_tag(*, tag(*))")
		.order("updated_at", { ascending: false })
		.range(offset, offset + Math.max(limit, 1) - 1);

	if (typeof starred === "boolean") {
		q = q.eq("is_starred", starred);
	}

	if (query && query.trim().length > 0) {
		const term = query.trim().replace(/,/g, "");
		// Search across title + url + description
		q = q.or(
			`title.ilike.%${term}%,url.ilike.%${term}%,description.ilike.%${term}%`,
		);
	}

	if (tagId) {
		// Filter bookmarks that have a join row for the tag
		q = q.eq("bookmark_tag.tag_id", tagId);
	}

	const { data, error } = await q;
	if (error) throw error;

	const rows = (data ?? []) as unknown as BookmarkRowWithJoin[];
	return rows.map(mapBookmarkWithTags);
}

export async function fetchBookmark(
	bookmarkId: string,
): Promise<BookmarkWithTags> {
	const { data, error } = await supabase
		.from("bookmark")
		.select("*, bookmark_tag(*, tag(*))")
		.eq("id", bookmarkId)
		.single();

	if (error) throw error;

	const row = data as unknown as BookmarkRowWithJoin;
	return mapBookmarkWithTags(row);
}

export async function createBookmark(params: {
	url: string;
	title: string;
	description?: string;
	is_starred?: boolean;
	tagIds?: string[];
	userId?: string;
}): Promise<BookmarkWithTags> {
	const { tagIds, userId, ...rest } = params;

	const insertRow: BookmarkInsert = {
		url: rest.url,
		title: rest.title,
		description: rest.description ?? null,
		...(typeof rest.is_starred === "boolean"
			? { is_starred: rest.is_starred }
			: {}),
		...(userId ? { user_id: userId } : {}),
	};

	const { data, error } = await supabase
		.from("bookmark")
		.insert(insertRow)
		.select("*")
		.single();

	if (error) throw error;

	const created = data;

	if (tagIds && tagIds.length > 0) {
		await replaceTags({ bookmarkId: created.id, tagIds, userId });
	}

	return await fetchBookmark(created.id);
}

export async function updateBookmark(params: {
	bookmarkId: string;
	patch: BookmarkUpdate;
	tagIds?: string[];
	userId?: string;
}): Promise<BookmarkWithTags> {
	const { bookmarkId, patch, tagIds, userId } = params;

	const { error } = await supabase
		.from("bookmark")
		.update(patch)
		.eq("id", bookmarkId);
	if (error) throw error;

	if (tagIds) {
		await replaceTags({ bookmarkId, tagIds, userId });
	}

	return await fetchBookmark(bookmarkId);
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
	const { error } = await supabase
		.from("bookmark")
		.delete()
		.eq("id", bookmarkId);
	if (error) throw error;
}

export async function toggleStar(
	bookmarkId: string,
): Promise<BookmarkWithTags> {
	const current = await fetchBookmark(bookmarkId);

	const { error } = await supabase
		.from("bookmark")
		.update({ is_starred: !current.is_starred })
		.eq("id", bookmarkId);

	if (error) throw error;
	return await fetchBookmark(bookmarkId);
}

import type { Database } from "@/lib/dbTypes";
import { supabase } from "@/lib/supabaseClient";

export type BookmarkTagRow =
	Database["public"]["Tables"]["bookmark_tag"]["Row"];
export type BookmarkTagInsert =
	Database["public"]["Tables"]["bookmark_tag"]["Insert"];

export async function attachTagToBookmark(params: {
	bookmarkId: string;
	tagId: string;
	userId?: string;
}): Promise<BookmarkTagRow> {
	const { bookmarkId, tagId, userId } = params;

	const insertRow: BookmarkTagInsert = {
		bookmark_id: bookmarkId,
		tag_id: tagId,
		...(userId ? { user_id: userId } : {}),
	};

	const { data, error } = await supabase
		.from("bookmark_tag")
		.insert(insertRow)
		.select("*")
		.single();

	if (error) throw error;
	return data;
}

export async function detachTagFromBookmark(params: {
	bookmarkId: string;
	tagId: string;
}): Promise<void> {
	const { bookmarkId, tagId } = params;

	const { error } = await supabase
		.from("bookmark_tag")
		.delete()
		.eq("bookmark_id", bookmarkId)
		.eq("tag_id", tagId);

	if (error) throw error;
}

/**
 * Replace all tags for a bookmark with the provided list.
 * This is done as: delete all joins for bookmark -> insert desired joins.
 */
export async function replaceTags(params: {
	bookmarkId: string;
	tagIds: string[];
	userId?: string;
}): Promise<void> {
	const { bookmarkId, tagIds, userId } = params;

	const { error: delError } = await supabase
		.from("bookmark_tag")
		.delete()
		.eq("bookmark_id", bookmarkId);

	if (delError) throw delError;

	if (tagIds.length === 0) return;

	const rows: BookmarkTagInsert[] = tagIds.map((tagId) => ({
		bookmark_id: bookmarkId,
		tag_id: tagId,
		...(userId ? { user_id: userId } : {}),
	}));

	const { error: insError } = await supabase.from("bookmark_tag").insert(rows);
	if (insError) throw insError;
}

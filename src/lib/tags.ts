import type { Database } from "@/lib/dbTypes";
import { supabase } from "@/lib/supabaseClient";

export type Tag = Database["public"]["Tables"]["tag"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tag"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tag"]["Update"];

export async function listTags(): Promise<Tag[]> {
	const { data, error } = await supabase
		.from("tag")
		.select("*")
		.order("name", { ascending: true });

	if (error) throw error;
	return data ?? [];
}

export async function fetchTag(tagId: string): Promise<Tag> {
	const { data, error } = await supabase
		.from("tag")
		.select("*")
		.eq("id", tagId)
		.single();

	if (error) throw error;
	return data;
}

export async function createTag(params: {
	name: string;
	userId?: string;
}): Promise<Tag> {
	const insertRow: TagInsert = {
		name: params.name,
		...(params.userId ? { user_id: params.userId } : {}),
	};

	const { data, error } = await supabase
		.from("tag")
		.insert(insertRow)
		.select("*")
		.single();

	if (error) throw error;
	return data;
}

export async function updateTag(params: {
	tagId: string;
	patch: TagUpdate;
}): Promise<Tag> {
	const { data, error } = await supabase
		.from("tag")
		.update(params.patch)
		.eq("id", params.tagId)
		.select("*")
		.single();

	if (error) throw error;
	return data;
}

export async function deleteTag(tagId: string): Promise<void> {
	const { error } = await supabase.from("tag").delete().eq("id", tagId);
	if (error) throw error;
}

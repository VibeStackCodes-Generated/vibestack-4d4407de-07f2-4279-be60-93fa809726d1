// Paste the provided Database type here.
// This file is intentionally a single source of truth for Supabase typings.

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			bookmark: {
				Row: {
					created_at: string;
					description: string | null;
					id: string;
					is_starred: boolean;
					title: string;
					updated_at: string;
					url: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					id?: string;
					is_starred?: boolean;
					title: string;
					updated_at?: string;
					url: string;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					id?: string;
					is_starred?: boolean;
					title?: string;
					updated_at?: string;
					url?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			bookmark_tag: {
				Row: {
					bookmark_id: string;
					created_at: string;
					tag_id: string;
					user_id: string;
				};
				Insert: {
					bookmark_id: string;
					created_at?: string;
					tag_id: string;
					user_id?: string;
				};
				Update: {
					bookmark_id?: string;
					created_at?: string;
					tag_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "bookmark_tag_bookmark_id_fkey";
						columns: ["bookmark_id"];
						isOneToOne: false;
						referencedRelation: "bookmark";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "bookmark_tag_tag_id_fkey";
						columns: ["tag_id"];
						isOneToOne: false;
						referencedRelation: "tag";
						referencedColumns: ["id"];
					},
				];
			};
			tag: {
				Row: {
					created_at: string;
					id: string;
					name: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					name: string;
					updated_at?: string;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					name?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};

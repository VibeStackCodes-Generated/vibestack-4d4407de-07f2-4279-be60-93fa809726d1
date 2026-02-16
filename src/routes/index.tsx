import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useBookmarks } from "@/hooks/useBookmarks";
import { useTags } from "@/hooks/useTags";

interface BookmarkListItem {
	id: string;
	title: string | null;
	url: string;
	description?: string | null;
	is_starred?: boolean | null;
	tags?: Array<{ id: string; name: string }>;
	created_at?: string;
}

export default function IndexRoute(): React.JSX.Element {
	const [query, setQuery] = React.useState("");
	const [starredOnly, setStarredOnly] = React.useState(false);
	const [tagId, setTagId] = React.useState<string | "">("");

	const tagsQuery = useTags();
	const bookmarksQuery = useBookmarks({
		query,
		starredOnly,
		tagId: tagId || undefined,
	});

	const tags = (tagsQuery.data ?? []) as Array<{ id: string; name: string }>;
	const bookmarks = (bookmarksQuery.data ?? []) as BookmarkListItem[];

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
					<p className="text-sm text-muted-foreground">
						Search, filter, and manage your bookmarks.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => (window.location.href = "/bookmarks/new")}>
						Add bookmark
					</Button>
					<Button
						variant="outline"
						onClick={() => (window.location.href = "/tags")}
					>
						Manage tags
					</Button>
				</div>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-base">Filters</CardTitle>
					<CardDescription>
						Quickly narrow down what you’re looking for.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-3">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="search">
							Search
						</label>
						<Input
							id="search"
							value={query}
							placeholder="Title, URL, description…"
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium">Starred</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="starred-only"
								checked={starredOnly}
								onCheckedChange={(v) => setStarredOnly(Boolean(v))}
							/>
							<label htmlFor="starred-only" className="text-sm">
								Show starred only
							</label>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="tag">
							Tag
						</label>
						<div className="flex gap-2">
							<select
								id="tag"
								value={tagId}
								onChange={(e) => setTagId(e.target.value)}
								className="h-10 w-full rounded-md border bg-background px-3 text-sm"
								aria-label="Filter by tag"
							>
								<option value="">All tags</option>
								{tags.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setQuery("");
									setStarredOnly(false);
									setTagId("");
								}}
							>
								Reset
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{bookmarksQuery.isLoading ? (
				<div className="grid gap-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className="space-y-2">
								<Skeleton className="h-5 w-2/3" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : bookmarksQuery.isError ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Couldn’t load bookmarks</CardTitle>
						<CardDescription>
							{(bookmarksQuery.error as Error | null)?.message ??
								"Please try again."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" onClick={() => bookmarksQuery.refetch()}>
							Retry
						</Button>
					</CardContent>
				</Card>
			) : bookmarks.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">No bookmarks</CardTitle>
						<CardDescription>
							{query || starredOnly || tagId
								? "No results match your filters."
								: "Add your first bookmark to get started."}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Button onClick={() => (window.location.href = "/bookmarks/new")}>
							Add bookmark
						</Button>
						{(query || starredOnly || tagId) && (
							<Button
								variant="outline"
								onClick={() => {
									setQuery("");
									setStarredOnly(false);
									setTagId("");
								}}
							>
								Clear filters
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-3">
					{bookmarks.map((b) => (
						<Card key={b.id} className="hover:border-primary/40">
							<CardHeader className="space-y-1">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0">
										<CardTitle className="text-base">
											<a
												href={`/bookmarks/${b.id}`}
												className="line-clamp-1 hover:underline"
												aria-label={`Open details for ${b.title ?? b.url}`}
											>
												{b.title ?? b.url}
											</a>
										</CardTitle>
										<CardDescription className="line-clamp-1">
											{b.url}
										</CardDescription>
									</div>
									{b.is_starred ? <Badge>Starred</Badge> : null}
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{b.description ? (
									<p className="text-sm text-muted-foreground">
										{b.description}
									</p>
								) : null}
								{b.tags && b.tags.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{b.tags.map((t) => (
											<Badge key={t.id} variant="secondary">
												{t.name}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-xs text-muted-foreground">No tags</p>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

import * as React from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { useBookmark } from "@/hooks/useBookmark";
import { useDeleteBookmark } from "@/hooks/useDeleteBookmark";
import { useTags } from "@/hooks/useTags";
import { useUpdateBookmark } from "@/hooks/useUpdateBookmark";

interface BookmarkDetail {
	id: string;
	title: string | null;
	url: string;
	description: string | null;
	is_starred: boolean | null;
	tags?: Array<{ id: string; name: string }>;
}

interface EditBookmarkFormValues {
	title: string;
	url: string;
	description: string;
	is_starred: boolean;
	tagIds: string[];
}

function getBookmarkIdFromPathname(): string | null {
	const parts = window.location.pathname.split("/").filter(Boolean);
	const idx = parts.findIndex((p) => p === "bookmarks");
	const id = idx >= 0 ? parts[idx + 1] : null;
	return id ?? null;
}

export default function BookmarkDetailsRoute(): React.JSX.Element {
	const id = getBookmarkIdFromPathname();

	const bookmarkQuery = useBookmark({ id: id ?? "" });
	const tagsQuery = useTags();
	const updateMutation = useUpdateBookmark();
	const deleteMutation = useDeleteBookmark();

	const bookmark = (bookmarkQuery.data ?? null) as BookmarkDetail | null;
	const allTags = (tagsQuery.data ?? []) as Array<{ id: string; name: string }>;

	const form = useForm<EditBookmarkFormValues>({
		defaultValues: {
			title: "",
			url: "",
			description: "",
			is_starred: false,
			tagIds: [],
		},
	});

	React.useEffect(() => {
		if (!bookmark) return;
		form.reset({
			title: bookmark.title ?? "",
			url: bookmark.url,
			description: bookmark.description ?? "",
			is_starred: Boolean(bookmark.is_starred),
			tagIds: (bookmark.tags ?? []).map((t) => t.id),
		});
	}, [bookmark, form]);

	function toggleTag(tagId: string): void {
		const current = new Set(form.getValues("tagIds"));
		if (current.has(tagId)) current.delete(tagId);
		else current.add(tagId);
		form.setValue("tagIds", Array.from(current), { shouldDirty: true });
	}

	async function onSave(values: EditBookmarkFormValues): Promise<void> {
		if (!id) return;
		const url = values.url.trim();
		if (!url) {
			form.setError("url", { type: "validate", message: "URL is required" });
			return;
		}

		await updateMutation.mutateAsync({
			id,
			title: values.title.trim() || null,
			url,
			description: values.description.trim() || null,
			is_starred: values.is_starred,
			tagIds: values.tagIds,
		});
	}

	async function onDelete(): Promise<void> {
		if (!id) return;
		await deleteMutation.mutateAsync({ id });
		window.location.href = "/";
	}

	if (!id) {
		return (
			<div className="mx-auto w-full max-w-3xl px-4 py-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Invalid bookmark</CardTitle>
						<CardDescription>Missing bookmark id in URL.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							onClick={() => (window.location.href = "/")}
						>
							Go home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6">
			<div className="mb-6 flex items-start justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Bookmark</h1>
					<p className="text-sm text-muted-foreground">
						Edit details, tags, or delete.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => window.history.back()}>
						Back
					</Button>
					{bookmark?.url ? (
						<Button variant="outline" asChild>
							<a href={bookmark.url} target="_blank" rel="noreferrer">
								Open
							</a>
						</Button>
					) : null}
				</div>
			</div>

			{bookmarkQuery.isLoading ? (
				<Card>
					<CardHeader className="space-y-2">
						<Skeleton className="h-5 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
					</CardHeader>
					<CardContent className="space-y-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-24 w-full" />
					</CardContent>
				</Card>
			) : bookmarkQuery.isError ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Couldn’t load bookmark</CardTitle>
						<CardDescription>
							{(bookmarkQuery.error as Error | null)?.message ??
								"Please try again."}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Button variant="outline" onClick={() => bookmarkQuery.refetch()}>
							Retry
						</Button>
						<Button
							variant="ghost"
							onClick={() => (window.location.href = "/")}
						>
							Go home
						</Button>
					</CardContent>
				</Card>
			) : !bookmark ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Not found</CardTitle>
						<CardDescription>
							This bookmark does not exist or you don’t have access.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							onClick={() => (window.location.href = "/")}
						>
							Go home
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Edit</CardTitle>
						<CardDescription>
							Changes save immediately when you click “Save”.
						</CardDescription>
					</CardHeader>
					<form onSubmit={form.handleSubmit(onSave)}>
						<CardContent className="space-y-6">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input id="title" {...form.register("title")} />
								</div>

								<div className="space-y-2">
									<Label htmlFor="url">URL</Label>
									<Input
										id="url"
										{...form.register("url")}
										aria-invalid={
											Boolean(form.formState.errors.url) || undefined
										}
									/>
									{form.formState.errors.url?.message ? (
										<p className="text-sm text-destructive">
											{form.formState.errors.url.message}
										</p>
									) : null}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea id="description" {...form.register("description")} />
							</div>

							<div className="flex items-center gap-2">
								<Checkbox
									id="is_starred"
									checked={form.watch("is_starred")}
									onCheckedChange={(v) =>
										form.setValue("is_starred", Boolean(v), {
											shouldDirty: true,
										})
									}
								/>
								<Label htmlFor="is_starred">Starred</Label>
							</div>

							<div className="space-y-3">
								<div className="flex items-baseline justify-between gap-3">
									<div>
										<div className="text-sm font-medium">Tags</div>
										<div className="text-xs text-muted-foreground">
											Click to toggle.
										</div>
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={() => (window.location.href = "/tags")}
									>
										Manage tags
									</Button>
								</div>

								{tagsQuery.isLoading ? (
									<div className="text-sm text-muted-foreground">
										Loading tags…
									</div>
								) : tagsQuery.isError ? (
									<div className="text-sm text-destructive">
										{(tagsQuery.error as Error | null)?.message ??
											"Couldn’t load tags"}
									</div>
								) : allTags.length === 0 ? (
									<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
										No tags yet.
									</div>
								) : (
									<div className="flex flex-wrap gap-2">
										{allTags.map((t) => {
											const selected = form.watch("tagIds").includes(t.id);
											return (
												<button
													key={t.id}
													type="button"
													onClick={() => toggleTag(t.id)}
													className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
													aria-pressed={selected}
												>
													<Badge variant={selected ? "default" : "secondary"}>
														{t.name}
													</Badge>
												</button>
											);
										})}
									</div>
								)}
							</div>

							{updateMutation.isError ? (
								<div
									role="alert"
									className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
								>
									{(updateMutation.error as Error | null)?.message ??
										"Couldn’t save changes"}
								</div>
							) : null}
						</CardContent>
						<CardFooter className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										type="button"
										variant="destructive"
										disabled={deleteMutation.isPending}
									>
										Delete
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Delete bookmark?</DialogTitle>
										<DialogDescription>This can’t be undone.</DialogDescription>
									</DialogHeader>
									{deleteMutation.isError ? (
										<div
											role="alert"
											className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
										>
											{(deleteMutation.error as Error | null)?.message ??
												"Couldn’t delete bookmark"}
										</div>
									) : null}
									<DialogFooter>
										<Button type="button" variant="outline" onClick={() => {}}>
											Cancel
										</Button>
										<Button
											type="button"
											variant="destructive"
											onClick={onDelete}
											disabled={deleteMutation.isPending}
										>
											{deleteMutation.isPending ? "Deleting…" : "Delete"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<div className="flex items-center gap-2 sm:justify-end">
								<Button
									type="button"
									variant="ghost"
									onClick={() => (window.location.href = "/")}
								>
									Close
								</Button>
								<Button
									type="submit"
									disabled={updateMutation.isPending || !form.formState.isDirty}
								>
									{updateMutation.isPending ? "Saving…" : "Save"}
								</Button>
							</div>
						</CardFooter>
					</form>
				</Card>
			)}
		</div>
	);
}

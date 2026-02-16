import type * as React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreateBookmark } from "@/hooks/useCreateBookmark";
import { useTags } from "@/hooks/useTags";

interface CreateBookmarkFormValues {
	title: string;
	url: string;
	description: string;
	is_starred: boolean;
	tagIds: string[];
}

export default function NewBookmarkRoute(): React.JSX.Element {
	const tagsQuery = useTags();
	const createMutation = useCreateBookmark();

	const tags = (tagsQuery.data ?? []) as Array<{ id: string; name: string }>;

	const form = useForm<CreateBookmarkFormValues>({
		defaultValues: {
			title: "",
			url: "",
			description: "",
			is_starred: false,
			tagIds: [],
		},
	});

	const tagIds = form.watch("tagIds");

	function toggleTag(id: string): void {
		const current = new Set(form.getValues("tagIds"));
		if (current.has(id)) current.delete(id);
		else current.add(id);
		form.setValue("tagIds", Array.from(current));
	}

	async function onSubmit(values: CreateBookmarkFormValues): Promise<void> {
		const url = values.url.trim();
		if (!url) {
			form.setError("url", { type: "validate", message: "URL is required" });
			return;
		}

		try {
			const created = await createMutation.mutateAsync({
				title: values.title.trim() || null,
				url,
				description: values.description.trim() || null,
				is_starred: values.is_starred,
				tagIds: values.tagIds,
			});

			const id = (created as { id?: string } | null)?.id;
			window.location.href = id ? `/bookmarks/${id}` : "/";
		} catch {
			// handled by mutation error state
		}
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6">
			<div className="mb-6 flex items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						New bookmark
					</h1>
					<p className="text-sm text-muted-foreground">
						Save a link with optional tags.
					</p>
				</div>
				<Button variant="outline" onClick={() => window.history.back()}>
					Back
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Details</CardTitle>
					<CardDescription>
						Keep it minimal—title and description are optional.
					</CardDescription>
				</CardHeader>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="space-y-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="Optional"
									{...form.register("title")}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input
									id="url"
									placeholder="https://…"
									autoComplete="url"
									{...form.register("url")}
									aria-invalid={Boolean(form.formState.errors.url) || undefined}
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
							<Textarea
								id="description"
								placeholder="Optional notes"
								{...form.register("description")}
							/>
						</div>

						<div className="flex items-center gap-2">
							<Checkbox
								id="is_starred"
								checked={form.watch("is_starred")}
								onCheckedChange={(v) => form.setValue("is_starred", Boolean(v))}
							/>
							<Label htmlFor="is_starred">Star</Label>
						</div>

						<div className="space-y-3">
							<div className="flex items-baseline justify-between gap-3">
								<div>
									<div className="text-sm font-medium">Tags</div>
									<div className="text-xs text-muted-foreground">
										Select any that apply.
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
							) : tags.length === 0 ? (
								<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
									No tags yet.
								</div>
							) : (
								<div className="flex flex-wrap gap-2">
									{tags.map((t) => {
										const selected = tagIds.includes(t.id);
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

						{createMutation.isError ? (
							<div
								role="alert"
								className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
							>
								{(createMutation.error as Error | null)?.message ??
									"Couldn’t create bookmark"}
							</div>
						) : null}
					</CardContent>
					<CardFooter className="flex items-center justify-between gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => (window.location.href = "/")}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createMutation.isPending}>
							{createMutation.isPending ? "Saving…" : "Save"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

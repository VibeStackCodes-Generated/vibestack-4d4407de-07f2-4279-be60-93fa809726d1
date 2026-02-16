import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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

import { useCreateTag } from "@/hooks/useCreateTag";
import { useDeleteTag } from "@/hooks/useDeleteTag";
import { useRenameTag } from "@/hooks/useRenameTag";
import { useTags } from "@/hooks/useTags";

interface CreateTagFormValues {
	name: string;
}

interface RenameTagFormValues {
	name: string;
}

export default function TagsRoute(): React.JSX.Element {
	const tagsQuery = useTags();
	const createMutation = useCreateTag();
	const deleteMutation = useDeleteTag();
	const renameMutation = useRenameTag();

	const tags = (tagsQuery.data ?? []) as Array<{ id: string; name: string }>;

	const createForm = useForm<CreateTagFormValues>({
		defaultValues: { name: "" },
	});

	async function onCreate(values: CreateTagFormValues): Promise<void> {
		const name = values.name.trim();
		if (!name) {
			createForm.setError("name", {
				type: "validate",
				message: "Name is required",
			});
			return;
		}

		await createMutation.mutateAsync({ name });
		createForm.reset({ name: "" });
		await tagsQuery.refetch();
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-6">
			<div className="mb-6 flex items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
					<p className="text-sm text-muted-foreground">
						Create, rename, or delete tags.
					</p>
				</div>
				<Button variant="outline" onClick={() => window.history.back()}>
					Back
				</Button>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-base">Create</CardTitle>
					<CardDescription>Add a new tag.</CardDescription>
				</CardHeader>
				<form onSubmit={createForm.handleSubmit(onCreate)}>
					<CardContent className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder="e.g. reading"
							{...createForm.register("name")}
						/>
						{createForm.formState.errors.name?.message ? (
							<p className="text-sm text-destructive">
								{createForm.formState.errors.name.message}
							</p>
						) : null}
						{createMutation.isError ? (
							<div
								role="alert"
								className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
							>
								{(createMutation.error as Error | null)?.message ??
									"Couldn’t create tag"}
							</div>
						) : null}
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit" disabled={createMutation.isPending}>
							{createMutation.isPending ? "Creating…" : "Create"}
						</Button>
					</CardFooter>
				</form>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">All tags</CardTitle>
					<CardDescription>Click rename or delete.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{tagsQuery.isLoading ? (
						<div className="space-y-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center justify-between gap-3"
								>
									<Skeleton className="h-5 w-32" />
									<div className="flex gap-2">
										<Skeleton className="h-9 w-20" />
										<Skeleton className="h-9 w-20" />
									</div>
								</div>
							))}
						</div>
					) : tagsQuery.isError ? (
						<div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{(tagsQuery.error as Error | null)?.message ??
								"Couldn’t load tags"}
						</div>
					) : tags.length === 0 ? (
						<div className="rounded-md border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground">
							No tags yet.
						</div>
					) : (
						<ul className="space-y-2">
							{tags.map((t) => (
								<li
									key={t.id}
									className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="min-w-0">
										<div className="truncate text-sm font-medium">{t.name}</div>
										<div className="text-xs text-muted-foreground">{t.id}</div>
									</div>

									<div className="flex items-center gap-2">
										<RenameTagDialog
											tagId={t.id}
											currentName={t.name}
											onRename={async (name) => {
												await renameMutation.mutateAsync({ id: t.id, name });
												await tagsQuery.refetch();
											}}
											pending={renameMutation.isPending}
										/>

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
													<DialogTitle>Delete tag?</DialogTitle>
													<DialogDescription>
														Bookmarks will no longer be associated with this
														tag.
													</DialogDescription>
												</DialogHeader>
												{deleteMutation.isError ? (
													<div
														role="alert"
														className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
													>
														{(deleteMutation.error as Error | null)?.message ??
															"Couldn’t delete tag"}
													</div>
												) : null}
												<DialogFooter>
													<Button
														type="button"
														variant="outline"
														onClick={() => {}}
													>
														Cancel
													</Button>
													<Button
														type="button"
														variant="destructive"
														onClick={async () => {
															await deleteMutation.mutateAsync({ id: t.id });
															await tagsQuery.refetch();
														}}
														disabled={deleteMutation.isPending}
													>
														{deleteMutation.isPending ? "Deleting…" : "Delete"}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

interface RenameTagDialogProps {
	tagId: string;
	currentName: string;
	pending: boolean;
	onRename: (name: string) => Promise<void>;
}

export function RenameTagDialog(
	props: RenameTagDialogProps,
): React.JSX.Element {
	const form = useForm<RenameTagFormValues>({
		defaultValues: { name: props.currentName },
	});

	React.useEffect(() => {
		form.reset({ name: props.currentName });
	}, [props.currentName, form]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" disabled={props.pending}>
					Rename
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename tag</DialogTitle>
					<DialogDescription>Update the tag name.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(async (values) => {
						const name = values.name.trim();
						if (!name) {
							form.setError("name", {
								type: "validate",
								message: "Name is required",
							});
							return;
						}
						await props.onRename(name);
					})}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor={`rename-${props.tagId}`}>Name</Label>
						<Input id={`rename-${props.tagId}`} {...form.register("name")} />
						{form.formState.errors.name?.message ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						) : null}
					</div>
					<DialogFooter>
						<Button type="submit" disabled={props.pending}>
							{props.pending ? "Saving…" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

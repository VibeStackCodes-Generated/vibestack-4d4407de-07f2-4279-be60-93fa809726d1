import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { TagPicker } from "@/components/TagPicker";

export interface BookmarkFormValues {
	url: string;
	title: string;
	description: string;
	starred: boolean;
	tagIds: string[];
}

export interface BookmarkFormProps {
	defaultValues?: Partial<BookmarkFormValues>;
	onSubmit: (values: BookmarkFormValues) => void | Promise<void>;
	submitLabel?: string;
	disabled?: boolean;
	className?: string;
}

const schema = z.object({
	url: z
		.string()
		.trim()
		.min(1, "URL is required")
		.url("Enter a valid URL (including https://)"),
	title: z.string().trim().min(1, "Title is required"),
	description: z
		.string()
		.trim()
		.max(2000, "Description is too long")
		.default(""),
	starred: z.boolean().default(false),
	tagIds: z.array(z.string()).default([]),
});

export function BookmarkForm({
	defaultValues,
	onSubmit,
	submitLabel = "Save bookmark",
	disabled,
	className,
}: BookmarkFormProps) {
	const form = useForm<BookmarkFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			url: defaultValues?.url ?? "",
			title: defaultValues?.title ?? "",
			description: defaultValues?.description ?? "",
			starred: defaultValues?.starred ?? false,
			tagIds: defaultValues?.tagIds ?? [],
		},
		mode: "onSubmit",
	});

	const isSubmitting = form.formState.isSubmitting;
	const isDisabled = Boolean(disabled || isSubmitting);

	async function handleSubmit(values: BookmarkFormValues) {
		await onSubmit(values);
	}

	return (
		<Form {...form}>
			<form
				className={"space-y-6 " + (className ?? "")}
				onSubmit={form.handleSubmit(handleSubmit)}
				aria-label="Bookmark form"
			>
				<FormField
					control={form.control}
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel>URL</FormLabel>
							<FormControl>
								<Input
									{...field}
									inputMode="url"
									placeholder="https://example.com"
									disabled={isDisabled}
									autoComplete="url"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="A descriptive title"
									disabled={isDisabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Notes about why this is useful…"
									disabled={isDisabled}
									className="min-h-24"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="starred"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
							<div className="space-y-1">
								<FormLabel className="m-0">Starred</FormLabel>
								<p className="text-sm text-muted-foreground">
									Star bookmarks you want to find quickly.
								</p>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isDisabled}
									aria-label="Toggle starred"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="tagIds"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tags</FormLabel>
							<FormControl>
								<TagPicker
									value={field.value}
									onChange={field.onChange}
									disabled={isDisabled}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
					<Button type="submit" disabled={isDisabled} className="sm:w-auto">
						{isSubmitting ? "Saving…" : submitLabel}
					</Button>
				</div>
			</form>
		</Form>
	);
}

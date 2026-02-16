import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

// The VibeStack app is expected to provide this hook.
// It should return available tags and allow creating a new tag.
import { useTags } from "@/hooks/useTags";

type Id = string;

export interface TagOption {
	id: Id;
	name: string;
}

export interface TagPickerProps {
	value: Id[];
	onChange: (next: Id[]) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

function uniq(ids: Id[]): Id[] {
	return Array.from(new Set(ids));
}

export function TagPicker({
	value,
	onChange,
	disabled,
	placeholder = "Search or create tags…",
	className,
}: TagPickerProps) {
	const { tags, isLoading, createTag, isCreating } = useTags();

	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	const options: TagOption[] = React.useMemo(() => {
		const raw = (tags ?? []) as Array<{ id: string; name: string }>;
		return raw
			.filter((t) => typeof t?.id === "string" && typeof t?.name === "string")
			.map((t) => ({ id: t.id, name: t.name }));
	}, [tags]);

	const selectedSet = React.useMemo(() => new Set(value), [value]);

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return options;
		return options.filter((t) => t.name.toLowerCase().includes(q));
	}, [options, query]);

	const canCreate = React.useMemo(() => {
		const q = query.trim();
		if (!q) return false;
		return !options.some((t) => t.name.toLowerCase() === q.toLowerCase());
	}, [options, query]);

	async function handleCreate() {
		const name = query.trim();
		if (!name || disabled) return;

		const created = await createTag({ name });
		const createdId = (created as { id?: string } | null | undefined)?.id;
		if (createdId) {
			onChange(uniq([...value, createdId]));
			setQuery("");
		}
	}

	function toggle(id: Id) {
		if (disabled) return;
		if (selectedSet.has(id)) {
			onChange(value.filter((x) => x !== id));
		} else {
			onChange(uniq([...value, id]));
		}
	}

	function remove(id: Id) {
		if (disabled) return;
		onChange(value.filter((x) => x !== id));
	}

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex flex-wrap gap-2">
				{value.length === 0 ? (
					<p className="text-sm text-muted-foreground">No tags selected.</p>
				) : (
					value
						.map((id) => options.find((t) => t.id === id))
						.filter((t): t is TagOption => Boolean(t))
						.map((t) => (
							<Badge key={t.id} variant="secondary" className="gap-1">
								<span>{t.name}</span>
								<button
									type="button"
									className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() => remove(t.id)}
									aria-label={`Remove tag ${t.name}`}
									disabled={disabled}
								>
									×
								</button>
							</Badge>
						))
				)}
			</div>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						disabled={disabled}
						className="w-full justify-start"
					>
						Pick tags
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-[min(92vw,420px)] p-3">
					<div className="space-y-2">
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={placeholder}
							disabled={disabled}
							aria-label="Search tags"
						/>

						<div
							className="max-h-60 overflow-auto rounded-md border"
							role="listbox"
							aria-label="Tag results"
						>
							{isLoading ? (
								<div className="p-3 text-sm text-muted-foreground">
									Loading tags…
								</div>
							) : filtered.length === 0 && !canCreate ? (
								<div className="p-3 text-sm text-muted-foreground">
									No tags found.
								</div>
							) : (
								<div className="p-1">
									{filtered.map((t) => {
										const selected = selectedSet.has(t.id);
										return (
											<button
												key={t.id}
												type="button"
												role="option"
												aria-selected={selected}
												disabled={disabled}
												onClick={() => toggle(t.id)}
												className={cn(
													"flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
													selected && "bg-accent text-accent-foreground",
												)}
											>
												<span className="truncate">{t.name}</span>
												{selected ? <span aria-hidden>✓</span> : null}
											</button>
										);
									})}

									{canCreate ? (
										<div className="mt-1 border-t p-1">
											<Button
												type="button"
												variant="secondary"
												className="w-full justify-start"
												onClick={handleCreate}
												disabled={disabled || isCreating}
											>
												Create “{query.trim()}”
											</Button>
										</div>
									) : null}
								</div>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

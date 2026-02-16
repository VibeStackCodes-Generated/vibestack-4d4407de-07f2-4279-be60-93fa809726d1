import { Link } from "@tanstack/react-router";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export interface BookmarkTag {
	id: string;
	name: string;
}

export interface BookmarkCardBookmark {
	id: string;
	title: string;
	url: string;
	description?: string | null;
	starred: boolean;
	tags?: BookmarkTag[];
}

export interface BookmarkCardProps {
	bookmark: BookmarkCardBookmark;
	onToggleStar?: (
		bookmarkId: string,
		nextStarred: boolean,
	) => void | Promise<void>;
	editTo: string;
	className?: string;
}

function safeHostname(url: string): string | null {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
}

export function BookmarkCard({
	bookmark,
	onToggleStar,
	editTo,
	className,
}: BookmarkCardProps) {
	const [pending, setPending] = React.useState(false);

	async function handleToggleStar() {
		if (!onToggleStar || pending) return;
		setPending(true);
		try {
			await onToggleStar(bookmark.id, !bookmark.starred);
		} finally {
			setPending(false);
		}
	}

	const host = safeHostname(bookmark.url);

	return (
		<article
			className={cn(
				"group rounded-xl border bg-background p-4 shadow-sm transition-colors hover:bg-accent/30",
				className,
			)}
			aria-label={bookmark.title}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<a
							href={bookmark.url}
							target="_blank"
							rel="noreferrer"
							className="min-w-0 max-w-full truncate text-base font-semibold leading-6 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							aria-label={`Open ${bookmark.title}`}
						>
							{bookmark.title}
						</a>
						{host ? (
							<span className="hidden text-xs text-muted-foreground sm:inline">
								{host}
							</span>
						) : null}
					</div>

					<a
						href={bookmark.url}
						target="_blank"
						rel="noreferrer"
						className="mt-0.5 block truncate text-sm text-muted-foreground hover:underline"
					>
						{bookmark.url}
					</a>

					{bookmark.description ? (
						<p className="mt-3 line-clamp-3 text-sm text-foreground/90">
							{bookmark.description}
						</p>
					) : null}
				</div>

				<div className="flex shrink-0 flex-col items-end gap-2">
					<Button
						type="button"
						variant={bookmark.starred ? "default" : "outline"}
						size="sm"
						onClick={handleToggleStar}
						disabled={!onToggleStar || pending}
						aria-pressed={bookmark.starred}
						aria-label={bookmark.starred ? "Unstar bookmark" : "Star bookmark"}
					>
						{bookmark.starred ? "Starred" : "Star"}
					</Button>

					<Button asChild variant="ghost" size="sm" className="px-2">
						<Link to={editTo} aria-label="Edit bookmark">
							Edit
						</Link>
					</Button>
				</div>
			</div>

			{bookmark.tags && bookmark.tags.length > 0 ? (
				<div className="mt-4 flex flex-wrap gap-2">
					{bookmark.tags.map((t) => (
						<Badge key={t.id} variant="secondary">
							{t.name}
						</Badge>
					))}
				</div>
			) : null}
		</article>
	);
}

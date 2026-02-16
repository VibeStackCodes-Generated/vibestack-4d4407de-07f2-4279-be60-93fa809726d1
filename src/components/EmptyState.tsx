import type * as React from "react";

export interface EmptyStateProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	title,
	description,
	action,
	icon,
	className,
}: EmptyStateProps) {
	return (
		<section
			className={
				"mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-xl border bg-background px-6 py-10 text-center " +
				(className ?? "")
			}
			aria-label={title}
		>
			{icon ? (
				<div aria-hidden className="text-muted-foreground">
					{icon}
				</div>
			) : null}
			<div className="space-y-1">
				<h2 className="text-balance text-lg font-semibold">{title}</h2>
				{description ? (
					<p className="text-pretty text-sm text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{action ? <div className="pt-2">{action}</div> : null}
		</section>
	);
}

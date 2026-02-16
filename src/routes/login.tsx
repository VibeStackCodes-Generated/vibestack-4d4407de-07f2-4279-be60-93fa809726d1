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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

type LoginMode = "magic" | "password";

interface LoginFormValues {
	email: string;
	password?: string;
	mode: LoginMode;
}

export default function LoginRoute(): React.JSX.Element {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [message, setMessage] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	const form = useForm<LoginFormValues>({
		defaultValues: { email: "", password: "", mode: "magic" },
	});

	const mode = form.watch("mode");

	async function onSubmit(values: LoginFormValues): Promise<void> {
		setIsSubmitting(true);
		setMessage(null);
		setError(null);

		try {
			const email = values.email.trim().toLowerCase();
			if (!email) {
				setError("Email is required");
				return;
			}

			if (values.mode === "magic") {
				const { error: authError } = await supabase.auth.signInWithOtp({
					email,
					options: {
						emailRedirectTo: `${window.location.origin}/`,
					},
				});
				if (authError) throw authError;
				setMessage("Check your email for a magic link.");
				form.setValue("password", "");
				return;
			}

			const password = (values.password ?? "").trim();
			if (!password) {
				setError("Password is required");
				return;
			}

			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (authError) throw authError;

			window.location.href = "/";
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Unable to sign in";
			setError(msg);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-dvh bg-background text-foreground">
			<div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4">
				<Card className="w-full">
					<CardHeader>
						<CardTitle className="text-xl">MarkNest</CardTitle>
						<CardDescription>Sign in to manage your bookmarks.</CardDescription>
					</CardHeader>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="you@domain.com"
									{...form.register("email")}
								/>
							</div>

							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-2">
									<Checkbox
										id="use-password"
										checked={mode === "password"}
										onCheckedChange={(checked) => {
											form.setValue("mode", checked ? "password" : "magic");
										}}
									/>
									<Label htmlFor="use-password" className="text-sm">
										Use password
									</Label>
								</div>
								<p className="text-xs text-muted-foreground">
									Magic link is default
								</p>
							</div>

							{mode === "password" ? (
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										autoComplete="current-password"
										placeholder="••••••••"
										{...form.register("password")}
									/>
								</div>
							) : null}

							{error ? (
								<div
									role="alert"
									className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
								>
									{error}
								</div>
							) : null}

							{message ? (
								<div
									role="status"
									className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm"
								>
									{message}
								</div>
							) : null}
						</CardContent>
						<CardFooter className="flex items-center justify-between gap-3">
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting
									? "Signing in…"
									: mode === "magic"
										? "Send magic link"
										: "Sign in"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}

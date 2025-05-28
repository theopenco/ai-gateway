import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Loader2, KeySquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUser } from "@/hooks/useUser";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/lib/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/lib/components/form";
import { Input } from "@/lib/components/input";
import { toast } from "@/lib/components/use-toast";

const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" }),
});

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	useUser({ redirectTo: "/dashboard", redirectWhen: "authenticated" });

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		if (window.PublicKeyCredential) {
			void signIn.passkey({ autoFill: true });
		}
	}, []);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		const { error } = await signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onSuccess: () => {
					toast({ title: "Login successful" });
					navigate({ to: "/dashboard" });
				},
				onError: (ctx) => {
					toast({
						title: ctx.error.message || "An unknown error occurred",
						variant: "destructive",
						className: "text-white",
					});
				},
			},
		);

		if (error) {
			toast({
				title: error.message || "An unknown error occurred",
				variant: "destructive",
				className: "text-white",
			});
		}

		setIsLoading(false);
	}

	async function handlePasskeySignIn() {
		setIsLoading(true);
		try {
			const res = await signIn.passkey();
			if (res?.error) {
				toast({
					title: res.error.message || "Failed to sign in with passkey",
					variant: "destructive",
					className: "text-white",
				});
				return;
			}
			toast({ title: "Login successful" });
			navigate({ to: "/dashboard" });
		} catch (error: any) {
			toast({
				title: error?.message || "Failed to sign in with passkey",
				variant: "destructive",
				className: "text-white",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="max-w-[64rm] mx-auto flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email and password to sign in to your account
					</p>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder="name@example.com"
											type="email"
											autoComplete="username webauthn"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											placeholder="••••••••"
											type="password"
											autoComplete="current-password webauthn"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>
				</Form>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">Or</span>
					</div>
				</div>
				<Button
					onClick={handlePasskeySignIn}
					variant="outline"
					className="w-full"
					disabled={isLoading}
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<KeySquare className="mr-2 h-4 w-4" />
					)}
					Sign in with passkey
				</Button>
				<p className="px-8 text-center text-sm text-muted-foreground">
					<Link
						to="/signup"
						className="hover:text-brand underline underline-offset-4"
					>
						Don&apos;t have an account? Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}

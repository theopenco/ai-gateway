import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { toast } from "@/lib/components/use-toast";

export const Route = createFileRoute("/verify")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { user, isLoading } = useUser();
	const { signOut, sendVerificationEmail } = useAuth();
	const [isResending, setIsResending] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (user?.emailVerified) {
			navigate({ to: "/dashboard" });
		}
	}, [user?.emailVerified, navigate]);

	const handleResendEmail = async () => {
		setIsResending(true);
		try {
			if (!user?.email) {
				throw new Error("No email found");
			}
			await sendVerificationEmail({
				email: user.email,
			});
		} catch (error) {
			console.error("Failed to resend verification email:", error);
			toast({
				title: "Failed to resend verification email",
				variant: "destructive",
			});
		} finally {
			setIsResending(false);
		}
	};

	const handleLogout = async () => {
		posthog.reset();
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					queryClient.clear();
					navigate({ to: "/login" });
				},
			},
		});
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
			</div>
		);
	}

	if (!user) {
		navigate({ to: "/login" });
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Verify Your Email
					</CardTitle>
					<CardDescription>
						We've sent a verification email to <strong>{user.email}</strong>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<p className="text-sm text-yellow-800">
							Please check your email and click the verification link to
							continue.
						</p>
					</div>
					<div className="space-y-2">
						<p className="text-sm text-gray-600">
							Didn't receive the email? Check your spam folder or request a new
							one.
						</p>
						<Button
							onClick={handleResendEmail}
							disabled={isResending}
							variant="outline"
							className="w-full"
						>
							{isResending ? "Sending..." : "Resend Verification Email"}
						</Button>
					</div>
					<div className="pt-4 border-t">
						<p className="text-sm text-muted-foreground text-center mb-2">
							Wrong email address?
						</p>
						<Button onClick={handleLogout} variant="ghost" className="w-full">
							Sign out and use different account
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

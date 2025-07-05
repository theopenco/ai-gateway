"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { Switch } from "@/lib/components/switch";
import { Label } from "@/lib/components/label";
import { useToast } from "@/lib/components/use-toast";

export default function SecurityPage() {
	const { toast } = useToast();
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [loginNotifications, setLoginNotifications] = useState(true);

	const handleTwoFactorToggle = async (enabled: boolean) => {
		try {
			// TODO: Implement 2FA toggle
			setTwoFactorEnabled(enabled);
			toast({
				title: enabled ? "2FA Enabled" : "2FA Disabled",
				description: enabled
					? "Two-factor authentication has been enabled."
					: "Two-factor authentication has been disabled.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update 2FA settings. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleEmailNotificationsToggle = async (enabled: boolean) => {
		try {
			// TODO: Implement email notifications toggle
			setEmailNotifications(enabled);
			toast({
				title: "Settings Updated",
				description: "Email notification settings have been updated.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description:
					"Failed to update notification settings. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleLoginNotificationsToggle = async (enabled: boolean) => {
		try {
			// TODO: Implement login notifications toggle
			setLoginNotifications(enabled);
			toast({
				title: "Settings Updated",
				description: "Login notification settings have been updated.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description:
					"Failed to update notification settings. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Security</h2>
				</div>
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Two-Factor Authentication</CardTitle>
							<CardDescription>
								Add an extra layer of security to your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center space-x-2">
								<Switch
									id="two-factor"
									checked={twoFactorEnabled}
									onCheckedChange={handleTwoFactorToggle}
								/>
								<Label htmlFor="two-factor">
									{twoFactorEnabled ? "Enabled" : "Disabled"}
								</Label>
							</div>
							<p className="text-sm text-muted-foreground mt-2">
								When enabled, you'll need to enter a code from your
								authenticator app in addition to your password.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Security Notifications</CardTitle>
							<CardDescription>
								Manage how you receive security-related notifications
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center space-x-2">
								<Switch
									id="email-notifications"
									checked={emailNotifications}
									onCheckedChange={handleEmailNotificationsToggle}
								/>
								<Label htmlFor="email-notifications">
									Email notifications for security events
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="login-notifications"
									checked={loginNotifications}
									onCheckedChange={handleLoginNotificationsToggle}
								/>
								<Label htmlFor="login-notifications">
									Email notifications for new logins
								</Label>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Active Sessions</CardTitle>
							<CardDescription>
								Manage your active sessions across devices
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Current Session</h4>
										<p className="text-sm text-muted-foreground">
											This device - Active now
										</p>
									</div>
									<Button variant="outline" size="sm">
										Current
									</Button>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<Button variant="outline">Revoke All Other Sessions</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Separator } from "@/lib/components/separator";
import { useToast } from "@/lib/components/use-toast";
import { useUser } from "@/hooks/useUser";

const updateProfileSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Please enter a valid email address"),
});

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function AccountPage() {
	const { user } = useUser();
	const { toast } = useToast();
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
	} = useForm<UpdateProfileForm>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user?.name || "",
			email: user?.email || "",
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
		reset: resetPasswordForm,
	} = useForm<ChangePasswordForm>({
		resolver: zodResolver(changePasswordSchema),
	});

	const onProfileSubmit = async (data: UpdateProfileForm) => {
		try {
			// TODO: Implement profile update
			toast({
				title: "Profile updated",
				description: "Your profile has been updated successfully.",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update profile. Please try again.",
				variant: "destructive",
			});
		}
	};

	const onPasswordSubmit = async (data: ChangePasswordForm) => {
		try {
			// TODO: Implement password change
			toast({
				title: "Password changed",
				description: "Your password has been changed successfully.",
			});
			resetPasswordForm();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to change password. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleDeleteAccount = async () => {
		if (
			confirm(
				"Are you sure you want to delete your account? This action cannot be undone.",
			)
		) {
			try {
				// TODO: Implement account deletion
				toast({
					title: "Account deleted",
					description: "Your account has been deleted successfully.",
				});
			} catch (error) {
				toast({
					title: "Error",
					description: "Failed to delete account. Please try again.",
					variant: "destructive",
				});
			}
		}
	};

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Account</h2>
				</div>
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
							<CardDescription>
								Update your account profile information
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleProfileSubmit(onProfileSubmit)}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input id="name" {...registerProfile("name")} />
									{profileErrors.name && (
										<p className="text-sm text-red-600">
											{profileErrors.name.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										{...registerProfile("email")}
									/>
									{profileErrors.email && (
										<p className="text-sm text-red-600">
											{profileErrors.email.message}
										</p>
									)}
								</div>
								<Button type="submit" disabled={isProfileSubmitting}>
									{isProfileSubmitting ? "Updating..." : "Update Profile"}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Change Password</CardTitle>
							<CardDescription>Update your account password</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handlePasswordSubmit(onPasswordSubmit)}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="currentPassword">Current Password</Label>
									<div className="relative">
										<Input
											id="currentPassword"
											type={showCurrentPassword ? "text" : "password"}
											{...registerPassword("currentPassword")}
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() =>
												setShowCurrentPassword(!showCurrentPassword)
											}
										>
											{showCurrentPassword ? (
												<EyeOff className="h-4 w-4 text-gray-400" />
											) : (
												<Eye className="h-4 w-4 text-gray-400" />
											)}
										</button>
									</div>
									{passwordErrors.currentPassword && (
										<p className="text-sm text-red-600">
											{passwordErrors.currentPassword.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="newPassword">New Password</Label>
									<div className="relative">
										<Input
											id="newPassword"
											type={showNewPassword ? "text" : "password"}
											{...registerPassword("newPassword")}
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() => setShowNewPassword(!showNewPassword)}
										>
											{showNewPassword ? (
												<EyeOff className="h-4 w-4 text-gray-400" />
											) : (
												<Eye className="h-4 w-4 text-gray-400" />
											)}
										</button>
									</div>
									{passwordErrors.newPassword && (
										<p className="text-sm text-red-600">
											{passwordErrors.newPassword.message}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm New Password</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											{...registerPassword("confirmPassword")}
										/>
										<button
											type="button"
											className="absolute inset-y-0 right-0 pr-3 flex items-center"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4 text-gray-400" />
											) : (
												<Eye className="h-4 w-4 text-gray-400" />
											)}
										</button>
									</div>
									{passwordErrors.confirmPassword && (
										<p className="text-sm text-red-600">
											{passwordErrors.confirmPassword.message}
										</p>
									)}
								</div>
								<Button type="submit" disabled={isPasswordSubmitting}>
									{isPasswordSubmitting ? "Changing..." : "Change Password"}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Danger Zone</CardTitle>
							<CardDescription>
								Irreversible and destructive actions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Delete Account</h4>
										<p className="text-sm text-muted-foreground">
											Permanently delete your account and all associated data
										</p>
									</div>
									<Button variant="destructive" onClick={handleDeleteAccount}>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Account
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

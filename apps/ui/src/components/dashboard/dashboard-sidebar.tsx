import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	BarChart3,
	Key,
	LayoutDashboard,
	LogOutIcon,
	Settings,
	Activity,
	KeyRound,
	X,
	BotMessageSquare,
	BrainCircuit,
	FileText,
	MoreHorizontal,
	User as UserIcon,
	CreditCard,
	Shield,
	SunIcon,
	MoonIcon,
	ComputerIcon,
	Plus,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import { OrganizationSwitcher } from "./organization-switcher";
import { TopUpCreditsDialog } from "@/components/credits/top-up-credits-dialog";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/avatar";
import { Button } from "@/lib/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarMenuButton,
	SidebarRail,
	useSidebar,
	SidebarTrigger,
} from "@/lib/components/sidebar";
import { useDashboardContext } from "@/lib/dashboard-context";
import { DOCS_URL } from "@/lib/env";
import Logo from "@/lib/icons/Logo";
import { cn } from "@/lib/utils";

import type { Organization, User } from "@/lib/types";

// Configuration
const PROJECT_NAVIGATION = [
	{
		href: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
	},
	{
		href: "/dashboard/activity",
		label: "Activity",
		icon: Activity,
	},
	{
		href: "/dashboard/usage",
		label: "Usage & Metrics",
		icon: BarChart3,
	},
	{
		href: "/dashboard/api-keys",
		label: "API Keys",
		icon: Key,
	},
] as const;

const PROJECT_SETTINGS = [
	{
		href: "/dashboard/settings/preferences",
		label: "Preferences",
	},
] as const;

const ORGANIZATION_SETTINGS = [
	{
		href: "/dashboard/settings/billing",
		label: "Billing",
		search: { success: undefined, canceled: undefined },
	},
	{
		href: "/dashboard/settings/transactions",
		label: "Transactions",
	},
	{
		href: "/dashboard/settings/policies",
		label: "Policies",
	},
] as const;

const TOOLS_RESOURCES = [
	{
		href: "/dashboard/models",
		label: "Models",
		icon: BrainCircuit,
		internal: true,
	},
	{
		href: "/playground",
		label: "Playground",
		icon: BotMessageSquare,
		internal: false,
	},
	{
		href: DOCS_URL,
		label: "Docs",
		icon: FileText,
		internal: false,
	},
] as const;

const USER_MENU_ITEMS = [
	{
		href: "/dashboard/settings/account",
		label: "Account",
		icon: UserIcon,
	},
	{
		href: "/dashboard/settings/billing",
		label: "Billing",
		icon: CreditCard,
		search: { success: undefined, canceled: undefined },
	},
	{
		href: "/dashboard/settings/security",
		label: "Security",
		icon: Shield,
	},
] as const;

interface DashboardSidebarProps {
	organizations: Organization[];
	onSelectOrganization: (org: Organization | null) => void;
	onOrganizationCreated: (org: Organization) => void;
}

// Sub-components
function DashboardSidebarHeader({
	organizations,
	selectedOrganization,
	onSelectOrganization,
	onOrganizationCreated,
}: {
	organizations: Organization[];
	selectedOrganization: Organization | null;
	onSelectOrganization: (org: Organization | null) => void;
	onOrganizationCreated: (org: Organization) => void;
}) {
	return (
		<SidebarHeader>
			<div className="flex h-14 items-center px-4">
				<Link to="/dashboard" className="inline-flex items-center space-x-2">
					<Logo className="h-8 w-8 rounded-full text-black dark:text-white" />
					<span className="text-xl font-bold tracking-tight">LLM Gateway</span>
				</Link>
			</div>
			<OrganizationSwitcher
				organizations={organizations}
				selectedOrganization={selectedOrganization}
				onSelectOrganization={onSelectOrganization}
				onOrganizationCreated={onOrganizationCreated}
			/>
		</SidebarHeader>
	);
}

function NavigationItem({
	item,
	isActive,
	onClick,
}: {
	item: (typeof PROJECT_NAVIGATION)[number];
	isActive: (path: string) => boolean;
	onClick: () => void;
}) {
	return (
		<SidebarMenuItem>
			<Link
				to={item.href}
				className={cn(
					"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
					isActive(item.href)
						? "bg-primary/10 text-primary"
						: "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
				)}
				onClick={onClick}
			>
				<item.icon className="h-4 w-4" />
				<span>{item.label}</span>
			</Link>
		</SidebarMenuItem>
	);
}

function ProjectSettingsSection({
	isActive,
	isMobile,
	toggleSidebar,
}: {
	isActive: (path: string) => boolean;
	isMobile: boolean;
	toggleSidebar: () => void;
}) {
	return (
		<SidebarMenuItem>
			<div
				className={cn(
					"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
					isActive("/dashboard/settings/preferences")
						? "bg-primary/10 text-primary"
						: "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
				)}
			>
				<Settings className="h-4 w-4" />
				<span>Settings</span>
			</div>
			<SidebarMenuSub className="ml-7">
				{PROJECT_SETTINGS.map((item) => (
					<SidebarMenuSubItem key={item.href}>
						<SidebarMenuSubButton asChild isActive={isActive(item.href)}>
							<Link
								to={item.href}
								search={{ success: undefined, canceled: undefined }}
								onClick={() => {
									if (isMobile) {
										toggleSidebar();
									}
								}}
							>
								<span>{item.label}</span>
							</Link>
						</SidebarMenuSubButton>
					</SidebarMenuSubItem>
				))}
			</SidebarMenuSub>
		</SidebarMenuItem>
	);
}

function OrganizationSection({
	isActive,
	isMobile,
	toggleSidebar,
}: {
	isActive: (path: string) => boolean;
	isMobile: boolean;
	toggleSidebar: () => void;
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium">
				Organization
			</SidebarGroupLabel>
			<SidebarGroupContent className="mt-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<Link
							to="/dashboard/provider-keys"
							className={cn(
								"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
								isActive("/dashboard/provider-keys")
									? "bg-primary/10 text-primary"
									: "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
							)}
							onClick={() => {
								if (isMobile) {
									toggleSidebar();
								}
							}}
						>
							<KeyRound className="h-4 w-4" />
							<span>Provider Keys</span>
						</Link>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<div
							className={cn(
								"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
								isActive("/dashboard/settings/billing") ||
									isActive("/dashboard/settings/transactions") ||
									isActive("/dashboard/settings/policies")
									? "bg-primary/10 text-primary"
									: "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
							)}
						>
							<Settings className="h-4 w-4" />
							<span>Settings</span>
						</div>
						<SidebarMenuSub className="ml-7">
							{ORGANIZATION_SETTINGS.map((item) => (
								<SidebarMenuSubItem key={item.href}>
									<SidebarMenuSubButton asChild isActive={isActive(item.href)}>
										<Link
											to={item.href}
											{...("search" in item && item.search
												? { search: item.search }
												: {})}
											onClick={() => {
												if (isMobile) {
													toggleSidebar();
												}
											}}
										>
											<span>{item.label}</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							))}
						</SidebarMenuSub>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function ToolsResourcesSection({
	isActive,
	isMobile,
	toggleSidebar,
}: {
	isActive: (path: string) => boolean;
	isMobile: boolean;
	toggleSidebar: () => void;
}) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium">
				Tools & Resources
			</SidebarGroupLabel>
			<SidebarGroupContent className="mt-2">
				<SidebarMenu>
					{TOOLS_RESOURCES.map((item) => (
						<SidebarMenuItem key={item.href}>
							{item.internal ? (
								<Link
									to={item.href}
									className={cn(
										"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
										isActive(item.href)
											? "bg-primary/10 text-primary"
											: "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
									)}
									onClick={() => {
										if (isMobile) {
											toggleSidebar();
										}
									}}
								>
									<item.icon className="h-4 w-4" />
									<span>{item.label}</span>
								</Link>
							) : (
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(
										"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
										"text-foreground/70 hover:bg-accent hover:text-accent-foreground",
									)}
								>
									<item.icon className="h-4 w-4" />
									<span>{item.label}</span>
								</a>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

function ThemeSelect() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="px-2 py-1.5">
			<Select value={theme} onValueChange={setTheme}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select theme" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="light">
						<div className="flex items-center">
							<SunIcon className="mr-2 h-4 w-4" />
							Light
						</div>
					</SelectItem>
					<SelectItem value="dark">
						<div className="flex items-center">
							<MoonIcon className="mr-2 h-4 w-4" />
							Dark
						</div>
					</SelectItem>
					<SelectItem value="system">
						<div className="flex items-center">
							<ComputerIcon className="mr-2 h-4 w-4" />
							System
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}

function CreditsDisplay({
	selectedOrganization,
}: {
	selectedOrganization: Organization | null;
}) {
	const creditsBalance = selectedOrganization
		? Number(selectedOrganization.credits).toFixed(2)
		: "0.00";

	return (
		<div className="px-2 py-1.5">
			<TopUpCreditsDialog>
				<button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left">
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4 text-muted-foreground" />
						<div className="flex flex-col">
							<span className="text-sm font-medium">Credits</span>
							<span className="text-xs text-muted-foreground">
								${creditsBalance}
							</span>
						</div>
					</div>
					<Plus className="h-4 w-4 text-muted-foreground ml-auto" />
				</button>
			</TopUpCreditsDialog>
		</div>
	);
}

function UserDropdownMenu({
	user,
	isMobile,
	toggleSidebar,
	onLogout,
}: {
	user: User;
	isMobile: boolean;
	toggleSidebar: () => void;
	onLogout: () => void;
}) {
	const getUserInitials = () => {
		if (user?.name) {
			return user.name
				.split(" ")
				.slice(0, 2)
				.map((n: string) => n[0])
				.join("")
				.toUpperCase();
		}
		return user?.email ? user.email[0].toUpperCase() : "U";
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg border">
								<AvatarImage
									src="/vibrant-street-market.png"
									alt={user?.name || "User"}
								/>
								<AvatarFallback className="rounded-lg">
									{getUserInitials()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user?.name}</span>
								<span className="text-muted-foreground truncate text-xs">
									{user?.email}
								</span>
							</div>
							<MoreHorizontal className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg border">
									<AvatarImage
										src="/vibrant-street-market.png"
										alt={user?.name || "User"}
									/>
									<AvatarFallback className="rounded-lg">
										{getUserInitials()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user?.name}</span>
									<span className="text-muted-foreground truncate text-xs">
										{user?.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<ThemeSelect />
							{USER_MENU_ITEMS.map((item) => (
								<DropdownMenuItem key={item.href} asChild>
									<Link
										to={item.href}
										{...("search" in item && item.search
											? { search: item.search }
											: {})}
										onClick={() => {
											if (isMobile) {
												toggleSidebar();
											}
										}}
									>
										<item.icon className="mr-2 h-4 w-4" />
										{item.label}
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onLogout}>
							<LogOutIcon className="mr-2 h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function UpgradeCTA({
	show,
	onHide,
	selectedOrganization,
}: {
	show: boolean;
	onHide: () => void;
	selectedOrganization: Organization | null;
}) {
	if (!show || !selectedOrganization || selectedOrganization.plan === "pro") {
		return null;
	}

	return (
		<div className="flex relative flex-col items-start space-y-4 rounded-lg bg-primary/5 p-4 dark:bg-primary/10">
			<button
				aria-label="Dismiss"
				onClick={onHide}
				className="absolute right-1.5 top-1.5 rounded-full p-1 text-muted-foreground/70 hover:text-foreground transition"
			>
				<X className="h-3 w-3" />
			</button>
			<div>
				<p className="text-sm font-medium">Upgrade to Pro</p>
				<p className="text-xs text-muted-foreground">
					0% fees on all API calls & more
				</p>
			</div>
			<Button asChild>
				<Link
					to="/dashboard/settings/billing"
					search={{ success: undefined, canceled: undefined }}
				>
					Upgrade
				</Link>
			</Button>
		</div>
	);
}

// Main component
export function DashboardSidebar({
	organizations,
	onSelectOrganization,
	onOrganizationCreated,
}: DashboardSidebarProps) {
	const queryClient = useQueryClient();
	const { location } = useRouterState();
	const { toggleSidebar, state: sidebarState, isMobile } = useSidebar();
	const { user } = useUser();
	const { selectedOrganization } = useDashboardContext();
	const navigate = useNavigate();
	const posthog = usePostHog();

	const isActive = (path: string) => location.pathname === path;

	const [showCreditCTA, setShowCreditCTA] = useState(() => {
		if (typeof window === "undefined") {
			return true;
		}
		return localStorage.getItem("hide-credit-cta") !== "true";
	});

	const hideCreditCTA = () => {
		localStorage.setItem("hide-credit-cta", "true");
		setShowCreditCTA(false);
	};

	const logout = async () => {
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

	const handleNavClick = () => {
		if (isMobile) {
			toggleSidebar();
		}
	};

	return (
		<>
			{sidebarState === "collapsed" && <SidebarTrigger />}
			<Sidebar variant="floating">
				<DashboardSidebarHeader
					organizations={organizations}
					selectedOrganization={selectedOrganization}
					onSelectOrganization={onSelectOrganization}
					onOrganizationCreated={onOrganizationCreated}
				/>

				<SidebarContent className="px-2 py-4">
					{/* Project Section */}
					<SidebarGroup>
						<SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-medium">
							Project
						</SidebarGroupLabel>
						<SidebarGroupContent className="mt-2">
							<SidebarMenu>
								{PROJECT_NAVIGATION.map((item) => (
									<NavigationItem
										key={item.href}
										item={item}
										isActive={isActive}
										onClick={handleNavClick}
									/>
								))}
								<ProjectSettingsSection
									isActive={isActive}
									isMobile={isMobile}
									toggleSidebar={toggleSidebar}
								/>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<OrganizationSection
						isActive={isActive}
						isMobile={isMobile}
						toggleSidebar={toggleSidebar}
					/>

					<ToolsResourcesSection
						isActive={isActive}
						isMobile={isMobile}
						toggleSidebar={toggleSidebar}
					/>
				</SidebarContent>

				<SidebarFooter className="border-t">
					<UpgradeCTA
						show={showCreditCTA}
						onHide={hideCreditCTA}
						selectedOrganization={selectedOrganization}
					/>
					<CreditsDisplay selectedOrganization={selectedOrganization} />
					<UserDropdownMenu
						user={user}
						isMobile={isMobile}
						toggleSidebar={toggleSidebar}
						onLogout={logout}
					/>
				</SidebarFooter>

				<SidebarRail />
			</Sidebar>
		</>
	);
}

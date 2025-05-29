import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ChevronUp, Settings, User2 } from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/auth-client";
import { Badge } from "@/lib/components/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/lib/components/sidebar";

// Menu items.
const items = [
	{
		title: "Users",
		url: "/dashboard",
		icon: User2,
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings,
	},
];

export function AppSidebar() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { user, isLoading } = useUser({
		redirectTo: "/login",
		redirectWhen: "unauthenticated",
	});

	const logout = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					queryClient.clear();
					navigate({ to: "/login" });
				},
			},
		});
	};

	return (
		<Sidebar variant="floating" collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>
						Social Worker Media <Badge className="ml-2">Admin</Badge>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url} className="flex items-center gap-2">
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 /> {isLoading ? "..." : user?.name || "User"}
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								className="w-[--radix-popper-anchor-width]"
							>
								<DropdownMenuItem onClick={logout}>
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

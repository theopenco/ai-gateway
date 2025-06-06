import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	Plus,
	MessageSquare,
	Edit2,
	Trash2,
	LogOutIcon,
	MoreVerticalIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

import { ModeToggle } from "../mode-toggle";
import {
	useChats,
	useDeleteChat,
	useUpdateChat,
	type Chat,
} from "@/hooks/useChats";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/lib/components/avatar";
import { Button } from "@/lib/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import { Input } from "@/lib/components/input";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/lib/components/sidebar";
import { toast } from "@/lib/components/use-toast";
import Logo from "@/lib/icons/Logo";

interface ChatSidebarProps {
	currentChatId?: string;
	onChatSelect?: (chatId: string) => void;
	onNewChat?: () => void;
	userApiKey: string | null;
}

export function ChatSidebar({
	currentChatId,
	onChatSelect,
	onNewChat,
	userApiKey,
}: ChatSidebarProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const posthog = usePostHog();
	const { user } = useUser();

	// Use real chat data from API
	const { data: chatsData, isLoading } = useChats();
	const deleteChat = useDeleteChat();
	const updateChat = useUpdateChat();

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");

	const chats = chatsData?.chats || [];

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

	const handleEditTitle = (chat: Chat) => {
		setEditingId(chat.id);
		setEditTitle(chat.title);
	};

	const saveTitle = (chatId: string) => {
		if (editTitle.trim()) {
			updateChat.mutate({
				id: chatId,
				data: { title: editTitle.trim() },
			});
		}
		setEditingId(null);
		setEditTitle("");
	};

	const handleDeleteChat = (chatId: string) => {
		if (!userApiKey) {
			toast({
				title: "API Key Required",
				description: "You must provide an API key to delete chats.",
				variant: "destructive",
			});
			return;
		}

		deleteChat.mutate(chatId);
		if (currentChatId === chatId) {
			onChatSelect?.("");
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return "Just now";
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else if (diffInHours < 48) {
			return "Yesterday";
		} else {
			return format(date, "MMM d");
		}
	};

	const groupChatsByDate = (chats: Chat[]) => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const lastWeek = new Date(today);
		lastWeek.setDate(lastWeek.getDate() - 7);

		const groups = {
			today: [] as Chat[],
			yesterday: [] as Chat[],
			lastWeek: [] as Chat[],
			older: [] as Chat[],
		};

		chats.forEach((chat) => {
			const chatDate = new Date(chat.updatedAt);
			if (chatDate.toDateString() === today.toDateString()) {
				groups.today.push(chat);
			} else if (chatDate.toDateString() === yesterday.toDateString()) {
				groups.yesterday.push(chat);
			} else if (chatDate >= lastWeek) {
				groups.lastWeek.push(chat);
			} else {
				groups.older.push(chat);
			}
		});

		return groups;
	};

	const chatGroups = groupChatsByDate(
		[...chats].sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		),
	);

	const renderChatGroup = (title: string, chats: Chat[]) => {
		if (chats.length === 0) {
			return null;
		}

		return (
			<div key={title} className="mb-4">
				<div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
					{title}
				</div>
				<div className="space-y-1">
					{chats.map((chat) => (
						<SidebarMenuItem key={chat.id}>
							<SidebarMenuButton
								isActive={currentChatId === chat.id}
								onClick={() => onChatSelect?.(chat.id)}
								className="w-full justify-start gap-3 group relative pr-10 py-6"
							>
								<MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
								{editingId === chat.id ? (
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onBlur={() => saveTitle(chat.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												saveTitle(chat.id);
											}
											if (e.key === "Escape") {
												setEditingId(null);
												setEditTitle("");
											}
										}}
										className="h-7 text-sm border-none px-1 focus-visible:ring-0 bg-transparent"
										autoFocus
									/>
								) : (
									<div className="flex-1 min-w-0">
										<div className="truncate text-sm font-medium mb-0.5">
											{chat.title}
										</div>
										<div className="text-xs text-muted-foreground">
											{chat.messageCount} messages •{" "}
											{formatDate(chat.updatedAt)}
										</div>
									</div>
								)}

								{/* Action buttons */}
								{currentChatId === chat.id && editingId !== chat.id && (
									<div className="absolute right-0 top-2 bottom-0">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<SidebarMenuAction
													onClick={(e) => {
														e.stopPropagation();
													}}
													className="h-7 w-7 cursor-pointer"
												>
													<MoreVerticalIcon className="h-3.5 w-3.5" />
												</SidebarMenuAction>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-48">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														handleEditTitle(chat);
													}}
													className="flex items-center gap-2"
												>
													<Edit2 className="h-4 w-4" />
													Rename
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteChat(chat.id);
													}}
													className="flex items-center gap-2 text-destructive focus:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</div>
			</div>
		);
	};

	if (isLoading) {
		return (
			<Sidebar className="border-r w-80">
				<SidebarHeader className="p-4 border-b">
					<Button
						onClick={onNewChat}
						className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
					>
						<Plus className="h-4 w-4" />
						New Chat
					</Button>
				</SidebarHeader>
				<SidebarContent className="px-2 py-4">
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-muted-foreground">
							Loading chats...
						</div>
					</div>
				</SidebarContent>
			</Sidebar>
		);
	}

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex flex-col items-center gap-4 mb-4">
					<Link to="/" className="flex self-start items-center gap-2 my-2">
						<Logo className="h-10 w-10" />
						<h1 className="text-xl font-semibold">LLM Gateway</h1>
					</Link>
					<Button
						variant="outline"
						className="w-full flex items-center gap-2"
						onClick={onNewChat}
					>
						<Plus className="h-4 w-4" />
						New Chat
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="px-2 py-4">
				<SidebarMenu>
					{renderChatGroup("Today", chatGroups.today)}
					{renderChatGroup("Yesterday", chatGroups.yesterday)}
					{renderChatGroup("Last 7 days", chatGroups.lastWeek)}
					{renderChatGroup("Older", chatGroups.older)}

					{chats.length === 0 && (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-sm text-muted-foreground mb-2">
								No chat history
							</p>
							<p className="text-xs text-muted-foreground">
								Start a new conversation to see it here
							</p>
						</div>
					)}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className="border-t">
				<div className="flex items-center justify-between p-4 pt-0">
					<div className="flex items-center gap-3">
						<Avatar className="border-border h-9 w-9 border">
							<AvatarFallback className="bg-muted">AU</AvatarFallback>
						</Avatar>
						<div className="text-sm">
							<div className="flex items-center gap-2 font-medium">
								{user?.name}
								<LogOutIcon
									className="cursor-pointer"
									size={14}
									onClick={logout}
								/>
							</div>
							<div className="text-xs text-muted-foreground">{user?.email}</div>
						</div>
					</div>
					<ModeToggle />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}

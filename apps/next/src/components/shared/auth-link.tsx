import Link from "next/link";

import { useUser } from "@/hooks/useUser";

export function AuthLink(props: Omit<React.ComponentProps<typeof Link>, "to">) {
	const { user, isLoading } = useUser();
	return (
		<Link {...props} href={user && !isLoading ? "/dashboard" : "/signup"} />
	);
}

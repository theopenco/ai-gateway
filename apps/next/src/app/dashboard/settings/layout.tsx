"use client";

import type { ReactNode } from "react";
import { SettingsLoading } from "@/components/settings/settings-loading";

interface SettingsLayoutProps {
	children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	return children;
}

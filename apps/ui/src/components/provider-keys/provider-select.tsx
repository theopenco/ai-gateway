import { providerLogoComponents } from "@/components/provider-keys/provider-logo";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";

import type { ProviderId } from "@llmgateway/models";

interface Provider {
	id: string;
	name: string;
}

interface ProviderSelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	providers: Provider[];
	loading?: boolean;
	placeholder?: string;
	emptyMessage?: string;
	disabled?: boolean;
}

export function ProviderSelect({
	value,
	onValueChange,
	providers,
	loading = false,
	placeholder = "Select provider...",
	emptyMessage = "All providers already have keys",
	disabled = false,
}: ProviderSelectProps) {
	return (
		<Select onValueChange={onValueChange} value={value} disabled={disabled}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{loading ? (
					<SelectItem value="loading" disabled>
						Loading providers...
					</SelectItem>
				) : providers.length > 0 ? (
					providers.map((provider) => {
						const Logo = providerLogoComponents[provider.id as ProviderId];
						return (
							<SelectItem key={provider.id} value={provider.id}>
								<div className="flex items-center gap-2">
									{Logo && (
										<Logo className="h-4 w-4 text-black dark:text-white" />
									)}
									<span>{provider.name}</span>
								</div>
							</SelectItem>
						);
					})
				) : (
					<SelectItem value="none" disabled>
						{emptyMessage}
					</SelectItem>
				)}
			</SelectContent>
		</Select>
	);
}

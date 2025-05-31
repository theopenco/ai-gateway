import { Copy } from "lucide-react";

import { Button } from "@/lib/components/button";

export default function CodeExample() {
	return (
		<section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl font-bold tracking-tight mb-6 text-center text-zinc-900 dark:text-white">
						Simple Integration
					</h2>

					<p className="text-zinc-600 dark:text-zinc-400 text-center mb-10">
						Just change your API endpoint and keep your existing code.
					</p>

					<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm">
						<div className="flex items-center justify-between bg-zinc-200 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-300 dark:border-zinc-700">
							<span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
								API Request
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
							>
								<Copy className="h-4 w-4 mr-1" />
								Copy
							</Button>
						</div>

						<pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-zinc-800 dark:text-zinc-100">
							<code>
								{`curl -X POST https://api.llmgateway.io/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $LLM_GATEWAY_API_KEY" \\
  -d '{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ]
}'`}
							</code>
						</pre>
					</div>

					<p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
						LLM Gateway routes your request to the appropriate provider while
						tracking usage and performance.
					</p>
				</div>
			</div>
		</section>
	);
}

export interface ErrorDetails {
	statusCode: number;
	statusText: string;
	responseText: string;
}

export interface Log {
	id: string;
	createdAt: string;
	updatedAt: string;
	projectId: string;
	apiKeyId: string;
	providerKeyId: string;
	duration: number;
	requestedModel: string;
	requestedProvider: string;
	usedModel: string;
	usedProvider: string;
	responseSize: number;
	content: string;
	finishReason: string;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	messages: { content: string; role: string }[];
	temperature: number;
	maxTokens: number;
	topP: number;
	frequencyPenalty: number;
	presencePenalty: number;
	// Cost information
	cost?: number;
	inputCost?: number;
	outputCost?: number;
	// Error information
	hasError?: boolean;
	errorDetails?: ErrorDetails;
}

// Alias for backward compatibility
export type ActivityLog = Log;

import type { ZodSchema } from "zod";

// =============================================================================
// CHAT MESSAGE TYPES
// =============================================================================

/** Role of the message sender */
export type ChatMessageRole = "system" | "user" | "assistant";

/** Chat message structure for OpenRouter API */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

// =============================================================================
// JSON SCHEMA TYPES
// =============================================================================

/** JSON Schema type for response_format */
export type JsonSchemaType = "object" | "array" | "string" | "number" | "boolean" | "integer" | "null";

/** JSON Schema definition for structured outputs */
export interface JsonSchema {
  type: JsonSchemaType;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: (string | number | boolean)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: boolean;
  description?: string;
}

/** JSON Schema response format for OpenRouter API */
export interface JsonSchemaResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: JsonSchema;
  };
}

// =============================================================================
// OPENROUTER REQUEST TYPES
// =============================================================================

/** Request body for OpenRouter chat completions API */
export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?: JsonSchemaResponseFormat;
  stream?: false;
}

// =============================================================================
// OPENROUTER RESPONSE TYPES
// =============================================================================

/** Finish reason for a completion choice */
export type FinishReason = "stop" | "length" | "content_filter" | "tool_calls";

/** Raw response from OpenRouter API */
export interface OpenRouterRawResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: FinishReason;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// =============================================================================
// SERVICE CONFIGURATION TYPES
// =============================================================================

/** Configuration options for OpenRouterService */
export interface OpenRouterConfig {
  /** API key for OpenRouter (required) */
  apiKey: string;
  /** Base URL for OpenRouter API */
  baseUrl?: string;
  /** Default model to use for completions */
  defaultModel?: string;
  /** Default temperature (0-2) */
  defaultTemperature?: number;
  /** Default max tokens for completions */
  defaultMaxTokens?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum retry attempts for transient errors */
  maxRetries?: number;
}

/** Default configuration values */
export const DEFAULT_OPENROUTER_CONFIG = {
  baseUrl: "https://openrouter.ai/api/v1",
  defaultModel: "openai/gpt-4o-mini",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  timeout: 30000,
  maxRetries: 3,
} as const;

// =============================================================================
// CHAT COMPLETION OPTIONS
// =============================================================================

/** Response format configuration with optional Zod validator */
export interface ResponseFormat<T> {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: JsonSchema;
  };
  /** Optional Zod schema for runtime validation of parsed response */
  validator?: ZodSchema<T>;
}

/** Options for chatCompletion method */
export interface ChatCompletionOptions<T = string> {
  /** System message defining AI behavior */
  systemMessage: string;
  /** User message/prompt */
  userMessage: string;
  /** Model override (uses default if not specified) */
  model?: string;
  /** Temperature override (0-2) */
  temperature?: number;
  /** Max tokens override */
  maxTokens?: number;
  /** Top-p sampling (0-1) */
  topP?: number;
  /** Frequency penalty (-2 to 2) */
  frequencyPenalty?: number;
  /** Presence penalty (-2 to 2) */
  presencePenalty?: number;
  /** Structured output format with JSON schema */
  responseFormat?: ResponseFormat<T>;
  /** User ID for rate limiting and logging */
  userId?: string;
}

// =============================================================================
// CHAT COMPLETION RESULT
// =============================================================================

/** Token usage statistics */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Result from chatCompletion method */
export interface ChatCompletionResult<T> {
  /** Parsed response content (string or structured object) */
  content: T;
  /** Token usage statistics */
  usage: TokenUsage;
  /** Model used for completion */
  model: string;
  /** Reason the completion finished */
  finishReason: FinishReason;
  /** Unique request ID from OpenRouter */
  requestId: string;
  /** Latency in milliseconds */
  latencyMs: number;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/** Error codes for OpenRouter service errors */
export type OpenRouterErrorCode =
  | "CONFIGURATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "RATE_LIMIT_ERROR"
  | "QUOTA_EXCEEDED"
  | "INVALID_REQUEST"
  | "MODEL_NOT_FOUND"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "JSON_PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "EMPTY_RESPONSE"
  | "CONTENT_FILTER"
  | "CONTEXT_LENGTH_EXCEEDED";

// =============================================================================
// MODEL INFO TYPES
// =============================================================================

/** Pricing information for a model */
export interface ModelPricing {
  /** Price per 1M prompt tokens in USD */
  prompt: number;
  /** Price per 1M completion tokens in USD */
  completion: number;
}

/** Information about an available model */
export interface ModelInfo {
  id: string;
  name: string;
  contextLength: number;
  pricing: ModelPricing;
}

/** Known model pricing (approximate, may change) */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  "openai/gpt-4o-mini": { prompt: 0.15, completion: 0.6 },
  "openai/gpt-4o": { prompt: 2.5, completion: 10 },
  "openai/gpt-4-turbo": { prompt: 10, completion: 30 },
  "anthropic/claude-3.5-sonnet": { prompt: 3, completion: 15 },
  "anthropic/claude-3-opus": { prompt: 15, completion: 75 },
  "anthropic/claude-3-haiku": { prompt: 0.25, completion: 1.25 },
  "google/gemini-pro-1.5": { prompt: 2.5, completion: 7.5 },
  "meta-llama/llama-3.1-70b-instruct": { prompt: 0.52, completion: 0.75 },
};

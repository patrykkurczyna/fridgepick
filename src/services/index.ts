import { OpenRouterService } from "./OpenRouterService";

// =============================================================================
// RUNTIME ENVIRONMENT HELPER
// =============================================================================

/**
 * Type for Cloudflare runtime environment variables
 */
export interface RuntimeEnv {
  OPENROUTER_API_KEY?: string;
  ENABLE_AI_RECOMMENDATIONS?: string;
  [key: string]: string | undefined;
}

/**
 * Gets an environment variable with support for both Cloudflare Workers runtime
 * and local development (import.meta.env).
 *
 * In Cloudflare Workers, non-PUBLIC env vars must be accessed via runtime context.
 * In local development, they come from import.meta.env.
 *
 * @param name - Environment variable name
 * @param runtimeEnv - Optional runtime env from Cloudflare (locals.runtime.env)
 * @returns The environment variable value or undefined
 */
export function getEnvVar(name: string, runtimeEnv?: RuntimeEnv): string | undefined {
  // First try Cloudflare runtime env (for production)
  if (runtimeEnv?.[name]) {
    return runtimeEnv[name];
  }
  // Then fallback to import.meta.env (for local development)
  return (import.meta.env as Record<string, string | undefined>)[name];
}

// =============================================================================
// FEATURE FLAG CONFIGURATION
// =============================================================================

/**
 * AI Recommendations feature flag modes:
 * - "enabled"   : AI is always enabled (uses OpenRouter API)
 * - "disabled"  : AI is always disabled (uses dummy data)
 * - "not_demo"  : AI is enabled only for non-demo users (demo users get dummy data)
 */
export type AIFeatureFlagMode = "enabled" | "disabled" | "not_demo";

/**
 * Gets the current AI feature flag mode from environment.
 * Defaults to "not_demo" if not set (safe default - saves API credits for demo).
 *
 * @param runtimeEnv - Optional runtime env from Cloudflare (locals.runtime.env)
 */
export function getAIFeatureFlagMode(runtimeEnv?: RuntimeEnv): AIFeatureFlagMode {
  const envValue = getEnvVar("ENABLE_AI_RECOMMENDATIONS", runtimeEnv)?.toLowerCase().trim();

  switch (envValue) {
    case "true":
    case "enabled":
    case "1":
      return "enabled";
    case "false":
    case "disabled":
    case "0":
      return "disabled";
    case "not_demo":
    case "not-demo":
    case "notdemo":
      return "not_demo";
    default:
      // Default: AI disabled for demo users to save credits
      return "not_demo";
  }
}

/**
 * Checks if AI recommendations should be used for a given user.
 *
 * @param isDemo - Whether the user is a demo user
 * @param runtimeEnv - Optional runtime env from Cloudflare (locals.runtime.env)
 * @returns boolean - true if AI should be used, false for dummy data
 *
 * @example
 * const useAI = shouldUseAI(user.isDemo, locals.runtime?.env);
 * if (useAI) {
 *   // Call OpenRouter API
 * } else {
 *   // Return dummy recommendations
 * }
 */
export function shouldUseAI(isDemo: boolean, runtimeEnv?: RuntimeEnv): boolean {
  const mode = getAIFeatureFlagMode(runtimeEnv);

  switch (mode) {
    case "enabled":
      return true;
    case "disabled":
      return false;
    case "not_demo":
      return !isDemo; // AI enabled only for non-demo users
    default:
      return !isDemo;
  }
}

/**
 * Checks if OpenRouter is properly configured.
 * Returns false if API key is missing.
 *
 * @param runtimeEnv - Optional runtime env from Cloudflare (locals.runtime.env)
 */
export function isOpenRouterConfigured(runtimeEnv?: RuntimeEnv): boolean {
  const apiKey = getEnvVar("OPENROUTER_API_KEY", runtimeEnv);
  return !!apiKey?.trim();
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let openRouterInstance: OpenRouterService | null = null;
let lastApiKey: string | null = null;

/**
 * Gets the OpenRouter service singleton instance.
 * Lazily initializes the service on first call.
 *
 * @param runtimeEnv - Optional runtime env from Cloudflare (locals.runtime.env)
 * @throws Error if OPENROUTER_API_KEY is not configured
 *
 * @example
 * const openRouter = getOpenRouterService(locals.runtime?.env);
 * const result = await openRouter.chatCompletion({
 *   systemMessage: "...",
 *   userMessage: "...",
 * });
 */
export function getOpenRouterService(runtimeEnv?: RuntimeEnv): OpenRouterService {
  const apiKey = getEnvVar("OPENROUTER_API_KEY", runtimeEnv);

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not set. " +
        "Please add it to your .env file or disable AI with ENABLE_AI_RECOMMENDATIONS=disabled"
    );
  }

  // Recreate instance if API key changed (supports different runtime contexts)
  if (!openRouterInstance || lastApiKey !== apiKey) {
    openRouterInstance = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini",
      defaultTemperature: 0.3, // Lower temperature for more consistent recommendations
      defaultMaxTokens: 2048,
      timeout: 30000,
      maxRetries: 3,
    });
    lastApiKey = apiKey;
  }

  return openRouterInstance;
}

/**
 * Resets the OpenRouter service instance.
 * Useful for testing or when configuration changes.
 */
export function resetOpenRouterService(): void {
  openRouterInstance = null;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { OpenRouterService } from "./OpenRouterService";
export { OpenRouterError } from "./errors/OpenRouterError";

// Re-export types for convenience
export type {
  OpenRouterConfig,
  ChatCompletionOptions,
  ChatCompletionResult,
  ResponseFormat,
  JsonSchema,
  TokenUsage,
  OpenRouterErrorCode,
} from "@/types/openrouter";

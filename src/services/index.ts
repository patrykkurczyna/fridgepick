import { OpenRouterService } from "./OpenRouterService";

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
 */
export function getAIFeatureFlagMode(): AIFeatureFlagMode {
  const envValue = import.meta.env.ENABLE_AI_RECOMMENDATIONS?.toLowerCase().trim();

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
 * @returns boolean - true if AI should be used, false for dummy data
 *
 * @example
 * const useAI = shouldUseAI(user.isDemo);
 * if (useAI) {
 *   // Call OpenRouter API
 * } else {
 *   // Return dummy recommendations
 * }
 */
export function shouldUseAI(isDemo: boolean): boolean {
  const mode = getAIFeatureFlagMode();

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
 */
export function isOpenRouterConfigured(): boolean {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  return !!apiKey?.trim();
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let openRouterInstance: OpenRouterService | null = null;

/**
 * Gets the OpenRouter service singleton instance.
 * Lazily initializes the service on first call.
 *
 * @throws Error if OPENROUTER_API_KEY is not configured
 *
 * @example
 * const openRouter = getOpenRouterService();
 * const result = await openRouter.chatCompletion({
 *   systemMessage: "...",
 *   userMessage: "...",
 * });
 */
export function getOpenRouterService(): OpenRouterService {
  if (!openRouterInstance) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY environment variable is not set. " +
          "Please add it to your .env file or disable AI with ENABLE_AI_RECOMMENDATIONS=disabled"
      );
    }

    openRouterInstance = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini",
      defaultTemperature: 0.3, // Lower temperature for more consistent recommendations
      defaultMaxTokens: 2048,
      timeout: 30000,
      maxRetries: 3,
    });
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

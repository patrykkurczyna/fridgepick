import type { ZodSchema } from "zod";
import type {
  OpenRouterConfig,
  OpenRouterRequest,
  OpenRouterRawResponse,
  ChatCompletionOptions,
  ChatCompletionResult,
  ChatMessage,
  ModelPricing,
} from "@/types/openrouter";
import { DEFAULT_OPENROUTER_CONFIG, MODEL_PRICING } from "@/types/openrouter";
import { OpenRouterError } from "./errors/OpenRouterError";

/**
 * Service for interacting with OpenRouter API.
 * Handles chat completions, retries, and error handling.
 */
export class OpenRouterService {
  private readonly config: Required<OpenRouterConfig>;
  private readonly userRequestCounts = new Map<string, { count: number; resetAt: number }>();

  constructor(config: OpenRouterConfig) {
    this.validateConfig(config);
    this.config = {
      ...DEFAULT_OPENROUTER_CONFIG,
      ...config,
    } as Required<OpenRouterConfig>;
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Performs a chat completion request to OpenRouter.
   *
   * @param options - Chat completion options including messages and parameters
   * @returns Promise with the completion result including parsed content
   * @throws OpenRouterError for various error conditions
   *
   * @example
   * // Simple text completion
   * const result = await service.chatCompletion({
   *   systemMessage: "You are a helpful assistant.",
   *   userMessage: "Hello!",
   * });
   *
   * @example
   * // Structured JSON output with validation
   * const result = await service.chatCompletion<MyType>({
   *   systemMessage: "Respond in JSON.",
   *   userMessage: "List items.",
   *   responseFormat: {
   *     type: "json_schema",
   *     json_schema: { name: "items", strict: true, schema: mySchema },
   *     validator: myZodSchema,
   *   },
   * });
   */
  async chatCompletion<T = string>(options: ChatCompletionOptions<T>): Promise<ChatCompletionResult<T>> {
    this.validateInput(options);

    if (options.userId) {
      this.checkUserRateLimit(options.userId);
    }

    const request = this.buildRequest(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(() => this.sendRequest(request));

    const latencyMs = Date.now() - startTime;
    const content = this.parseResponse<T>(response, options.responseFormat?.validator);

    return {
      content,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      model: response.model,
      finishReason: response.choices[0].finish_reason,
      requestId: response.id,
      latencyMs,
    };
  }

  /**
   * Checks if the OpenRouter API is accessible.
   *
   * @returns Promise<boolean> - true if API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Estimates the cost of a request in USD.
   *
   * @param promptTokens - Number of prompt tokens
   * @param completionTokens - Number of completion tokens
   * @param model - Model to use for pricing (defaults to configured model)
   * @returns Estimated cost in USD
   */
  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const modelId = model ?? this.config.defaultModel;
    const pricing: ModelPricing = MODEL_PRICING[modelId] ?? MODEL_PRICING["openai/gpt-4o-mini"];

    return (promptTokens * pricing.prompt + completionTokens * pricing.completion) / 1_000_000;
  }

  /**
   * Gets the current configuration (without sensitive data).
   */
  getConfig(): Omit<Required<OpenRouterConfig>, "apiKey"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKey: _apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  // ==========================================================================
  // PRIVATE METHODS - Configuration & Validation
  // ==========================================================================

  private validateConfig(config: OpenRouterConfig): void {
    if (!config.apiKey?.trim()) {
      throw new OpenRouterError(
        "API key is required. Set OPENROUTER_API_KEY environment variable.",
        "CONFIGURATION_ERROR",
        500
      );
    }

    if (config.defaultTemperature !== undefined) {
      if (config.defaultTemperature < 0 || config.defaultTemperature > 2) {
        throw new OpenRouterError("Temperature must be between 0 and 2.", "CONFIGURATION_ERROR", 400);
      }
    }

    if (config.defaultMaxTokens !== undefined) {
      if (config.defaultMaxTokens < 1 || config.defaultMaxTokens > 128000) {
        throw new OpenRouterError("Max tokens must be between 1 and 128000.", "CONFIGURATION_ERROR", 400);
      }
    }

    if (config.timeout !== undefined) {
      if (config.timeout < 1000 || config.timeout > 120000) {
        throw new OpenRouterError("Timeout must be between 1000 and 120000 milliseconds.", "CONFIGURATION_ERROR", 400);
      }
    }
  }

  private validateInput<T>(options: ChatCompletionOptions<T>): void {
    if (!options.systemMessage?.trim()) {
      throw new OpenRouterError("System message cannot be empty", "INVALID_REQUEST", 400);
    }

    if (!options.userMessage?.trim()) {
      throw new OpenRouterError("User message cannot be empty", "INVALID_REQUEST", 400);
    }

    const maxLength = 50000;
    if (options.userMessage.length > maxLength) {
      throw new OpenRouterError(
        `User message exceeds maximum length of ${maxLength} characters`,
        "INVALID_REQUEST",
        400
      );
    }

    if (options.temperature !== undefined) {
      if (options.temperature < 0 || options.temperature > 2) {
        throw new OpenRouterError("Temperature must be between 0 and 2", "INVALID_REQUEST", 400);
      }
    }
  }

  // ==========================================================================
  // PRIVATE METHODS - Request Building
  // ==========================================================================

  private buildRequest<T>(options: ChatCompletionOptions<T>): OpenRouterRequest {
    const messages: ChatMessage[] = [
      { role: "system", content: options.systemMessage },
      { role: "user", content: options.userMessage },
    ];

    const request: OpenRouterRequest = {
      model: options.model ?? this.config.defaultModel,
      messages,
      temperature: options.temperature ?? this.config.defaultTemperature,
      max_tokens: options.maxTokens ?? this.config.defaultMaxTokens,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stream: false,
    };

    if (options.responseFormat) {
      request.response_format = {
        type: options.responseFormat.type,
        json_schema: options.responseFormat.json_schema,
      };
    }

    return request;
  }

  // ==========================================================================
  // PRIVATE METHODS - HTTP Communication
  // ==========================================================================

  private async sendRequest(request: OpenRouterRequest): Promise<OpenRouterRawResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          "HTTP-Referer": "https://fridgepick.app",
          "X-Title": "FridgePick",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw this.mapHttpError(response.status, errorBody);
      }

      return (await response.json()) as OpenRouterRawResponse;
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterError(`Request timeout after ${this.config.timeout}ms`, "NETWORK_ERROR", 408);
      }
      throw new OpenRouterError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "NETWORK_ERROR",
        500
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ==========================================================================
  // PRIVATE METHODS - Retry Logic
  // ==========================================================================

  private async executeWithRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry = this.isRetryableError(error) && attempt < this.config.maxRetries;

      if (!shouldRetry) {
        throw error;
      }

      const delay = this.calculateBackoff(attempt);
      console.info(`[OpenRouterService] Retry attempt ${attempt}/${this.config.maxRetries} after ${delay}ms`);

      await this.sleep(delay);
      return this.executeWithRetry(fn, attempt + 1);
    }
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    // Add jitter (0-25% random delay)
    const jitter = Math.random() * exponentialDelay * 0.25;
    return exponentialDelay + jitter;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof OpenRouterError) {
      return error.isRetryable();
    }
    // Retry for network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return true;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // PRIVATE METHODS - Response Parsing
  // ==========================================================================

  private parseResponse<T>(raw: OpenRouterRawResponse, validator?: ZodSchema<T>): T {
    const choice = raw.choices[0];

    if (!choice) {
      throw new OpenRouterError("No choices in OpenRouter response", "EMPTY_RESPONSE", 500);
    }

    if (choice.finish_reason === "content_filter") {
      throw new OpenRouterError("Response blocked by content filter", "CONTENT_FILTER", 400);
    }

    if (choice.finish_reason === "length") {
      console.warn("[OpenRouterService] Response was truncated due to max_tokens limit");
    }

    const content = choice.message?.content;

    if (!content) {
      throw new OpenRouterError("Empty content in OpenRouter response", "EMPTY_RESPONSE", 500);
    }

    // If no validator, return content as-is (cast to T)
    if (!validator) {
      return content as T;
    }

    // Parse JSON and validate with Zod
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new OpenRouterError(`Invalid JSON in response: ${content.substring(0, 200)}...`, "JSON_PARSE_ERROR", 500);
    }

    const result = validator.safeParse(parsed);
    if (!result.success) {
      throw new OpenRouterError(`Response validation failed: ${result.error.message}`, "VALIDATION_ERROR", 500, {
        zodErrors: result.error.errors,
      });
    }

    return result.data;
  }

  // ==========================================================================
  // PRIVATE METHODS - Error Mapping
  // ==========================================================================

  private mapHttpError(status: number, body: string): OpenRouterError {
    let parsedBody: { error?: { message?: string; code?: string; type?: string } } = {};
    try {
      parsedBody = JSON.parse(body);
    } catch {
      // Ignore parsing errors
    }

    const message = parsedBody.error?.message ?? `HTTP ${status} error`;

    switch (status) {
      case 400:
        if (message.toLowerCase().includes("context_length") || message.toLowerCase().includes("context length")) {
          return new OpenRouterError(
            "Context length exceeded. Try reducing input size.",
            "CONTEXT_LENGTH_EXCEEDED",
            400
          );
        }
        return new OpenRouterError(message, "INVALID_REQUEST", 400);

      case 401:
        return new OpenRouterError(
          "Invalid API key. Check OPENROUTER_API_KEY environment variable.",
          "AUTHENTICATION_ERROR",
          401
        );

      case 402:
        return new OpenRouterError(
          "Insufficient credits. Please add funds to your OpenRouter account.",
          "QUOTA_EXCEEDED",
          402
        );

      case 404:
        return new OpenRouterError(`Model not found: ${message}`, "MODEL_NOT_FOUND", 404);

      case 429: {
        const retryAfterMatch = body.match(/(\d+)/);
        const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1], 10) : 60;
        return new OpenRouterError("Rate limit exceeded. Please try again later.", "RATE_LIMIT_ERROR", 429, {
          retryAfter,
        });
      }

      default:
        if (status >= 500) {
          return new OpenRouterError(`OpenRouter server error: ${message}`, "SERVER_ERROR", status);
        }
        return new OpenRouterError(message, "INVALID_REQUEST", status);
    }
  }

  // ==========================================================================
  // PRIVATE METHODS - Rate Limiting
  // ==========================================================================

  private checkUserRateLimit(userId: string): void {
    const now = Date.now();
    const limit = 10; // Max 10 requests per minute per user
    const windowMs = 60000;

    const current = this.userRequestCounts.get(userId);

    if (!current || current.resetAt <= now) {
      this.userRequestCounts.set(userId, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (current.count >= limit) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      throw new OpenRouterError("User rate limit exceeded", "RATE_LIMIT_ERROR", 429, {
        retryAfter,
      });
    }

    current.count++;
  }
}

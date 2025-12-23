import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { z } from "zod";
import { OpenRouterService } from "../services/OpenRouterService";
import { OpenRouterError } from "../services/errors/OpenRouterError";
import type { OpenRouterRawResponse } from "@/types/openrouter";

// =============================================================================
// MOCK DATA
// =============================================================================

const mockSuccessResponse: OpenRouterRawResponse = {
  id: "gen-123",
  model: "openai/gpt-4o-mini",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: "Hello! How can I help you today?",
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 8,
    total_tokens: 18,
  },
};

const mockJsonResponse: OpenRouterRawResponse = {
  id: "gen-456",
  model: "openai/gpt-4o-mini",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content: JSON.stringify({
          recommendations: [
            {
              recipeId: "rec-001",
              matchScore: 0.95,
              matchLevel: "idealny",
              missingIngredients: [],
              reasoning: "All ingredients available",
            },
          ],
        }),
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150,
  },
};

// Zod schema for testing structured responses
const TestRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      recipeId: z.string(),
      matchScore: z.number().min(0).max(1),
      matchLevel: z.enum(["idealny", "prawie idealny", "wymaga dokupienia"]),
      missingIngredients: z.array(z.string()),
      reasoning: z.string(),
    })
  ),
});

type TestRecommendation = z.infer<typeof TestRecommendationSchema>;

// =============================================================================
// TESTS
// =============================================================================

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  let fetchMock: Mock;

  beforeEach(() => {
    // Create service with test API key
    service = new OpenRouterService({
      apiKey: "test-api-key",
      timeout: 5000,
      maxRetries: 2,
    });

    // Mock global fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // CONSTRUCTOR TESTS
  // ===========================================================================

  describe("constructor", () => {
    it("should throw CONFIGURATION_ERROR when apiKey is empty", () => {
      expect(() => new OpenRouterService({ apiKey: "" })).toThrow(OpenRouterError);

      try {
        new OpenRouterService({ apiKey: "" });
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).code).toBe("CONFIGURATION_ERROR");
      }
    });

    it("should throw CONFIGURATION_ERROR when apiKey is whitespace only", () => {
      expect(() => new OpenRouterService({ apiKey: "   " })).toThrow(OpenRouterError);
    });

    it("should use default values when not provided", () => {
      const svc = new OpenRouterService({ apiKey: "test-key" });
      const config = svc.getConfig();

      expect(config.baseUrl).toBe("https://openrouter.ai/api/v1");
      expect(config.defaultModel).toBe("openai/gpt-4o-mini");
      expect(config.defaultTemperature).toBe(0.7);
      expect(config.defaultMaxTokens).toBe(2048);
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
    });

    it("should override default values with provided config", () => {
      const svc = new OpenRouterService({
        apiKey: "test-key",
        defaultModel: "anthropic/claude-3-haiku",
        defaultTemperature: 0.5,
        defaultMaxTokens: 1024,
        timeout: 10000,
        maxRetries: 5,
      });
      const config = svc.getConfig();

      expect(config.defaultModel).toBe("anthropic/claude-3-haiku");
      expect(config.defaultTemperature).toBe(0.5);
      expect(config.defaultMaxTokens).toBe(1024);
      expect(config.timeout).toBe(10000);
      expect(config.maxRetries).toBe(5);
    });

    it("should throw CONFIGURATION_ERROR for invalid temperature", () => {
      expect(
        () =>
          new OpenRouterService({
            apiKey: "test-key",
            defaultTemperature: 3,
          })
      ).toThrow(OpenRouterError);
    });

    it("should throw CONFIGURATION_ERROR for negative temperature", () => {
      expect(
        () =>
          new OpenRouterService({
            apiKey: "test-key",
            defaultTemperature: -1,
          })
      ).toThrow(OpenRouterError);
    });

    it("should throw CONFIGURATION_ERROR for invalid maxTokens", () => {
      expect(
        () =>
          new OpenRouterService({
            apiKey: "test-key",
            defaultMaxTokens: 0,
          })
      ).toThrow(OpenRouterError);
    });

    it("should throw CONFIGURATION_ERROR for invalid timeout", () => {
      expect(
        () =>
          new OpenRouterService({
            apiKey: "test-key",
            timeout: 500, // Less than 1000ms
          })
      ).toThrow(OpenRouterError);
    });
  });

  // ===========================================================================
  // INPUT VALIDATION TESTS
  // ===========================================================================

  describe("chatCompletion - input validation", () => {
    it("should throw INVALID_REQUEST when systemMessage is empty", async () => {
      await expect(
        service.chatCompletion({
          systemMessage: "",
          userMessage: "test",
        })
      ).rejects.toThrow(OpenRouterError);

      try {
        await service.chatCompletion({
          systemMessage: "",
          userMessage: "test",
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("INVALID_REQUEST");
        expect((error as OpenRouterError).statusCode).toBe(400);
      }
    });

    it("should throw INVALID_REQUEST when userMessage is empty", async () => {
      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "",
        })
      ).rejects.toThrow(OpenRouterError);
    });

    it("should throw INVALID_REQUEST when userMessage exceeds max length", async () => {
      const longMessage = "a".repeat(60000);

      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: longMessage,
        })
      ).rejects.toThrow(OpenRouterError);

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: longMessage,
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("INVALID_REQUEST");
        expect((error as OpenRouterError).message).toContain("maximum length");
      }
    });

    it("should throw INVALID_REQUEST for invalid temperature in options", async () => {
      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          temperature: 5,
        })
      ).rejects.toThrow(OpenRouterError);
    });
  });

  // ===========================================================================
  // SUCCESSFUL REQUEST TESTS
  // ===========================================================================

  describe("chatCompletion - successful requests", () => {
    it("should return text content for simple completion", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      const result = await service.chatCompletion({
        systemMessage: "You are helpful.",
        userMessage: "Hello!",
      });

      expect(result.content).toBe("Hello! How can I help you today?");
      expect(result.usage.totalTokens).toBe(18);
      expect(result.model).toBe("openai/gpt-4o-mini");
      expect(result.finishReason).toBe("stop");
      expect(result.requestId).toBe("gen-123");
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should parse and validate JSON response with Zod schema", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
      });

      const result = await service.chatCompletion<TestRecommendation>({
        systemMessage: "Respond in JSON.",
        userMessage: "Give recommendations.",
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "recommendations",
            strict: true,
            schema: { type: "object", properties: {}, required: [] },
          },
          validator: TestRecommendationSchema,
        },
      });

      expect(result.content.recommendations).toHaveLength(1);
      expect(result.content.recommendations[0].recipeId).toBe("rec-001");
      expect(result.content.recommendations[0].matchScore).toBe(0.95);
      expect(result.content.recommendations[0].matchLevel).toBe("idealny");
    });

    it("should send correct headers to OpenRouter API", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      await service.chatCompletion({
        systemMessage: "Test",
        userMessage: "Test",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
            "HTTP-Referer": "https://fridgepick.app",
            "X-Title": "FridgePick",
          }),
        })
      );
    });

    it("should include response_format in request when provided", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
      });

      await service.chatCompletion<TestRecommendation>({
        systemMessage: "Respond in JSON.",
        userMessage: "Test",
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "test_schema",
            strict: true,
            schema: { type: "object", properties: {}, required: [] },
          },
          validator: TestRecommendationSchema,
        },
      });

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.response_format).toEqual({
        type: "json_schema",
        json_schema: {
          name: "test_schema",
          strict: true,
          schema: { type: "object", properties: {}, required: [] },
        },
      });
    });
  });

  // ===========================================================================
  // ERROR HANDLING TESTS
  // ===========================================================================

  describe("chatCompletion - error handling", () => {
    it("should throw AUTHENTICATION_ERROR for 401 response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({ error: { message: "Invalid API key" } })),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).code).toBe("AUTHENTICATION_ERROR");
        expect((error as OpenRouterError).statusCode).toBe(401);
      }
    });

    it("should throw QUOTA_EXCEEDED for 402 response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 402,
        text: () => Promise.resolve(JSON.stringify({ error: { message: "Insufficient credits" } })),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("QUOTA_EXCEEDED");
        expect((error as OpenRouterError).statusCode).toBe(402);
      }
    });

    it("should throw MODEL_NOT_FOUND for 404 response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error: { message: "Model not found" } })),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("MODEL_NOT_FOUND");
        expect((error as OpenRouterError).statusCode).toBe(404);
      }
    });

    it("should throw RATE_LIMIT_ERROR for 429 response", async () => {
      // Mock multiple times because 429 is retryable (maxRetries: 2 = 2 total attempts)
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve(JSON.stringify({ error: { message: "Rate limit exceeded", code: "30" } })),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve(JSON.stringify({ error: { message: "Rate limit exceeded", code: "30" } })),
        });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).code).toBe("RATE_LIMIT_ERROR");
        expect((error as OpenRouterError).statusCode).toBe(429);
        expect((error as OpenRouterError).details?.retryAfter).toBeDefined();
      }
    });

    it("should throw SERVER_ERROR for 5xx response", async () => {
      // Mock multiple times because 5xx is retryable (maxRetries: 2 = 2 total attempts)
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve(JSON.stringify({ error: { message: "Internal server error" } })),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve(JSON.stringify({ error: { message: "Internal server error" } })),
        });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).code).toBe("SERVER_ERROR");
        expect((error as OpenRouterError).statusCode).toBe(500);
      }
    });

    it("should throw EMPTY_RESPONSE when no choices returned", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "gen-789",
            model: "openai/gpt-4o-mini",
            choices: [],
            usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
          }),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("EMPTY_RESPONSE");
      }
    });

    it("should throw CONTENT_FILTER when content is filtered", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "gen-789",
            model: "openai/gpt-4o-mini",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "" },
                finish_reason: "content_filter",
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 0, total_tokens: 10 },
          }),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("CONTENT_FILTER");
      }
    });

    it("should throw JSON_PARSE_ERROR for invalid JSON response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "gen-789",
            model: "openai/gpt-4o-mini",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "not valid json {" },
                finish_reason: "stop",
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          }),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          responseFormat: {
            type: "json_schema",
            json_schema: {
              name: "test",
              strict: true,
              schema: { type: "object", properties: {}, required: [] },
            },
            validator: TestRecommendationSchema,
          },
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("JSON_PARSE_ERROR");
      }
    });

    it("should throw VALIDATION_ERROR when Zod validation fails", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "gen-789",
            model: "openai/gpt-4o-mini",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: '{"invalid": "structure"}' },
                finish_reason: "stop",
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          }),
      });

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          responseFormat: {
            type: "json_schema",
            json_schema: {
              name: "test",
              strict: true,
              schema: { type: "object", properties: {}, required: [] },
            },
            validator: TestRecommendationSchema,
          },
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("VALIDATION_ERROR");
        expect((error as OpenRouterError).details?.zodErrors).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // RETRY LOGIC TESTS
  // ===========================================================================

  describe("chatCompletion - retry logic", () => {
    it("should retry on 5xx errors", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Server error"),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse),
        });

      const result = await service.chatCompletion({
        systemMessage: "test",
        userMessage: "test",
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.content).toBe("Hello! How can I help you today?");
    });

    it("should retry on 429 rate limit errors", async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve(JSON.stringify({ error: { message: "Rate limit" } })),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse),
        });

      const result = await service.chatCompletion({
        systemMessage: "test",
        userMessage: "test",
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.content).toBeDefined();
    });

    it("should not retry on 4xx client errors (except 429)", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ error: { message: "Bad request" } })),
      });

      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        })
      ).rejects.toThrow(OpenRouterError);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should give up after max retries", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });

      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
        })
      ).rejects.toThrow(OpenRouterError);

      // Initial attempt + 1 retry (maxRetries is 2)
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // USER RATE LIMITING TESTS
  // ===========================================================================

  describe("chatCompletion - user rate limiting", () => {
    it("should enforce per-user rate limits", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      const userId = "user-rate-limit-test";

      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          userId,
        });
      }

      // 11th request should be rate limited
      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          userId,
        })
      ).rejects.toThrow(OpenRouterError);

      try {
        await service.chatCompletion({
          systemMessage: "test",
          userMessage: "test",
          userId,
        });
      } catch (error) {
        expect((error as OpenRouterError).code).toBe("RATE_LIMIT_ERROR");
        expect((error as OpenRouterError).details?.retryAfter).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // UTILITY METHODS TESTS
  // ===========================================================================

  describe("estimateCost", () => {
    it("should calculate cost correctly for gpt-4o-mini", () => {
      const cost = service.estimateCost(1000, 500);
      // (1000 * 0.15 + 500 * 0.6) / 1_000_000 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 5);
    });

    it("should calculate cost correctly for gpt-4o", () => {
      const cost = service.estimateCost(1000, 500, "openai/gpt-4o");
      // (1000 * 2.5 + 500 * 10) / 1_000_000 = 0.0075
      expect(cost).toBeCloseTo(0.0075, 5);
    });

    it("should use default model pricing for unknown models", () => {
      const cost = service.estimateCost(1000, 500, "unknown/model");
      // Should use gpt-4o-mini pricing as fallback
      expect(cost).toBeCloseTo(0.00045, 5);
    });
  });

  describe("healthCheck", () => {
    it("should return true when API is healthy", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
      });

      const result = await service.healthCheck();
      expect(result).toBe(true);
    });

    it("should return false when API is unhealthy", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });

    it("should return false on network error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe("getConfig", () => {
    it("should not expose API key", () => {
      const config = service.getConfig();

      expect(config).not.toHaveProperty("apiKey");
      expect(config.baseUrl).toBeDefined();
      expect(config.defaultModel).toBeDefined();
    });
  });
});

// =============================================================================
// OPENROUTER ERROR TESTS
// =============================================================================

describe("OpenRouterError", () => {
  it("should create error with all properties", () => {
    const error = new OpenRouterError("Test error", "AUTHENTICATION_ERROR", 401, {
      retryAfter: 30,
    });

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("AUTHENTICATION_ERROR");
    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual({ retryAfter: 30 });
    expect(error.name).toBe("OpenRouterError");
  });

  it("should serialize to JSON correctly", () => {
    const error = new OpenRouterError("Test", "SERVER_ERROR", 500);
    const json = error.toJSON();

    expect(json).toEqual({
      name: "OpenRouterError",
      message: "Test",
      code: "SERVER_ERROR",
      statusCode: 500,
      details: undefined,
    });
  });

  it("should correctly identify retryable errors", () => {
    const serverError = new OpenRouterError("Server error", "SERVER_ERROR", 500);
    const rateLimitError = new OpenRouterError("Rate limit", "RATE_LIMIT_ERROR", 429);
    const authError = new OpenRouterError("Auth error", "AUTHENTICATION_ERROR", 401);

    expect(serverError.isRetryable()).toBe(true);
    expect(rateLimitError.isRetryable()).toBe(true);
    expect(authError.isRetryable()).toBe(false);
  });

  it("should return retry after value when available", () => {
    const errorWithRetry = new OpenRouterError("Rate limit", "RATE_LIMIT_ERROR", 429, {
      retryAfter: 60,
    });
    const errorWithoutRetry = new OpenRouterError("Server error", "SERVER_ERROR", 500);

    expect(errorWithRetry.getRetryAfter()).toBe(60);
    expect(errorWithoutRetry.getRetryAfter()).toBeNull();
  });
});

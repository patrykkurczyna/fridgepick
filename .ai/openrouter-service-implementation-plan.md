# OpenRouter Service Implementation Plan

## 1. Opis uslugi

### 1.1 Cel

`OpenRouterService` to usuga backendowa odpowiedzialna za komunikacje z API OpenRouter w celu generowania rekomendacji przepisow opartych na LLM. Usuga enkapsuluje cala logike komunikacji z API, walidacje odpowiedzi oraz obsluge bledow.

### 1.2 Zakres funkcjonalnosci

- Wysylanie zapytan do API OpenRouter z konfigurowalnymi parametrami
- Obsluga komunikatow systemowych i uzytkownika
- Wymuszanie ustrukturyzowanych odpowiedzi poprzez JSON Schema (`response_format`)
- Zarzadzanie parametrami modelu (temperature, max_tokens, etc.)
- Obsluga bledow i retry logic z exponential backoff
- Walidacja odpowiedzi z uzyciem Zod schemas

### 1.3 Integracja z architektura

```
API Route (recommendations.ts)
    |
    v
OpenRouterService
    |
    +-- ChatCompletionRequestBuilder (budowanie requestu)
    |
    +-- OpenRouterClient (komunikacja HTTP)
    |
    +-- ResponseParser (parsowanie i walidacja)
    |
    v
OpenRouter API (https://openrouter.ai/api/v1)
```

---

## 2. Opis konstruktora

### 2.1 Sygnatura konstruktora

```typescript
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  timeout?: number;
  maxRetries?: number;
}

class OpenRouterService {
  constructor(config: OpenRouterConfig);
}
```

### 2.2 Parametry konfiguracyjne

| Parametr | Typ | Wymagany | Domyslna wartosc | Opis |
|----------|-----|----------|------------------|------|
| `apiKey` | `string` | Tak | - | Klucz API OpenRouter (z `process.env.OPENROUTER_API_KEY`) |
| `baseUrl` | `string` | Nie | `https://openrouter.ai/api/v1` | Bazowy URL API |
| `defaultModel` | `string` | Nie | `openai/gpt-4o-mini` | Domyslny model LLM |
| `defaultTemperature` | `number` | Nie | `0.7` | Domyslna temperatura (0-2) |
| `defaultMaxTokens` | `number` | Nie | `2048` | Domyslna maksymalna liczba tokenow |
| `timeout` | `number` | Nie | `30000` | Timeout w milisekundach |
| `maxRetries` | `number` | Nie | `3` | Maksymalna liczba powtorzen |

### 2.3 Przyklad inicjalizacji

```typescript
import { OpenRouterService } from "@/services/OpenRouterService";

// Zalecana inicjalizacja z uzyciem zmiennych srodowiskowych
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  timeout: 30000,
  maxRetries: 3,
});
```

### 2.4 Walidacja konfiguracji

Konstruktor musi walidowac:
1. Obecnosc `apiKey` - rzuca `ConfigurationError` jesli brak
2. Format `baseUrl` - musi byc poprawnym URL
3. Zakresy wartosci: `temperature` (0-2), `maxTokens` (1-128000), `timeout` (1000-120000)

---

## 3. Publiczne metody i pola

### 3.1 `chatCompletion<T>(options: ChatCompletionOptions<T>): Promise<ChatCompletionResult<T>>`

Glowna metoda do wykonywania zapytan chat completion.

#### Parametry wejsciowe

```typescript
interface ChatCompletionOptions<T> {
  // Wymagane
  systemMessage: string;
  userMessage: string;

  // Opcjonalne - nadpisuja domyslne wartosci
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Structured output
  responseFormat?: ResponseFormat<T>;

  // Dodatkowe
  userId?: string; // dla logowania i rate limiting
}

interface ResponseFormat<T> {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: JsonSchema;
  };
  validator?: ZodSchema<T>; // opcjonalny Zod schema do walidacji
}
```

#### Wynik

```typescript
interface ChatCompletionResult<T> {
  content: T; // Sparsowana odpowiedz (string lub obiekt JSON)
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: "stop" | "length" | "content_filter" | "tool_calls";
  requestId: string;
  latencyMs: number;
}
```

#### Przyklad uzycia - proste zapytanie tekstowe

```typescript
const result = await openRouterService.chatCompletion({
  systemMessage: "Jestes pomocnym asystentem kulinarnym.",
  userMessage: "Co moge ugotowac z jajek i pomidorow?",
});

console.log(result.content); // string z odpowiedzia
```

#### Przyklad uzycia - odpowiedz strukturyzowana (JSON Schema)

```typescript
import { z } from "zod";

// 1. Definicja Zod schema dla walidacji TypeScript
const RecipeRecommendationsSchema = z.object({
  recommendations: z.array(z.object({
    recipeId: z.string(),
    matchScore: z.number().min(0).max(1),
    matchLevel: z.enum(["idealny", "prawie idealny", "wymaga dokupienia"]),
    missingIngredients: z.array(z.string()),
    reasoning: z.string(),
  })),
});

type RecipeRecommendations = z.infer<typeof RecipeRecommendationsSchema>;

// 2. Definicja JSON Schema dla OpenRouter API
const recipeRecommendationsJsonSchema = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recipeId: { type: "string" },
          matchScore: { type: "number", minimum: 0, maximum: 1 },
          matchLevel: {
            type: "string",
            enum: ["idealny", "prawie idealny", "wymaga dokupienia"]
          },
          missingIngredients: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" },
        },
        required: ["recipeId", "matchScore", "matchLevel", "missingIngredients", "reasoning"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendations"],
  additionalProperties: false,
};

// 3. Wywolanie z response_format
const result = await openRouterService.chatCompletion<RecipeRecommendations>({
  systemMessage: `Jestes ekspertem kulinarnym. Analizujesz dostepne skladniki
    i dopasowujesz je do przepisow. Odpowiadaj TYLKO w formacie JSON.`,

  userMessage: `
    Dostepne skladniki uzytkownika:
    - Jajka (6 szt, wygasa za 2 dni)
    - Pomidory (500g)
    - Ser feta (200g)
    - Ogorki (3 szt)

    Dostepne przepisy:
    1. ID: "rec-001", Nazwa: "Jajecznica z pomidorami", Skladniki: jajka, pomidory, maslo
    2. ID: "rec-002", Nazwa: "Salatka grecka", Skladniki: ogorki, pomidory, feta, oliwki
    3. ID: "rec-003", Nazwa: "Omlet z warzywami", Skladniki: jajka, papryka, cebula

    Dopasuj przepisy do skladnikow uzytkownika.
  `,

  responseFormat: {
    type: "json_schema",
    json_schema: {
      name: "recipe_recommendations",
      strict: true,
      schema: recipeRecommendationsJsonSchema,
    },
    validator: RecipeRecommendationsSchema,
  },

  temperature: 0.3, // Niska temperatura dla deterministycznych odpowiedzi
  maxTokens: 1024,
});

// result.content jest typu RecipeRecommendations
console.log(result.content.recommendations[0].matchScore); // np. 0.95
```

### 3.2 `getAvailableModels(): Promise<ModelInfo[]>`

Pobiera liste dostepnych modeli z OpenRouter.

```typescript
interface ModelInfo {
  id: string;
  name: string;
  contextLength: number;
  pricing: {
    prompt: number;  // cena za 1M tokenow
    completion: number;
  };
}

const models = await openRouterService.getAvailableModels();
```

### 3.3 `estimateCost(promptTokens: number, completionTokens: number, model?: string): number`

Szacuje koszt zapytania w USD.

```typescript
const estimatedCost = openRouterService.estimateCost(1000, 500, "openai/gpt-4o-mini");
// Zwraca np. 0.00075 (w USD)
```

### 3.4 `healthCheck(): Promise<boolean>`

Sprawdza dostepnosc API OpenRouter.

```typescript
const isHealthy = await openRouterService.healthCheck();
```

---

## 4. Prywatne metody i pola

### 4.1 Prywatne pola

```typescript
class OpenRouterService {
  private readonly config: Required<OpenRouterConfig>;
  private readonly httpClient: HttpClient;
  private readonly logger: Logger;
}
```

### 4.2 `private buildRequest(options: ChatCompletionOptions): OpenRouterRequest`

Buduje obiekt requestu zgodny z API OpenRouter.

```typescript
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
  };

  // Dodaj response_format jesli zdefiniowany
  if (options.responseFormat) {
    request.response_format = {
      type: options.responseFormat.type,
      json_schema: options.responseFormat.json_schema,
    };
  }

  return request;
}
```

### 4.3 `private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T>`

Wykonuje funkcje z automatycznym retry i exponential backoff.

```typescript
private async executeWithRetry<T>(
  fn: () => Promise<T>,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!this.isRetryableError(error) || attempt >= this.config.maxRetries) {
      throw error;
    }

    const delay = this.calculateBackoff(attempt);
    await this.sleep(delay);

    return this.executeWithRetry(fn, attempt + 1);
  }
}

private calculateBackoff(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s...
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  // Dodaj jitter (0-25% losowego opoznienia)
  return delay + Math.random() * delay * 0.25;
}

private isRetryableError(error: unknown): boolean {
  if (error instanceof OpenRouterError) {
    // Retry tylko dla 5xx i 429 (rate limit)
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  // Retry dla bledow sieciowych
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  return false;
}
```

### 4.4 `private parseResponse<T>(raw: OpenRouterRawResponse, validator?: ZodSchema<T>): T`

Parsuje i waliduje odpowiedz z API.

```typescript
private parseResponse<T>(
  raw: OpenRouterRawResponse,
  validator?: ZodSchema<T>
): T {
  const content = raw.choices[0]?.message?.content;

  if (!content) {
    throw new OpenRouterError(
      "Empty response from OpenRouter",
      "EMPTY_RESPONSE",
      500
    );
  }

  // Jesli nie ma validatora, zwroc jako string
  if (!validator) {
    return content as T;
  }

  // Parsuj JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new OpenRouterError(
      `Invalid JSON in response: ${content.substring(0, 100)}...`,
      "JSON_PARSE_ERROR",
      500
    );
  }

  // Waliduj z uzyciem Zod
  const result = validator.safeParse(parsed);
  if (!result.success) {
    throw new OpenRouterError(
      `Response validation failed: ${result.error.message}`,
      "VALIDATION_ERROR",
      500,
      { zodErrors: result.error.errors }
    );
  }

  return result.data;
}
```

### 4.5 `private async sendRequest(request: OpenRouterRequest): Promise<OpenRouterRawResponse>`

Wykonuje request HTTP do API OpenRouter.

```typescript
private async sendRequest(request: OpenRouterRequest): Promise<OpenRouterRawResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

  try {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
        "HTTP-Referer": "https://fridgepick.app", // Wymagane przez OpenRouter
        "X-Title": "FridgePick",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw this.mapHttpError(response.status, errorBody);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 5. Obsluga bledow

### 5.1 Hierarchia klas bledow

```typescript
// Bazowa klasa bledu
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: OpenRouterErrorCode,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Typy bledow
export type OpenRouterErrorCode =
  | "CONFIGURATION_ERROR"    // Blad konfiguracji (brak API key)
  | "AUTHENTICATION_ERROR"   // Nieprawidlowy API key (401)
  | "RATE_LIMIT_ERROR"       // Przekroczony limit zapytan (429)
  | "QUOTA_EXCEEDED"         // Wyczerpane kredyty
  | "INVALID_REQUEST"        // Nieprawidlowe parametry (400)
  | "MODEL_NOT_FOUND"        // Model nie istnieje (404)
  | "SERVER_ERROR"           // Blad serwera OpenRouter (5xx)
  | "NETWORK_ERROR"          // Blad sieci/timeout
  | "JSON_PARSE_ERROR"       // Blad parsowania JSON
  | "VALIDATION_ERROR"       // Blad walidacji odpowiedzi
  | "EMPTY_RESPONSE"         // Pusta odpowiedz
  | "CONTENT_FILTER"         // Odpowiedz zablokowana przez filtr
  | "CONTEXT_LENGTH_EXCEEDED"; // Przekroczony limit kontekstu
```

### 5.2 Mapowanie bledow HTTP

```typescript
private mapHttpError(status: number, body: string): OpenRouterError {
  let parsedBody: { error?: { message?: string; code?: string } } = {};
  try {
    parsedBody = JSON.parse(body);
  } catch {
    // Ignoruj bledy parsowania
  }

  const message = parsedBody.error?.message ?? `HTTP ${status} error`;

  switch (status) {
    case 400:
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
      return new OpenRouterError(
        `Model not found: ${message}`,
        "MODEL_NOT_FOUND",
        404
      );
    case 429:
      return new OpenRouterError(
        "Rate limit exceeded. Please try again later.",
        "RATE_LIMIT_ERROR",
        429,
        { retryAfter: parseInt(parsedBody.error?.code ?? "60", 10) }
      );
    default:
      if (status >= 500) {
        return new OpenRouterError(
          `OpenRouter server error: ${message}`,
          "SERVER_ERROR",
          status
        );
      }
      return new OpenRouterError(message, "INVALID_REQUEST", status);
  }
}
```

### 5.3 Obsluga bledow w warstwie API

```typescript
// W src/pages/api/recipes/recommendations.ts
import { OpenRouterError } from "@/services/OpenRouterService";
import { ApiError, HttpStatus, ErrorCode } from "@/middleware/errorHandler";

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const recommendations = await openRouterService.chatCompletion({
      // ... parametry
    });

    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof OpenRouterError) {
      // Mapowanie bledow OpenRouter na API errors
      const apiError = mapOpenRouterToApiError(error);
      return createErrorResponse(apiError);
    }
    throw error;
  }
};

function mapOpenRouterToApiError(error: OpenRouterError): ApiError {
  switch (error.code) {
    case "RATE_LIMIT_ERROR":
      return new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "AI service temporarily unavailable. Please try again later.",
        { retryAfter: error.details?.retryAfter }
      );
    case "AUTHENTICATION_ERROR":
    case "QUOTA_EXCEEDED":
      return new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        "AI service configuration error. Please contact support."
      );
    case "VALIDATION_ERROR":
    case "JSON_PARSE_ERROR":
      return new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "AI response processing error. Please try again."
      );
    default:
      return new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "AI service error. Please try again later."
      );
  }
}
```

---

## 6. Kwestie bezpieczenstwa

### 6.1 Zarzadzanie API Key

```typescript
// NIGDY nie hardcoduj API key w kodzie!

// Prawidlowo - z zmiennej srodowiskowej
const apiKey = import.meta.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new OpenRouterError(
    "OPENROUTER_API_KEY environment variable is not set",
    "CONFIGURATION_ERROR",
    500
  );
}
```

**Konfiguracja w `.env`:**
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Dodaj do `.gitignore`:**
```
.env
.env.local
.env.*.local
```

### 6.2 Walidacja wejscia

```typescript
// Walidacja systemMessage i userMessage
private validateInput(options: ChatCompletionOptions): void {
  if (!options.systemMessage?.trim()) {
    throw new OpenRouterError(
      "System message cannot be empty",
      "INVALID_REQUEST",
      400
    );
  }

  if (!options.userMessage?.trim()) {
    throw new OpenRouterError(
      "User message cannot be empty",
      "INVALID_REQUEST",
      400
    );
  }

  // Limit dlugosci wiadomosci (zapobieganie atakom)
  const maxLength = 50000; // znakow
  if (options.userMessage.length > maxLength) {
    throw new OpenRouterError(
      `User message exceeds maximum length of ${maxLength} characters`,
      "INVALID_REQUEST",
      400
    );
  }
}
```

### 6.3 Sanityzacja danych uzytkownika

```typescript
// Przed wstawieniem danych uzytkownika do promptu
private sanitizeUserData(data: string): string {
  // Usun potencjalne injection attacks
  return data
    .replace(/```/g, "'''")  // Zapobiegaj wylamaniu z bloków kodu
    .replace(/<\/?[^>]+(>|$)/g, ""); // Usun tagi HTML
}

// Przyklad uzycia w budowaniu promptu
const userMessage = `
  Dostepne skladniki uzytkownika:
  ${userProducts.map(p => `- ${this.sanitizeUserData(p.name)}`).join("\n")}
`;
```

### 6.4 Rate Limiting per User

```typescript
// Dodatkowy rate limiting na poziomie uslugi
private userRequestCounts = new Map<string, { count: number; resetAt: number }>();

private checkUserRateLimit(userId: string): void {
  const now = Date.now();
  const limit = 10; // max 10 zapytan na minute
  const windowMs = 60000;

  const current = this.userRequestCounts.get(userId);

  if (!current || current.resetAt <= now) {
    this.userRequestCounts.set(userId, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new OpenRouterError(
      "User rate limit exceeded",
      "RATE_LIMIT_ERROR",
      429,
      { retryAfter: Math.ceil((current.resetAt - now) / 1000) }
    );
  }

  current.count++;
}
```

### 6.5 Logowanie (bez danych wrazliwych)

```typescript
private log(level: "info" | "warn" | "error", message: string, data?: object): void {
  const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
  console[level](`[OpenRouterService] ${message}`, sanitizedData);
}

private sanitizeLogData(data: object): object {
  const sanitized = { ...data };

  // Ukryj wrażliwe dane
  if ("apiKey" in sanitized) {
    sanitized.apiKey = "[REDACTED]";
  }
  if ("userMessage" in sanitized && typeof sanitized.userMessage === "string") {
    // Skroc dlugie wiadomosci
    sanitized.userMessage = sanitized.userMessage.substring(0, 100) + "...";
  }

  return sanitized;
}
```

---

## 7. Plan wdrozenia krok po kroku

### Krok 1: Utworzenie typow i interfejsow

**Plik:** `src/types/openrouter.ts`

```typescript
// 1.1 Typy wiadomosci
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 1.2 Format odpowiedzi JSON Schema
export interface JsonSchemaResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: JsonSchema;
  };
}

// 1.3 Typ JSON Schema (uproszczony)
export interface JsonSchema {
  type: "object" | "array" | "string" | "number" | "boolean";
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: string[];
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean;
}

// 1.4 Request do OpenRouter API
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

// 1.5 Odpowiedz z OpenRouter API
export interface OpenRouterRawResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter" | "tool_calls";
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 1.6 Konfiguracja uslugi
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  timeout?: number;
  maxRetries?: number;
}

// 1.7 Opcje chat completion
export interface ChatCompletionOptions<T = string> {
  systemMessage: string;
  userMessage: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: ResponseFormat<T>;
  userId?: string;
}

export interface ResponseFormat<T> {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: JsonSchema;
  };
  validator?: import("zod").ZodSchema<T>;
}

// 1.8 Wynik chat completion
export interface ChatCompletionResult<T> {
  content: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: "stop" | "length" | "content_filter" | "tool_calls";
  requestId: string;
  latencyMs: number;
}

// 1.9 Kody bledow
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
```

### Krok 2: Utworzenie klasy bledu

**Plik:** `src/services/errors/OpenRouterError.ts`

```typescript
import type { OpenRouterErrorCode } from "@/types/openrouter";

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: OpenRouterErrorCode,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "OpenRouterError";
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
```

### Krok 3: Implementacja glownej uslugi

**Plik:** `src/services/OpenRouterService.ts`

```typescript
import type { ZodSchema } from "zod";
import type {
  OpenRouterConfig,
  OpenRouterRequest,
  OpenRouterRawResponse,
  ChatCompletionOptions,
  ChatCompletionResult,
  ChatMessage,
} from "@/types/openrouter";
import { OpenRouterError } from "./errors/OpenRouterError";

const DEFAULT_CONFIG = {
  baseUrl: "https://openrouter.ai/api/v1",
  defaultModel: "openai/gpt-4o-mini",
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  timeout: 30000,
  maxRetries: 3,
} as const;

export class OpenRouterService {
  private readonly config: Required<OpenRouterConfig>;

  constructor(config: OpenRouterConfig) {
    this.validateConfig(config);
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<OpenRouterConfig>;
  }

  async chatCompletion<T = string>(
    options: ChatCompletionOptions<T>
  ): Promise<ChatCompletionResult<T>> {
    this.validateInput(options);

    if (options.userId) {
      this.checkUserRateLimit(options.userId);
    }

    const request = this.buildRequest(options);
    const startTime = Date.now();

    const response = await this.executeWithRetry(() =>
      this.sendRequest(request)
    );

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

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  estimateCost(
    promptTokens: number,
    completionTokens: number,
    model?: string
  ): number {
    // Ceny dla gpt-4o-mini (w USD za 1M tokenow)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      "openai/gpt-4o-mini": { prompt: 0.15, completion: 0.6 },
      "openai/gpt-4o": { prompt: 2.5, completion: 10 },
      "anthropic/claude-3.5-sonnet": { prompt: 3, completion: 15 },
    };

    const modelPricing = pricing[model ?? this.config.defaultModel] ?? pricing["openai/gpt-4o-mini"];

    return (
      (promptTokens * modelPricing.prompt + completionTokens * modelPricing.completion) /
      1_000_000
    );
  }

  // === Prywatne metody ===

  private validateConfig(config: OpenRouterConfig): void {
    if (!config.apiKey?.trim()) {
      throw new OpenRouterError(
        "API key is required. Set OPENROUTER_API_KEY environment variable.",
        "CONFIGURATION_ERROR",
        500
      );
    }
  }

  private validateInput<T>(options: ChatCompletionOptions<T>): void {
    if (!options.systemMessage?.trim()) {
      throw new OpenRouterError(
        "System message cannot be empty",
        "INVALID_REQUEST",
        400
      );
    }

    if (!options.userMessage?.trim()) {
      throw new OpenRouterError(
        "User message cannot be empty",
        "INVALID_REQUEST",
        400
      );
    }

    const maxLength = 50000;
    if (options.userMessage.length > maxLength) {
      throw new OpenRouterError(
        `User message exceeds maximum length of ${maxLength} characters`,
        "INVALID_REQUEST",
        400
      );
    }
  }

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

  private async sendRequest(
    request: OpenRouterRequest
  ): Promise<OpenRouterRawResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(
        `${this.config.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://fridgepick.app",
            "X-Title": "FridgePick",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw this.mapHttpError(response.status, errorBody);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterError(
          `Request timeout after ${this.config.timeout}ms`,
          "NETWORK_ERROR",
          408
        );
      }
      throw new OpenRouterError(
        `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
        "NETWORK_ERROR",
        500
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (
        !this.isRetryableError(error) ||
        attempt >= this.config.maxRetries
      ) {
        throw error;
      }

      const delay = this.calculateBackoff(attempt);
      await this.sleep(delay);

      return this.executeWithRetry(fn, attempt + 1);
    }
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    return delay + Math.random() * delay * 0.25;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof OpenRouterError) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseResponse<T>(
    raw: OpenRouterRawResponse,
    validator?: ZodSchema<T>
  ): T {
    const choice = raw.choices[0];

    if (!choice) {
      throw new OpenRouterError(
        "No choices in OpenRouter response",
        "EMPTY_RESPONSE",
        500
      );
    }

    if (choice.finish_reason === "content_filter") {
      throw new OpenRouterError(
        "Response blocked by content filter",
        "CONTENT_FILTER",
        400
      );
    }

    const content = choice.message?.content;

    if (!content) {
      throw new OpenRouterError(
        "Empty content in OpenRouter response",
        "EMPTY_RESPONSE",
        500
      );
    }

    if (!validator) {
      return content as T;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new OpenRouterError(
        `Invalid JSON in response: ${content.substring(0, 100)}...`,
        "JSON_PARSE_ERROR",
        500
      );
    }

    const result = validator.safeParse(parsed);
    if (!result.success) {
      throw new OpenRouterError(
        `Response validation failed: ${result.error.message}`,
        "VALIDATION_ERROR",
        500,
        { zodErrors: result.error.errors }
      );
    }

    return result.data;
  }

  private mapHttpError(status: number, body: string): OpenRouterError {
    let parsedBody: { error?: { message?: string; code?: string } } = {};
    try {
      parsedBody = JSON.parse(body);
    } catch {
      // Ignoruj bledy parsowania
    }

    const message = parsedBody.error?.message ?? `HTTP ${status} error`;

    switch (status) {
      case 400:
        if (message.includes("context_length")) {
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
        return new OpenRouterError(
          `Model not found: ${message}`,
          "MODEL_NOT_FOUND",
          404
        );
      case 429:
        return new OpenRouterError(
          "Rate limit exceeded. Please try again later.",
          "RATE_LIMIT_ERROR",
          429,
          { retryAfter: parseInt(parsedBody.error?.code ?? "60", 10) }
        );
      default:
        if (status >= 500) {
          return new OpenRouterError(
            `OpenRouter server error: ${message}`,
            "SERVER_ERROR",
            status
          );
        }
        return new OpenRouterError(message, "INVALID_REQUEST", status);
    }
  }

  // Rate limiting per user
  private userRequestCounts = new Map<
    string,
    { count: number; resetAt: number }
  >();

  private checkUserRateLimit(userId: string): void {
    const now = Date.now();
    const limit = 10;
    const windowMs = 60000;

    const current = this.userRequestCounts.get(userId);

    if (!current || current.resetAt <= now) {
      this.userRequestCounts.set(userId, {
        count: 1,
        resetAt: now + windowMs,
      });
      return;
    }

    if (current.count >= limit) {
      throw new OpenRouterError(
        "User rate limit exceeded",
        "RATE_LIMIT_ERROR",
        429,
        { retryAfter: Math.ceil((current.resetAt - now) / 1000) }
      );
    }

    current.count++;
  }
}
```

### Krok 4: Utworzenie instancji singleton

**Plik:** `src/services/index.ts`

```typescript
import { OpenRouterService } from "./OpenRouterService";

// Singleton instance
let openRouterInstance: OpenRouterService | null = null;

export function getOpenRouterService(): OpenRouterService {
  if (!openRouterInstance) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY environment variable is not set. " +
        "Please add it to your .env file."
      );
    }

    openRouterInstance = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini",
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
      timeout: 30000,
      maxRetries: 3,
    });
  }

  return openRouterInstance;
}

export { OpenRouterService };
export { OpenRouterError } from "./errors/OpenRouterError";
```

### Krok 5: Integracja z API endpoint

**Aktualizacja pliku:** `src/pages/api/recipes/recommendations.ts`

```typescript
import type { APIRoute } from "astro";
import { z } from "zod";
import { getOpenRouterService, OpenRouterError } from "@/services";
import type { AIRecipeRecommendationsResponse } from "@/types";
import { requireDemoFriendlyAuth, checkUserRateLimit } from "@/middleware/auth";
import { ApiError, HttpStatus, ErrorCode, createErrorResponse } from "@/middleware/errorHandler";

// Zod schema dla walidacji odpowiedzi AI
const AIRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    recipeId: z.string(),
    matchScore: z.number().min(0).max(1),
    matchLevel: z.enum(["idealny", "prawie idealny", "wymaga dokupienia"]),
    missingIngredients: z.array(z.string()),
    reasoning: z.string(),
  })),
});

type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

// JSON Schema dla OpenRouter response_format
const aiRecommendationJsonSchema = {
  type: "object" as const,
  properties: {
    recommendations: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          recipeId: { type: "string" as const },
          matchScore: { type: "number" as const, minimum: 0, maximum: 1 },
          matchLevel: {
            type: "string" as const,
            enum: ["idealny", "prawie idealny", "wymaga dokupienia"],
          },
          missingIngredients: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          reasoning: { type: "string" as const },
        },
        required: ["recipeId", "matchScore", "matchLevel", "missingIngredients", "reasoning"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendations"],
  additionalProperties: false,
};

export const GET: APIRoute = async ({ locals, request, url }) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Authentication
    if (!locals.supabase) {
      throw new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DATABASE_UNAVAILABLE,
        "Database connection not available"
      );
    }

    const user = await requireDemoFriendlyAuth(request, locals.supabase);

    // Rate limiting
    const rateLimitResult = checkUserRateLimit(user);
    if (!rateLimitResult.allowed) {
      throw new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded",
        { retryAfter: rateLimitResult.headers["X-RateLimit-Reset-User"] }
      );
    }

    // TODO: Pobierz produkty uzytkownika i przepisy z bazy
    const userProducts = []; // await getUserProducts(user.id);
    const recipes = []; // await getRecipes();

    // Wywolanie AI
    const openRouter = getOpenRouterService();

    const systemMessage = `Jestes ekspertem kulinarnym AI. Twoim zadaniem jest analizowanie
    dostepnych skladnikow uzytkownika i dopasowywanie ich do przepisow.

    Zasady:
    1. matchScore od 0 do 1 (1 = idealny match)
    2. matchLevel: "idealny" (wszystkie skladniki), "prawie idealny" (1-2 brakujace),
       "wymaga dokupienia" (3+ brakujace)
    3. Priorytetyzuj przepisy wykorzystujace skladniki z krotka data waznosci
    4. Odpowiadaj TYLKO w formacie JSON zgodnym ze schema`;

    const userMessage = `
    Produkty uzytkownika:
    ${userProducts.map(p => `- ${p.name} (${p.quantity} ${p.unit})`).join("\n") || "Brak produktow"}

    Dostepne przepisy:
    ${recipes.map(r => `ID: ${r.id}, Nazwa: ${r.name}, Skladniki: ${r.ingredients?.join(", ")}`).join("\n") || "Brak przepisow"}

    Dopasuj przepisy do skladnikow i zwroc rekomendacje.`;

    const result = await openRouter.chatCompletion<AIRecommendation>({
      systemMessage,
      userMessage,
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "recipe_recommendations",
          strict: true,
          schema: aiRecommendationJsonSchema,
        },
        validator: AIRecommendationSchema,
      },
      temperature: 0.3,
      maxTokens: 2048,
      userId: user.id,
    });

    // Mapowanie na DTO
    const response: AIRecipeRecommendationsResponse = {
      recommendations: result.content.recommendations.map(rec => ({
        recipe: {
          id: rec.recipeId,
          name: recipes.find(r => r.id === rec.recipeId)?.name ?? "Unknown",
          mealCategory: "obiad",
          prepTimeMinutes: 30,
          nutritionalValues: null,
        },
        matchScore: rec.matchScore,
        matchLevel: rec.matchLevel,
        availableIngredients: 0,
        missingIngredients: rec.missingIngredients,
        usingExpiringIngredients: [],
      })),
      cacheUsed: false,
      generatedAt: new Date().toISOString(),
    };

    const responseTime = Date.now() - startTime;

    return new Response(JSON.stringify(response), {
      status: HttpStatus.OK,
      headers: {
        "Content-Type": "application/json",
        "X-Response-Time": `${responseTime}ms`,
        "X-Request-ID": requestId,
        "X-AI-Tokens-Used": result.usage.totalTokens.toString(),
        ...rateLimitResult.headers,
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Mapowanie bledow OpenRouter na API errors
    if (error instanceof OpenRouterError) {
      const apiError = mapOpenRouterToApiError(error);
      const response = createErrorResponse(apiError, requestId);
      response.headers.set("X-Response-Time", `${responseTime}ms`);
      return response;
    }

    const errorResponse = createErrorResponse(error, requestId);
    errorResponse.headers.set("X-Response-Time", `${responseTime}ms`);
    return errorResponse;
  }
};

function mapOpenRouterToApiError(error: OpenRouterError): ApiError {
  switch (error.code) {
    case "RATE_LIMIT_ERROR":
      return new ApiError(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "AI service temporarily unavailable. Please try again later.",
        { retryAfter: error.details?.retryAfter }
      );
    case "AUTHENTICATION_ERROR":
    case "QUOTA_EXCEEDED":
      return new ApiError(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        "AI service configuration error. Please contact support."
      );
    default:
      return new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "AI service error. Please try again later."
      );
  }
}
```

### Krok 6: Konfiguracja zmiennych srodowiskowych

**Plik:** `.env.example`

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

**Aktualizacja:** `src/env.d.ts`

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  // ... inne zmienne
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Krok 7: Testy jednostkowe

**Plik:** `src/__tests__/OpenRouterService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "@/services/OpenRouterService";
import { OpenRouterError } from "@/services/errors/OpenRouterError";

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(() => {
    service = new OpenRouterService({
      apiKey: "test-api-key",
      timeout: 5000,
      maxRetries: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("throws ConfigurationError when apiKey is missing", () => {
      expect(() => new OpenRouterService({ apiKey: "" }))
        .toThrow(OpenRouterError);
    });

    it("uses default values when not provided", () => {
      const svc = new OpenRouterService({ apiKey: "test" });
      expect(svc).toBeDefined();
    });
  });

  describe("chatCompletion", () => {
    it("throws INVALID_REQUEST when systemMessage is empty", async () => {
      await expect(
        service.chatCompletion({
          systemMessage: "",
          userMessage: "test",
        })
      ).rejects.toThrow(OpenRouterError);
    });

    it("throws INVALID_REQUEST when userMessage is empty", async () => {
      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: "",
        })
      ).rejects.toThrow(OpenRouterError);
    });

    it("throws INVALID_REQUEST when userMessage exceeds max length", async () => {
      const longMessage = "a".repeat(60000);
      await expect(
        service.chatCompletion({
          systemMessage: "test",
          userMessage: longMessage,
        })
      ).rejects.toThrow(OpenRouterError);
    });
  });

  describe("estimateCost", () => {
    it("calculates cost correctly for gpt-4o-mini", () => {
      const cost = service.estimateCost(1000, 500);
      // (1000 * 0.15 + 500 * 0.6) / 1_000_000
      expect(cost).toBeCloseTo(0.00045, 5);
    });
  });

  describe("healthCheck", () => {
    it("returns true when API is healthy", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await service.healthCheck();
      expect(result).toBe(true);
    });

    it("returns false when API is unhealthy", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await service.healthCheck();
      expect(result).toBe(false);
    });
  });
});
```

### Krok 8: Uruchomienie lintingu i testow

```bash
# Linting
npm run lint

# Testy jednostkowe
npm run test

# Testy z coverage
npm run test:coverage
```

---

## Podsumowanie

Plan wdrozenia obejmuje:

1. **Typy i interfejsy** - pelna definicja typow TypeScript zgodnych z API OpenRouter
2. **Klasa bledu** - `OpenRouterError` z kodami bledow i szczegolami
3. **Glowna usluga** - `OpenRouterService` z metodami `chatCompletion`, `healthCheck`, `estimateCost`
4. **Singleton** - funkcja `getOpenRouterService()` do globalnego dostepu
5. **Integracja API** - aktualizacja endpointu `/api/recipes/recommendations`
6. **Konfiguracja** - zmienne srodowiskowe i typy dla `import.meta.env`
7. **Testy** - testy jednostkowe dla krytycznych funkcjonalnosci

Kluczowe aspekty bezpieczenstwa:
- API key z zmiennych srodowiskowych (nigdy hardcoded)
- Walidacja wejscia i sanityzacja danych uzytkownika
- Rate limiting na poziomie uslugi i uzytkownika
- Retry logic z exponential backoff
- Obsluga wszystkich scenariuszy bledow
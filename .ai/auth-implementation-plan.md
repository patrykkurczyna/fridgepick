# 📋 Plan Implementacji Integracji Auth - FridgePick

**Data utworzenia:** 2024-12-19
**Wersja:** 1.0
**Status:** Ready to implement

## 📊 Decyzje Architektoniczne

Bazując na analizie wymagań i pytaniach technicznych, wybrano następujące podejście:

### ✅ Wybrane Strategie

1. **Zarządzanie Sesją:** Pure SSR (cookies only)
   - Główna sesja w httpOnly cookies zarządzana przez Supabase SSR
   - localStorage jako cache dla access_token (convenience dla client-side)

2. **Instalacja @supabase/ssr:** Pełny refactor od razu
   - Instalacja `@supabase/ssr` natychmiast
   - Refactor całego `supabase.client.ts`
   - Dual clients: server (SSR) + client (React)

3. **Token Management:** useAuth hook + localStorage cache
   - Hook `useAuth` pobiera token z Supabase session
   - Token cache'owany w localStorage dla convenience
   - Wszystkie komponenty używają `getAccessToken()` z hooka

4. **Demo Mode:** Unified flow z prawdziwymi Supabase users
   - Demo users to prawdziwi users w Supabase
   - Flaga `user_metadata.is_demo = true`
   - Ten sam auth flow co normalni użytkownicy
   - Seedowanie produktów demo przy tworzeniu

5. **Middleware Protection:** Whitelist PUBLIC_PATHS
   - Explicit array `PUBLIC_PATHS` z publicznymi ścieżkami
   - Wszystkie inne ścieżki chronione domyślnie
   - Secure by default

6. **Error Handling:** Inline w formularzach
   - Błędy wyświetlane bezpośrednio w komponentach
   - Własny state dla każdego formularza
   - User-friendly komunikaty

---

## 🎯 Obecny Stan vs Docelowy

### ❌ Problemy Obecnej Implementacji

1. **Brak `@supabase/ssr`** - tylko `@supabase/supabase-js` (client-only)
2. **Supabase client** używa `createClient()` zamiast `createServerClient()`
3. **Middleware** tylko przekazuje client, nie sprawdza sesji
4. **Hardcoded JWT** w `.env.local` zamiast dynamicznej sesji
5. **Brak cookie management** - wymagane przez SSR
6. **useAuth** to mock - wymaga pełnej implementacji
7. **useRealFridgeProducts** używa hardcoded env token

### ✅ Co Będzie Po Implementacji

1. **SSR-safe auth** z cookies i proper session management
2. **Dynamic tokens** z Supabase session
3. **Protected routes** przez middleware whitelist
4. **Working demo mode** z unified flow
5. **Real useAuth hook** z localStorage cache
6. **Dynamic token** w useRealFridgeProducts

---

## 📦 Faza 1: Instalacja i Refactor Supabase Client

### Krok 1.1: Instalacja `@supabase/ssr`

```bash
npm install @supabase/ssr
```

**Weryfikacja:**
```bash
npm list @supabase/ssr
```

### Krok 1.2: Refactor `src/db/supabase.client.ts`

**Cel:** Stworzyć dual client system - server (SSR) + client (React)

**Nowa struktura:**

```typescript
// src/db/supabase.client.ts
import type { AstroCookies } from 'astro';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: 'lax',
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

/**
 * Server-side Supabase client (SSR-safe, używa cookies)
 * Używany w: Astro pages, middleware, API routes
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );
};

/**
 * Client-side Supabase client (dla React components)
 * Używany w: hooks, React components
 */
export const createSupabaseClientInstance = () => {
  return createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );
};

// Legacy export dla backwards compatibility (TODO: usunąć po migracji)
export const supabaseClient = createClient<Database>(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);
```

**Kluczowe zmiany:**
- ✅ `createSupabaseServerInstance()` - SSR-safe dla Astro/API
- ✅ `createSupabaseClientInstance()` - Client-side dla React
- ✅ `cookieOptions` - Proper cookie config
- ✅ `parseCookieHeader()` - Parser dla SSR cookies
- ⚠️ `supabaseClient` - Legacy, będzie usunięty

### Krok 1.3: Update `src/env.d.ts`

**Cel:** Dodać typy dla SSR Supabase i Astro.locals.user

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    supabase: import('@supabase/ssr').SupabaseClient<
      import('./db/database.types').Database
    >;
    user?: {
      id: string;
      email: string;
      isDemo: boolean;
      isEmailVerified: boolean;
    };
  }
}
```

**Kluczowe zmiany:**
- ✅ Dodano `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_KEY`
- ✅ `Locals.supabase` teraz ma typ z `@supabase/ssr`
- ✅ `Locals.user` zawiera `isDemo` i `isEmailVerified`

### Krok 1.4: Update `.env` i `.env.local`

**`.env` (dodaj):**
```env
# Public variants dla client-side (prefix PUBLIC_ eksponuje do przeglądarki)
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**`.env.local` (usuń):**
```env
# USUŃ tę linię - nie będzie już potrzebna po implementacji SSR auth
# PUBLIC_JWT_TOKEN=eyJhbGc...
```

**Weryfikacja:**
```bash
# Sprawdź czy zmienne są dostępne
echo $PUBLIC_SUPABASE_URL
```

---

## 🛡️ Faza 2: Middleware z SSR Auth Protection

### Krok 2.1: Refactor `src/middleware/index.ts`

**Cel:** Implementacja SSR auth check + whitelist PUBLIC_PATHS

**Nowa implementacja:**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client';

// Whitelist - publiczne ścieżki (nie wymagają auth)
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/demo',
  '/api/auth/verify-email',
  '/api/health',
  '/api/product-categories', // Publiczne API
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // 1. Utwórz SSR Supabase client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // 2. Dodaj supabase do locals (dostępny w API routes i Astro pages)
    locals.supabase = supabase;

    // 3. Sprawdź czy to publiczna ścieżka
    const isPublicPath = PUBLIC_PATHS.some(path =>
      url.pathname === path || url.pathname.startsWith(path)
    );

    // 4. Pobierz sesję użytkownika (WAŻNE: zawsze wywołaj przed innymi operacjami)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 5. Jeśli użytkownik zalogowany
    if (user) {
      // Ustaw user w locals (dostępny w całej aplikacji)
      locals.user = {
        id: user.id,
        email: user.email || '',
        isDemo: user.user_metadata?.is_demo || false,
        isEmailVerified: !!user.email_confirmed_at,
      };

      // Jeśli zalogowany próbuje wejść na stronę auth, przekieruj do /fridge
      if (url.pathname.startsWith('/auth/')) {
        return redirect('/fridge');
      }
    }
    // 6. Jeśli użytkownik NIE zalogowany i próbuje wejść na chronioną stronę
    else if (!isPublicPath) {
      return redirect(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    return next();
  }
);
```

**Kluczowe zmiany:**
- ✅ `createSupabaseServerInstance()` zamiast legacy client
- ✅ Whitelist `PUBLIC_PATHS` - secure by default
- ✅ `supabase.auth.getUser()` - ZAWSZE wywołane przed innymi ops
- ✅ `locals.user` - dostępny w całej aplikacji
- ✅ Auto-redirect: zalogowany na /auth/* → /fridge
- ✅ Auto-redirect: niezalogowany na protected → /auth/login?redirect=...

**Flow:**
```
Request → Middleware
  ↓
1. Create SSR Supabase client
2. Add to locals.supabase
3. Check if public path
4. Get user session
  ↓
User exists?
  YES → locals.user = {...}
        On /auth/* → redirect /fridge
  NO  → On protected → redirect /auth/login?redirect=...
  ↓
Next (continue to page)
```

---

## 🔌 Faza 3: API Endpoints

### Krok 3.1: `src/pages/api/auth/login.ts`

**Cel:** Endpoint logowania z Supabase Auth

```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    // Walidacja server-side
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email i hasło są wymagane' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase errors do user-friendly messages
      let message = 'Email lub hasło nieprawidłowe';
      let code = 'INVALID_CREDENTIALS';

      if (error.message.includes('Email not confirmed')) {
        message = 'Konto nie zostało zweryfikowane. Sprawdź email.';
        code = 'EMAIL_NOT_VERIFIED';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: { code, message },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sukces - cookies są automatycznie ustawione przez Supabase SSR
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          isDemo: data.user.user_metadata?.is_demo || false,
          isEmailVerified: !!data.user.email_confirmed_at,
        },
        accessToken: data.session.access_token,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd serwera' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Key Points:**
- ✅ Używa `createSupabaseServerInstance()` - SSR-safe
- ✅ `signInWithPassword()` - automatycznie ustawia cookies
- ✅ Walidacja server-side
- ✅ User-friendly error messages
- ✅ Zwraca `accessToken` dla localStorage cache

### Krok 3.2: `src/pages/api/auth/register.ts`

**Cel:** Endpoint rejestracji z email verification

```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password, confirmPassword } = await request.json();

    // Walidacja server-side
    if (!email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Wszystkie pola są wymagane' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'PASSWORDS_MISMATCH', message: 'Hasła muszą być identyczne' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/verify-email`,
      },
    });

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Email już istnieje w systemie';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'REGISTRATION_ERROR', message },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sprawdź email i kliknij link aktywacyjny',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd serwera' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Key Points:**
- ✅ Walidacja hasła match server-side
- ✅ `emailRedirectTo` - URL do weryfikacji
- ✅ User-friendly error dla duplicate email

### Krok 3.3: `src/pages/api/auth/logout.ts`

**Cel:** Endpoint wylogowania (clear cookies)

```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Wylogowano pomyślnie',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd serwera' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Key Points:**
- ✅ `signOut()` automatycznie czyści cookies
- ✅ Prosty flow - brak skomplikowanej logiki

### Krok 3.4: `src/pages/api/auth/demo.ts` (Unified Flow)

**Cel:** Endpoint demo mode - tworzy prawdziwego Supabase user z is_demo flag

```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Wygeneruj unikalny email dla demo
    const demoEmail = `demo_${crypto.randomUUID()}@fridgepick.demo`;
    const demoPassword = crypto.randomUUID();

    // 1. Utwórz użytkownika demo (prawdziwego Supabase user)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          is_demo: true, // ⭐ Flaga demo w user_metadata
        },
        emailRedirectTo: undefined, // Demo nie wymaga weryfikacji
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    // 2. Automatycznie zaloguj demo user
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

    if (signInError) {
      throw signInError;
    }

    // 3. TODO: Seeduj przykładowe produkty (implementacja w następnej fazie)
    // await seedDemoProducts(signInData.user.id);

    // 4. Zwróć sukces
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: signInData.user.id,
          email: demoEmail,
          isDemo: true,
          isEmailVerified: true, // Demo nie wymaga weryfikacji
        },
        accessToken: signInData.session.access_token,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Demo creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd tworzenia trybu demo' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

**Key Points:**
- ✅ **Unified flow** - demo to prawdziwy Supabase user
- ✅ `user_metadata.is_demo = true` - flaga demo
- ✅ Unikalny UUID email (demo_xxx@fridgepick.demo)
- ✅ Auto-login po utworzeniu
- ⏰ TODO: seedDemoProducts() w następnej fazie

**Flow demo mode:**
```
Kliknięcie "Demo" → POST /api/auth/demo
  ↓
1. Generuj unikalny email (demo_xxx@fridgepick.demo)
2. signUp({ is_demo: true })
3. signInWithPassword()
4. [TODO] seedDemoProducts()
  ↓
Return { user, accessToken }
  ↓
Client: localStorage.setItem('supabase_access_token')
Redirect: /fridge?demo=true
```

### Krok 3.5: Pozostałe Endpointy (Optional - SHOULD)

**`src/pages/api/auth/forgot-password.ts`:**
```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email jest wymagany' },
        }),
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    // Security: nie ujawniaj czy email istnieje
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jeśli email istnieje w systemie, link został wysłany',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd serwera' },
      }),
      { status: 500 }
    );
  }
};
```

**`src/pages/api/auth/reset-password.ts`:**
```typescript
import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Token i hasło są wymagane' },
        }),
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'RESET_ERROR', message: 'Token nieprawidłowy lub wygasły' },
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hasło zostało zmienione',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Błąd serwera' },
      }),
      { status: 500 }
    );
  }
};
```

---

## ⚛️ Faza 4: useAuth Hook (SSR + localStorage cache)

### Krok 4.1: Zaimplementuj `src/hooks/useAuth.ts`

**Cel:** Hook zarządzający sesją, cache'ujący token w localStorage

```typescript
import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClientInstance } from '@/db/supabase.client';
import type { UserDTO } from '@/types';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const supabase = createSupabaseClientInstance();

  // Check session on mount
  useEffect(() => {
    checkSession();

    // Listen to auth changes (across tabs, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        const userDTO: UserDTO = {
          id: session.user.id,
          email: session.user.email!,
          isDemo: session.user.user_metadata?.is_demo || false,
          isEmailVerified: !!session.user.email_confirmed_at,
        };

        setState({
          user: userDTO,
          loading: false,
          isAuthenticated: true,
        });

        // Cache access token in localStorage dla convenience
        localStorage.setItem('supabase_access_token', session.access_token);
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
        localStorage.removeItem('supabase_access_token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        const userDTO: UserDTO = {
          id: session.user.id,
          email: session.user.email!,
          isDemo: session.user.user_metadata?.is_demo || false,
          isEmailVerified: !!session.user.email_confirmed_at,
        };

        setState({
          user: userDTO,
          loading: false,
          isAuthenticated: true,
        });

        localStorage.setItem('supabase_access_token', session.access_token);
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Logowanie nie powiodło się');
      }

      // Session jest już ustawiona w cookies przez backend
      // Odśwież local state
      await checkSession();

      return data.user;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear local state
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      localStorage.removeItem('supabase_access_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const startDemoMode = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Nie udało się uruchomić trybu demo');
      }

      // Session jest już ustawiona w cookies
      await checkSession();

      return data.user;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  return {
    ...state,
    login,
    logout,
    startDemoMode,
    refreshSession: checkSession,
    getAccessToken,
  };
};
```

**Key Points:**
- ✅ `createSupabaseClientInstance()` - client-side Supabase
- ✅ `onAuthStateChange()` - synchronizacja między kartami
- ✅ `localStorage.setItem('supabase_access_token')` - cache dla convenience
- ✅ `getAccessToken()` - helper dla innych hooków (useRealFridgeProducts)
- ✅ `login()`, `logout()`, `startDemoMode()` - API wrappers
- ✅ Auto-refresh po API calls przez `checkSession()`

**Flow:**
```
Component Mount → useAuth()
  ↓
1. checkSession() - pobierz z Supabase
2. onAuthStateChange() - nasłuchuj zmian
  ↓
Session exists?
  YES → setState({ user, isAuthenticated: true })
        localStorage.setItem('supabase_access_token')
  NO  → setState({ user: null, isAuthenticated: false })
  ↓
Return { user, login, logout, getAccessToken, ... }
```

---

## 🎨 Faza 5: Update UI Components

### Krok 5.1: Update `src/components/auth/LoginForm.tsx`

**Cel:** Zamienić TODO placeholder na prawdziwe wywołanie API

**Zamień sekcję `handleSubmit`:**

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Walidacja client-side
  const validationError = validateLoginForm(formState.email, formState.password);
  if (validationError) {
    setFormState(prev => ({ ...prev, error: validationError }));
    return;
  }

  setFormState(prev => ({ ...prev, isLoading: true, error: null }));

  try {
    // Wywołanie API logowania
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email,
        password: formState.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Logowanie nie powiodło się');
    }

    // Sukces - cookies są ustawione przez backend
    // Przekieruj do /fridge lub redirect param
    const redirectUrl = redirectTo || '/fridge';
    window.location.href = redirectUrl;

  } catch (err) {
    setFormState(prev => ({
      ...prev,
      error: err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd',
      isLoading: false
    }));
  }
};
```

**Usuń TODO komentarze:**
```typescript
// USUŃ:
// TODO: Implementacja wywołania API /api/auth/login
// To będzie zaimplementowane w kolejnym etapie (backend + useAuth)
```

**Key Changes:**
- ✅ Prawdziwe `fetch('/api/auth/login')`
- ✅ Obsługa błędów z API (data.error?.message)
- ✅ `window.location.href` - full page redirect (cookies są ustawione)
- ✅ Brak manual token handling - backend robi to przez cookies

### Krok 5.2: Update `src/components/auth/RegisterForm.tsx`

**Zamień sekcję `handleSubmit`:**

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Walidacja client-side
  const validationError = validateRegisterForm(
    formState.email,
    formState.password,
    formState.confirmPassword
  );

  if (validationError) {
    setFormState(prev => ({ ...prev, error: validationError }));
    return;
  }

  setFormState(prev => ({ ...prev, isLoading: true, error: null }));

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email,
        password: formState.password,
        confirmPassword: formState.confirmPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Rejestracja nie powiodła się');
    }

    // Pokaż komunikat sukcesu
    setFormState(prev => ({
      ...prev,
      isLoading: false,
      success: true
    }));

  } catch (err) {
    setFormState(prev => ({
      ...prev,
      isLoading: false,
      error: err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
    }));
  }
};
```

**Usuń TODO komentarze.**

### Krok 5.3: Update `src/pages/auth/login.astro`

**Cel:** Dodać SSR session check

**Dodaj na początku frontmatter:**

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';
import { LoginForm } from '../../components/auth/LoginForm';

const title = 'Logowanie';

// SSR: Sprawdź czy użytkownik już zalogowany
const { user } = Astro.locals;
if (user) {
  return Astro.redirect('/fridge');
}

// Opcjonalny parametr redirect z URL
const redirectTo = Astro.url.searchParams.get('redirect');
---
```

**Usuń TODO komentarze:**
```astro
<!-- USUŃ:
TODO: Po implementacji middleware - sprawdź czy użytkownik już zalogowany
-->
```

**Key Changes:**
- ✅ `Astro.locals.user` - dostępny dzięki middleware
- ✅ SSR redirect jeśli zalogowany
- ✅ `redirectTo` param przekazany do LoginForm

### Krok 5.4: Update `src/pages/auth/register.astro`

**Analogicznie do login.astro:**

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';
import { RegisterForm } from '../../components/auth/RegisterForm';

const title = 'Rejestracja';

// SSR: Sprawdź czy użytkownik już zalogowany
const { user } = Astro.locals;
if (user) {
  return Astro.redirect('/fridge');
}
---
```

### Krok 5.5: Update `src/pages/index.astro`

**Dodaj SSR session check:**

```astro
---
import Layout from '../layouts/Layout.astro';
import { Logo } from '../components/Logo';

const title = "FridgePick MVP";
const description = "Inteligentna aplikacja do planowania posiłków";

// SSR: Sprawdź czy użytkownik już zalogowany
const { user } = Astro.locals;
if (user) {
  // Sprawdź czy to użytkownik demo
  if (user.isDemo) {
    return Astro.redirect('/fridge?demo=true');
  }
  return Astro.redirect('/fridge');
}
---
```

**Usuń TODO komentarze.**

### Krok 5.6: Update `src/hooks/useRealFridgeProducts.ts`

**Cel:** Zamienić hardcoded env token na dynamiczny token z useAuth

**Dodaj import:**
```typescript
import { useAuth } from './useAuth';
```

**Zamień:**
```typescript
export const useRealFridgeProducts = () => {
  const { getAccessToken } = useAuth(); // ⭐ Dodaj useAuth hook

  // USUŃ tę linię:
  // const jwtToken = import.meta.env.PUBLIC_JWT_TOKEN;

  // ... reszta stanu
```

**Zaktualizuj `fetchProducts`:**
```typescript
useEffect(() => {
  const fetchProducts = async () => {
    try {
      // ... istniejący kod (isSearchAction, etc.) ...

      // Pobierz token dynamicznie z useAuth
      const token = await getAccessToken();

      if (!token) {
        throw new Error('Brak tokenu autoryzacji');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`, // ⭐ Dynamiczny token
          'Content-Type': 'application/json'
        }
      });

      // ... reszta istniejącego kodu ...
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load products');
      setLoading(false);
      setIsSearching(false);
    }
  };

  fetchProducts();
}, [debouncedSearch, refreshTrigger, getAccessToken]); // ⭐ Dodaj getAccessToken do deps
```

**Key Changes:**
- ✅ `useAuth()` hook dla dostępu do `getAccessToken()`
- ✅ `await getAccessToken()` - dynamiczny token z Supabase session
- ✅ Error jeśli brak tokenu (user niezalogowany)
- ✅ Dependency array: dodano `getAccessToken`

**Flow:**
```
Component Mount → useRealFridgeProducts()
  ↓
useAuth() → getAccessToken()
  ↓
Supabase session → access_token
  ↓
fetch('/api/user-products', { Authorization: Bearer <token> })
  ↓
Backend: middleware sprawdza token → locals.user
API: zwraca produkty dla locals.user.id
```

---

## ✅ Faza 6: Testing & Validation

### Test 1: Login Flow

**Scenariusz:**
1. Wyloguj się (jeśli zalogowany)
2. Wejdź na `/auth/login`
3. Wprowadź credentials z `.env.local`:
   - Email: `patryk.kurczyna@gmail.com`
   - Password: `qqedr6e2`
4. Kliknij "Zaloguj się"

**Expected:**
- ✅ POST /api/auth/login zwraca 200
- ✅ Cookies `sb-*` są ustawione (DevTools → Application → Cookies)
- ✅ Przekierowanie do `/fridge`
- ✅ Middleware ustawia `Astro.locals.user`
- ✅ Produkty są pobierane (GET /api/user-products z Bearer token)

**Verify:**
```bash
# DevTools Console:
localStorage.getItem('supabase_access_token')
# Should return JWT token string
```

### Test 2: SSR Protection

**Scenariusz:**
1. Wyloguj się
2. Bezpośrednio wejdź na `/fridge` (URL bar)

**Expected:**
- ✅ Middleware wykrywa brak sesji
- ✅ Przekierowanie do `/auth/login?redirect=/fridge`
- ✅ Po zalogowaniu → przekierowanie z powrotem do `/fridge`

### Test 3: Demo Mode

**Scenariusz:**
1. Wyloguj się
2. Wejdź na `/`
3. Kliknij "🎭 Wypróbuj tryb Demo"

**Expected:**
- ✅ POST /api/auth/demo zwraca 200
- ✅ Nowy user w Supabase z `user_metadata.is_demo = true`
- ✅ Cookies są ustawione
- ✅ Przekierowanie do `/fridge?demo=true`
- ✅ DemoModeIndicator jest wyświetlony (sticky top banner)
- ✅ Produkty demo są pobierane (TODO: seed products)

**Verify:**
```sql
-- W Supabase Dashboard → SQL Editor:
SELECT id, email, user_metadata
FROM auth.users
WHERE user_metadata->>'is_demo' = 'true'
ORDER BY created_at DESC
LIMIT 5;
```

### Test 4: Already Logged In Redirect

**Scenariusz:**
1. Zaloguj się
2. Próbuj wejść na `/auth/login`

**Expected:**
- ✅ Middleware wykrywa user w locals
- ✅ Przekierowanie do `/fridge`
- ✅ Nie widzisz formularza logowania

### Test 5: useAuth Cross-Tab Sync

**Scenariusz:**
1. Otwórz 2 karty z aplikacją
2. W karcie 1: zaloguj się
3. W karcie 2: obserwuj console

**Expected:**
- ✅ Karta 2: `onAuthStateChange` event fired
- ✅ Karta 2: auto-update state (user is logged in)
- ✅ Synchronizacja sesji między kartami

### Test 6: Logout Flow

**Scenariusz:**
1. Zaloguj się
2. Wejdź na `/fridge`
3. Kliknij "Wyloguj" (TODO: AppNavigation)

**Expected:**
- ✅ POST /api/auth/logout zwraca 200
- ✅ Cookies `sb-*` są usunięte
- ✅ localStorage token usunięty
- ✅ Przekierowanie do `/auth/login`
- ✅ Próba wejścia na `/fridge` → redirect do login

### Test 7: Token Refresh

**Scenariusz:**
1. Zaloguj się
2. Poczekaj 1h (lub zmień exp time w dev)
3. Wykonaj akcję wymagającą API call

**Expected:**
- ✅ Supabase auto-refresh token (`autoRefreshToken: true`)
- ✅ Request kontynuowany z nowym tokenem
- ✅ Brak błędu "Unauthorized"

---

## 📝 Checklist Implementacji

### Faza 1: Supabase SSR Setup
- [ ] 1.1: Zainstalować `@supabase/ssr`
- [ ] 1.2: Refactor `src/db/supabase.client.ts` (dual clients)
- [ ] 1.3: Update `src/env.d.ts` (types)
- [ ] 1.4: Update `.env` (PUBLIC_ variants)

### Faza 2: Middleware
- [ ] 2.1: Refactor `src/middleware/index.ts` (SSR auth + whitelist)

### Faza 3: API Endpoints
- [ ] 3.1: `POST /api/auth/login`
- [ ] 3.2: `POST /api/auth/register`
- [ ] 3.3: `POST /api/auth/logout`
- [ ] 3.4: `POST /api/auth/demo`
- [ ] 3.5: `POST /api/auth/forgot-password` (optional)
- [ ] 3.5: `POST /api/auth/reset-password` (optional)

### Faza 4: useAuth Hook
- [ ] 4.1: Zaimplementować `src/hooks/useAuth.ts`

### Faza 5: UI Updates
- [ ] 5.1: Update `LoginForm.tsx` (remove TODOs, real API)
- [ ] 5.2: Update `RegisterForm.tsx` (remove TODOs)
- [ ] 5.3: Update `login.astro` (SSR check)
- [ ] 5.4: Update `register.astro` (SSR check)
- [ ] 5.5: Update `index.astro` (SSR check)
- [ ] 5.6: Update `useRealFridgeProducts.ts` (dynamic token)

### Faza 6: Testing
- [ ] Test 1: Login flow
- [ ] Test 2: SSR protection
- [ ] Test 3: Demo mode
- [ ] Test 4: Already logged redirect
- [ ] Test 5: Cross-tab sync
- [ ] Test 6: Logout flow
- [ ] Test 7: Token refresh

---

## 🚨 Potential Issues & Solutions

### Issue 1: Cookies Not Set
**Symptom:** Po logowaniu cookies `sb-*` nie są widoczne w DevTools

**Solution:**
```typescript
// Sprawdź cookieOptions w supabase.client.ts
export const cookieOptions: CookieOptionsWithName = {
  path: '/',
  secure: import.meta.env.PROD, // ⚠️ W dev MUSI być false!
  httpOnly: true,
  sameSite: 'lax',
};
```

### Issue 2: CORS Errors
**Symptom:** `blocked by CORS policy` przy API calls

**Solution:**
- API routes w Astro nie mają CORS issues (same-origin)
- Jeśli występują: sprawdź czy używasz `PUBLIC_SUPABASE_URL` w client

### Issue 3: "Invalid JWT" Errors
**Symptom:** Backend zwraca 401 Unauthorized

**Debug:**
```typescript
// W middleware dodaj:
console.log('Token:', request.headers.get('Cookie'));
```

**Solution:**
- Sprawdź czy `createSupabaseServerInstance` dostaje właściwe cookies
- Verify `parseCookieHeader()` funkcja

### Issue 4: Infinite Redirect Loop
**Symptom:** `/auth/login` → `/fridge` → `/auth/login` loop

**Debug:**
```typescript
// W middleware dodaj:
console.log('User:', user, 'Path:', url.pathname);
```

**Solution:**
- Sprawdź logikę w middleware (linia "if (user) { if (url.pathname.startsWith('/auth/'))")
- Verify PUBLIC_PATHS array

### Issue 5: localStorage Token Not Syncing
**Symptom:** `getAccessToken()` zwraca null pomimo zalogowania

**Debug:**
```typescript
// W useAuth checkSession:
console.log('Session:', session);
console.log('Token in localStorage:', localStorage.getItem('supabase_access_token'));
```

**Solution:**
- Sprawdź czy `onAuthStateChange` jest subskrybowane
- Verify czy `checkSession()` jest wywołane po login

---

## 🎯 Success Criteria

Po implementacji wszystkich faz, aplikacja powinna:

✅ **Auth Flow:**
- [ ] Użytkownik może się zalogować
- [ ] Użytkownik może się zarejestrować (z email verification)
- [ ] Użytkownik może się wylogować
- [ ] Sesja jest persistent (cookies)
- [ ] Token auto-refresh działa

✅ **Demo Mode:**
- [ ] Demo user jest tworzony przez unified flow
- [ ] Demo user ma flagę `is_demo: true`
- [ ] DemoModeIndicator wyświetla się dla demo users
- [ ] Demo produkty są seedowane (TODO: następna faza)

✅ **Protection:**
- [ ] Chronione strony przekierowują do login
- [ ] Zalogowani nie mogą wejść na /auth/*
- [ ] Middleware poprawnie sprawdza sesję

✅ **UX:**
- [ ] Błędy są wyświetlane inline w formularzach
- [ ] Loading states działają
- [ ] Redirect params są respektowane
- [ ] Cross-tab sync działa

---

## 📚 References

- **Specyfikacja Auth:** `.ai/auth-spec.md`
- **PRD:** `.ai/prd.md` (User Stories US-001 do US-004, US-016)
- **Supabase Auth Guide:** `.ai/supabase-auth.mdc`
- **Diagram UI:** `.ai/diagrams/ui.md`
- **Database Types:** `src/db/database.types.ts`

---

## 🔄 Next Steps (Po Implementacji)

Po zakończeniu tego planu:

1. **Faza 7: Password Reset Flow** (SHOULD priority)
   - Implement forgot-password i reset-password endpoints
   - Update komponentów (ForgotPasswordForm, ResetPasswordForm)

2. **Faza 8: Email Verification** (SHOULD priority)
   - Implement verify-email endpoint
   - Update verify-email.astro z prawdziwą weryfikacją

3. **Faza 9: Demo Products Seeding**
   - Implement DemoService.seedDemoProducts()
   - Dodać przykładowe produkty przy tworzeniu demo user

4. **Faza 10: AppNavigation Update**
   - Dodać user menu (email, wylogowanie)
   - Integracja z useAuth

5. **Faza 11: Security Hardening**
   - Rate limiting na auth endpoints
   - CSRF protection
   - Security headers

---

**Plan gotowy do implementacji!** 🚀

**Rozpocznij od Fazy 1, Krok 1.1** - instalacja `@supabase/ssr`

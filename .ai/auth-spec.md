# Specyfikacja Techniczna - System Autentykacji FridgePick

## 1. PRZEGLĄD ARCHITEKTURY

### 1.1 Obecny Stan Projektu

#### Istniejąca Infrastruktura
Projekt posiada już częściową implementację warstwy autentykacji:

**Zaimplementowane Moduły:**
- `src/middleware/auth.ts` - Zaawansowany system walidacji JWT z Supabase
- `src/types.ts` - Pełny zestaw typów auth (AuthRegisterRequest, AuthLoginRequest, etc.)
- `src/db/supabase.client.ts` - Klient Supabase
- `src/middleware/index.ts` - Middleware Astro dodający supabase do context.locals

**Moduły Do Implementacji:**
- `src/hooks/useAuth.ts` - Obecnie mock, wymaga pełnej implementacji
- Strony autentykacji (login, register, forgot-password, etc.)
- Komponenty formularzy React
- API endpoints dla operacji auth
- Rozszerzenie middleware Astro o ochronę stron
- Serwisy zarządzania sesją i demo mode

### 1.2 Cel Specyfikacji

Dokument definiuje architekturę systemu autentykacji zgodną z wymaganiami PRD:
- **US-001**: Rejestracja użytkownika z linkiem aktywacyjnym (SHOULD)
- **US-002**: Logowanie użytkownika
- **US-003**: Reset hasła (SHOULD)
- **US-004**: Tryb demo bez rejestracji
- **US-016**: Wylogowanie

### 1.3 Założenia Techniczne

**Stack:**
- **Frontend**: Astro 5 + React + TypeScript + Tailwind + Shadcn/ui
- **Backend**: Astro SSR (Node adapter standalone mode) + Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Session**: JWT tokens (Supabase Auth)

**Kluczowe Zasady:**
1. Astro pages (.astro) dla SSR i routingu
2. React components dla interaktywnych formularzy
3. Supabase Auth dla wszystkich operacji autentykacji
4. JWT tokens przechowywane w localStorage (client) i walidowane przez middleware (server)
5. Demo mode jako specjalny typ użytkownika z ograniczeniami

---

## 2. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 2.1 Struktura Stron Astro

#### 2.1.1 Strony Publiczne (Non-Auth)

**src/pages/auth/login.astro**
```
Cel: Strona logowania
SSR: Tak
Redirect: Przekierowanie do /fridge jeśli użytkownik już zalogowany
Layout: AuthLayout
Zawiera: LoginForm (React)
```

**Logika SSR:**
```typescript
// src/pages/auth/login.astro
---
import AuthLayout from '@/layouts/AuthLayout.astro';
import { LoginForm } from '@/components/auth/LoginForm';

// Sprawdź czy użytkownik już zalogowany
const session = await Astro.locals.supabase.auth.getSession();
if (session.data.session) {
  return Astro.redirect('/fridge');
}
---

<AuthLayout title="Logowanie - FridgePick">
  <LoginForm client:load />
</AuthLayout>
```

**src/pages/auth/register.astro**
```
Cel: Strona rejestracji
SSR: Tak
Redirect: Przekierowanie do /fridge jeśli użytkownik już zalogowany
Layout: AuthLayout
Zawiera: RegisterForm (React)
```

**src/pages/auth/forgot-password.astro**
```
Cel: Żądanie resetu hasła
SSR: Tak
Redirect: Przekierowanie do /fridge jeśli użytkownik już zalogowany
Layout: AuthLayout
Zawiera: ForgotPasswordForm (React)
```

**src/pages/auth/reset-password.astro**
```
Cel: Ustawienie nowego hasła (po kliknięciu w link z emaila)
SSR: Tak
Query Params: ?token=xxx&type=recovery
Redirect: Błąd jeśli brak tokenu
Layout: AuthLayout
Zawiera: ResetPasswordForm (React)
```

**Logika SSR:**
```typescript
// src/pages/auth/reset-password.astro
---
const token = Astro.url.searchParams.get('token');
const type = Astro.url.searchParams.get('type');

if (!token || type !== 'recovery') {
  return Astro.redirect('/auth/login?error=invalid_reset_link');
}
---
```

**src/pages/auth/verify-email.astro**
```
Cel: Weryfikacja emaila po kliknięciu w link aktywacyjny
SSR: Tak
Query Params: ?token=xxx&type=signup
Auto-processing: Tak (weryfikacja odbywa się w SSR)
Layout: AuthLayout
Zawiera: Status weryfikacji (sukces/błąd)
```

**Logika SSR:**
```typescript
// src/pages/auth/verify-email.astro
---
const token = Astro.url.searchParams.get('token');
const type = Astro.url.searchParams.get('type');

let verificationStatus = { success: false, error: '' };

if (token && type === 'signup') {
  const { error } = await Astro.locals.supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email'
  });

  verificationStatus = {
    success: !error,
    error: error?.message || ''
  };
}
---
```

**src/pages/index.astro (modyfikacja)**
```
Cel: Landing page z opcją demo i logowania
SSR: Tak
Redirect: Przekierowanie do /fridge jeśli użytkownik już zalogowany
Layout: Layout
Zawiera: Przyciski nawigacji (Demo, Logowanie, Rejestracja)
```

**Logika SSR:**
```typescript
// src/pages/index.astro (rozszerzenie)
---
const session = await Astro.locals.supabase.auth.getSession();
if (session.data.session) {
  // Sprawdź czy to użytkownik demo
  const user = session.data.session.user;
  if (user.user_metadata?.is_demo) {
    return Astro.redirect('/fridge?demo=true');
  }
  return Astro.redirect('/fridge');
}
---
```

#### 2.1.2 Strony Chronione (Auth Required)

**src/pages/fridge.astro (modyfikacja)**
```
Cel: Główna strona aplikacji - lista produktów
SSR: Tak
Auth: Wymagana (middleware)
Redirect: Przekierowanie do /auth/login jeśli brak sesji
Layout: Layout
Zawiera: FridgeView (React), AppNavigation
```

**Logika SSR:**
```typescript
// src/pages/fridge.astro (rozszerzenie)
---
// Middleware sprawdzi auth i ustawi context.locals.user
const user = Astro.locals.user;

if (!user) {
  return Astro.redirect('/auth/login?redirect=/fridge');
}

// Sprawdź czy to demo mode
const isDemoMode = user.isDemo || Astro.url.searchParams.get('demo') === 'true';
---
```

**src/pages/fridge/add.astro (modyfikacja)**
```
Auth: Wymagana (middleware)
Redirect: Przekierowanie do /auth/login jeśli brak sesji
```

**src/pages/fridge/edit/[id].astro (modyfikacja)**
```
Auth: Wymagana (middleware)
Redirect: Przekierowanie do /auth/login jeśli brak sesji
```

### 2.2 Komponenty React

#### 2.2.1 Formularze Autentykacji

**src/components/auth/LoginForm.tsx**

**Odpowiedzialność:**
- Renderowanie formularza logowania (email, password)
- Walidacja client-side (format email, długość hasła)
- Wywołanie API /api/auth/login
- Obsługa błędów i komunikatów
- Zapisanie tokenu do localStorage
- Przekierowanie do /fridge po sukcesie

**Integracja z backendem:**
- Używa fetch() do wywołania POST /api/auth/login
- Przekazuje AuthLoginRequest
- Otrzymuje AuthResponse
- Zapisuje accessToken w localStorage
- Ustawia token w Supabase client

**State Management:**
```typescript
interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}
```

**Walidacja:**
```typescript
const validateLoginForm = (data: LoginFormState): string | null => {
  if (!data.email) return 'Email jest wymagany';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return 'Nieprawidłowy format email';
  if (!data.password) return 'Hasło jest wymagane';
  if (data.password.length < 8)
    return 'Hasło musi mieć min. 8 znaków';
  return null;
};
```

**Komunikaty błędów:**
- "Email lub hasło nieprawidłowe" - błędne dane logowania
- "Konto nie zostało zweryfikowane. Sprawdź email." - brak weryfikacji
- "Wystąpił błąd. Spróbuj ponownie." - błąd serwera
- "Zbyt wiele prób logowania. Spróbuj za chwilę." - rate limiting

**Przykładowa implementacja flow:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // Walidacja
  const validationError = validateLoginForm(formState);
  if (validationError) {
    setError(validationError);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Wywołanie API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email,
        password: formState.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logowanie nie powiodło się');
    }

    const data: AuthResponse = await response.json();

    // Zapisz token
    localStorage.setItem('supabase_token', data.accessToken);

    // Ustaw token w Supabase client (globalnie)
    await supabaseClient.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken
    });

    // Przekieruj
    window.location.href = '/fridge';

  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**src/components/auth/RegisterForm.tsx**

**Odpowiedzialność:**
- Renderowanie formularza rejestracji (email, password, confirmPassword)
- Walidacja client-side (siła hasła, zgodność haseł)
- Wywołanie API /api/auth/register
- Wyświetlenie komunikatu o wysłaniu emaila weryfikacyjnego
- Obsługa błędów

**State Management:**
```typescript
interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean; // Pokazuje komunikat o wysłaniu emaila
}
```

**Walidacja:**
```typescript
const validateRegisterForm = (data: RegisterFormState): string | null => {
  if (!data.email) return 'Email jest wymagany';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return 'Nieprawidłowy format email';
  if (!data.password) return 'Hasło jest wymagane';
  if (data.password.length < 8)
    return 'Hasło musi mieć min. 8 znaków';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password))
    return 'Hasło musi zawierać małe i wielkie litery oraz cyfrę';
  if (data.password !== data.confirmPassword)
    return 'Hasła muszą być identyczne';
  return null;
};
```

**Komunikaty:**
- Sukces: "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email i kliknij link aktywacyjny."
- Błędy: "Email już istnieje", "Błąd serwera", etc.

**src/components/auth/ForgotPasswordForm.tsx**

**Odpowiedzialność:**
- Renderowanie formularza z polem email
- Walidacja email
- Wywołanie API /api/auth/forgot-password
- Wyświetlenie komunikatu o wysłaniu emaila z linkiem resetującym

**State Management:**
```typescript
interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

**Komunikaty:**
- Sukces: "Link do resetowania hasła został wysłany na Twój email."
- Błąd: "Nie znaleziono użytkownika z tym emailem"

**src/components/auth/ResetPasswordForm.tsx**

**Odpowiedzialność:**
- Renderowanie formularza (newPassword, confirmPassword)
- Walidacja siły hasła
- Wywołanie API /api/auth/reset-password z tokenem
- Przekierowanie do /auth/login po sukcesie

**Props:**
```typescript
interface ResetPasswordFormProps {
  token: string; // Przekazany z Astro page
}
```

**State Management:**
```typescript
interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

#### 2.2.2 Komponenty Pomocnicze

**src/components/auth/AuthLayout.tsx** (opcjonalny - może być .astro)

**Odpowiedzialność:**
- Wspólny layout dla stron auth
- Logo, tytuł, stopka
- Centrowanie formularza
- Linki pomocnicze (Masz konto? Zaloguj się)

**src/components/auth/DemoModeIndicator.tsx**

**Odpowiedzialność:**
- Wyświetlanie baneru "Tryb Demo" na chronionych stronach
- Przycisk "Zarejestruj się, aby zapisać dane"
- Informacja o ograniczeniach demo

**Umiejscowienie:**
- Top sticky banner na wszystkich stronach w trybie demo
- Integracja z AppNavigation

**src/components/AppNavigation.tsx (modyfikacja)**

**Nowe funkcjonalności:**
- Wyświetlanie email zalogowanego użytkownika
- Menu dropdown z opcjami:
  - Mój profil (opcjonalne)
  - Wyloguj się
- Przycisk "Wyloguj" wywołujący POST /api/auth/logout

**Integracja z useAuth:**
```typescript
const AppNavigation = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // Wywołuje API i czyści localStorage
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <nav>
      {/* ... existing navigation ... */}
      <div className="user-menu">
        <span>{user?.email}</span>
        <button onClick={handleLogout}>Wyloguj</button>
      </div>
    </nav>
  );
};
```

### 2.3 Layouts Astro

#### src/layouts/AuthLayout.astro

**Cel:**
- Dedykowany layout dla stron autentykacji
- Centrowanie formularzy
- Minimalistyczny design
- Logo i podstawowe informacje

**Struktura:**
```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/globals.css" />
  </head>
  <body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <Logo size="lg" />
          <h1 class="text-2xl font-bold mt-4">{title}</h1>
        </div>

        <div class="bg-white rounded-lg shadow-md p-8">
          <slot />
        </div>

        <div class="text-center mt-4 text-sm text-gray-600">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </body>
</html>
```

#### src/layouts/Layout.astro (modyfikacja)

**Nowe elementy:**
- Warunkowe renderowanie AppNavigation (tylko dla zalogowanych)
- Wsparcie dla DemoModeIndicator
- Flash messages dla błędów auth

### 2.4 Routing i Nawigacja

#### Mapa Routingu

**Publiczne:**
- `/` - Landing page (przekierowanie do /fridge jeśli zalogowany)
- `/auth/login` - Logowanie
- `/auth/register` - Rejestracja
- `/auth/forgot-password` - Reset hasła
- `/auth/reset-password?token=xxx` - Ustawienie nowego hasła
- `/auth/verify-email?token=xxx` - Weryfikacja emaila

**Chronione (wymagają auth):**
- `/fridge` - Lista produktów
- `/fridge/add` - Dodawanie produktu
- `/fridge/edit/[id]` - Edycja produktu

**Specjalne:**
- `/api/auth/demo` - Inicjalizacja trybu demo (przekierowanie do /fridge?demo=true)

#### Scenariusze Nawigacji

**Scenariusz 1: Niezalogowany użytkownik próbuje wejść na /fridge**
1. Middleware wykrywa brak sesji
2. Przekierowanie do /auth/login?redirect=/fridge
3. Po zalogowaniu → przekierowanie do /fridge

**Scenariusz 2: Zalogowany użytkownik wchodzi na /auth/login**
1. SSR wykrywa istniejącą sesję
2. Przekierowanie do /fridge

**Scenariusz 3: Użytkownik klika "Wypróbuj demo" na stronie głównej**
1. Kliknięcie wywołuje POST /api/auth/demo
2. Backend tworzy tymczasowego użytkownika demo
3. Zwraca AuthResponse z tokenem
4. Frontend zapisuje token
5. Przekierowanie do /fridge?demo=true
6. Wyświetlenie DemoModeIndicator

**Scenariusz 4: Użytkownik w trybie demo klika "Zarejestruj się"**
1. Przekierowanie do /auth/register
2. Po rejestracji → przekierowanie do komunikatu o weryfikacji
3. Po weryfikacji → przekierowanie do /auth/login

**Scenariusz 5: Użytkownik otrzymuje email weryfikacyjny**
1. Kliknięcie linku → /auth/verify-email?token=xxx&type=signup
2. SSR weryfikuje token przez Supabase
3. Wyświetlenie komunikatu sukcesu/błędu
4. Link do /auth/login

**Scenariusz 6: Użytkownik klika "Zapomniałem hasła"**
1. /auth/forgot-password
2. Wprowadzenie email → POST /api/auth/forgot-password
3. Wyświetlenie komunikatu o wysłaniu emaila
4. Otrzymanie emaila z linkiem
5. Kliknięcie → /auth/reset-password?token=xxx&type=recovery
6. Ustawienie nowego hasła → POST /api/auth/reset-password
7. Przekierowanie do /auth/login

### 2.5 Walidacja i Komunikaty Błędów

#### Walidacja Client-Side

**Email:**
- Wymagany
- Format: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Komunikat: "Nieprawidłowy format email"

**Hasło (logowanie):**
- Wymagane
- Min. 8 znaków
- Komunikat: "Hasło musi mieć minimum 8 znaków"

**Hasło (rejestracja):**
- Wymagane
- Min. 8 znaków
- Musi zawierać: małą literę, wielką literę, cyfrę
- Komunikat: "Hasło musi zawierać małe i wielkie litery oraz cyfrę"

**Potwierdzenie hasła:**
- Musi być identyczne z hasłem
- Komunikat: "Hasła muszą być identyczne"

#### Komunikaty Błędów API

**Rejestracja:**
- 400: "Email już istnieje w systemie"
- 400: "Nieprawidłowy format danych"
- 500: "Błąd serwera. Spróbuj ponownie później"

**Logowanie:**
- 401: "Email lub hasło nieprawidłowe"
- 403: "Konto nie zostało zweryfikowane. Sprawdź email."
- 429: "Zbyt wiele prób logowania. Spróbuj za chwilę."
- 500: "Błąd serwera. Spróbuj ponownie później"

**Reset hasła:**
- 404: "Nie znaleziono użytkownika z tym emailem"
- 400: "Nieprawidłowy lub wygasły token resetujący"
- 500: "Błąd serwera. Spróbuj ponownie później"

#### Komunikaty Sukcesu

- **Rejestracja**: "Rejestracja przebiegła pomyślnie! Sprawdź swoją skrzynkę email i kliknij link aktywacyjny."
- **Logowanie**: Przekierowanie bez komunikatu
- **Forgot Password**: "Link do resetowania hasła został wysłany na Twój email."
- **Reset Password**: "Hasło zostało zmienione. Możesz się teraz zalogować."
- **Weryfikacja Email**: "Email został zweryfikowany. Możesz się teraz zalogować."

---

## 3. LOGIKA BACKENDOWA

### 3.1 API Endpoints

#### 3.1.1 POST /api/auth/register

**Plik:** `src/pages/api/auth/register.ts`

**Request:**
```typescript
interface AuthRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}
```

**Response (Success - 200):**
```typescript
interface ApiSuccessResponse {
  success: true;
  message: string; // "Sprawdź email i kliknij link aktywacyjny"
}
```

**Response (Error - 400/500):**
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**Logika:**
```typescript
export const POST = async ({ request }: APIContext) => {
  try {
    const body: AuthRegisterRequest = await request.json();

    // 1. Walidacja server-side
    const validationError = validateRegistrationData(body);
    if (validationError) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validationError }
      }), { status: 400 });
    }

    // 2. Sprawdź zgodność haseł
    if (body.password !== body.confirmPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'PASSWORDS_MISMATCH', message: 'Hasła muszą być identyczne' }
      }), { status: 400 });
    }

    // 3. Wywołaj Supabase Auth signup
    const { data, error } = await supabaseClient.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        emailRedirectTo: `${import.meta.env.PUBLIC_APP_URL}/auth/verify-email`
      }
    });

    if (error) {
      // Obsłuż różne typy błędów Supabase
      if (error.message.includes('already registered')) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email już istnieje w systemie' }
        }), { status: 400 });
      }

      throw error;
    }

    // 4. Zwróć sukces (użytkownik musi zweryfikować email)
    return new Response(JSON.stringify({
      success: true,
      message: 'Sprawdź email i kliknij link aktywacyjny'
    }), { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd serwera' }
    }), { status: 500 });
  }
};
```

**Walidacja Server-Side:**
```typescript
const validateRegistrationData = (data: AuthRegisterRequest): string | null => {
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Nieprawidłowy email';
  }
  if (!data.password || data.password.length < 8) {
    return 'Hasło musi mieć min. 8 znaków';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    return 'Hasło musi zawierać małe i wielkie litery oraz cyfrę';
  }
  return null;
};
```

#### 3.1.2 POST /api/auth/login

**Plik:** `src/pages/api/auth/login.ts`

**Request:**
```typescript
interface AuthLoginRequest {
  email: string;
  password: string;
}
```

**Response (Success - 200):**
```typescript
interface AuthResponse {
  success: boolean;
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
```

**Response (Error - 401/403/500):**
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**Logika:**
```typescript
export const POST = async ({ request }: APIContext) => {
  try {
    const body: AuthLoginRequest = await request.json();

    // 1. Walidacja
    if (!body.email || !body.password) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email i hasło są wymagane' }
      }), { status: 400 });
    }

    // 2. Wywołaj Supabase Auth signInWithPassword
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error) {
      // Obsłuż błędy logowania
      if (error.message.includes('Invalid login credentials')) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Email lub hasło nieprawidłowe' }
        }), { status: 401 });
      }

      throw error;
    }

    // 3. Sprawdź weryfikację emaila
    if (!data.user.email_confirmed_at) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Konto nie zostało zweryfikowane. Sprawdź email.'
        }
      }), { status: 403 });
    }

    // 4. Przygotuj UserDTO
    const userDTO: UserDTO = {
      id: data.user.id,
      email: data.user.email!,
      isDemo: data.user.user_metadata?.is_demo || false,
      isEmailVerified: !!data.user.email_confirmed_at
    };

    // 5. Zwróć token i dane użytkownika
    return new Response(JSON.stringify({
      success: true,
      user: userDTO,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd serwera' }
    }), { status: 500 });
  }
};
```

#### 3.1.3 POST /api/auth/logout

**Plik:** `src/pages/api/auth/logout.ts`

**Request:**
- Wymaga Bearer token w header Authorization

**Response (Success - 200):**
```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
}
```

**Logika:**
```typescript
export const POST = async ({ request, locals }: APIContext) => {
  try {
    // 1. Pobierz token z headera
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Brak tokenu' }
      }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Wywołaj Supabase signOut
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      throw error;
    }

    // 3. Zwróć sukces
    return new Response(JSON.stringify({
      success: true,
      message: 'Wylogowano pomyślnie'
    }), { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd serwera' }
    }), { status: 500 });
  }
};
```

#### 3.1.4 POST /api/auth/forgot-password

**Plik:** `src/pages/api/auth/forgot-password.ts`

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Response (Success - 200):**
```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
}
```

**Logika:**
```typescript
export const POST = async ({ request }: APIContext) => {
  try {
    const body: ForgotPasswordRequest = await request.json();

    // 1. Walidacja
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nieprawidłowy email' }
      }), { status: 400 });
    }

    // 2. Wywołaj Supabase resetPasswordForEmail
    const { error } = await supabaseClient.auth.resetPasswordForEmail(body.email, {
      redirectTo: `${import.meta.env.PUBLIC_APP_URL}/auth/reset-password`
    });

    if (error) {
      // Note: Supabase nie zwraca błędu jeśli email nie istnieje (security best practice)
      console.error('Password reset error:', error);
    }

    // 3. Zawsze zwróć sukces (nie ujawniaj czy email istnieje)
    return new Response(JSON.stringify({
      success: true,
      message: 'Jeśli email istnieje w systemie, link został wysłany'
    }), { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd serwera' }
    }), { status: 500 });
  }
};
```

#### 3.1.5 POST /api/auth/reset-password

**Plik:** `src/pages/api/auth/reset-password.ts`

**Request:**
```typescript
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

**Response (Success - 200):**
```typescript
interface ApiSuccessResponse {
  success: true;
  message: string;
}
```

**Logika:**
```typescript
export const POST = async ({ request }: APIContext) => {
  try {
    const body: ResetPasswordRequest = await request.json();

    // 1. Walidacja
    if (!body.token || !body.newPassword) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Token i hasło są wymagane' }
      }), { status: 400 });
    }

    if (body.newPassword.length < 8) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Hasło musi mieć min. 8 znaków' }
      }), { status: 400 });
    }

    // 2. Weryfikuj token i ustaw nowe hasło przez Supabase
    // Note: Supabase verifyOtp automatycznie weryfikuje token
    const { error } = await supabaseClient.auth.updateUser({
      password: body.newPassword
    });

    if (error) {
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Token jest nieprawidłowy lub wygasł' }
        }), { status: 400 });
      }

      throw error;
    }

    // 3. Zwróć sukces
    return new Response(JSON.stringify({
      success: true,
      message: 'Hasło zostało zmienione'
    }), { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd serwera' }
    }), { status: 500 });
  }
};
```

#### 3.1.6 POST /api/auth/demo

**Plik:** `src/pages/api/auth/demo.ts`

**Cel:** Utworzenie tymczasowego użytkownika demo bez rejestracji

**Request:** Brak body

**Response (Success - 200):**
```typescript
interface AuthResponse {
  success: boolean;
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
```

**Logika:**
```typescript
export const POST = async ({ request }: APIContext) => {
  try {
    // 1. Wygeneruj unikalny email dla demo
    const demoEmail = `demo_${crypto.randomUUID()}@fridgepick.demo`;
    const demoPassword = crypto.randomUUID();

    // 2. Utwórz użytkownika demo przez Supabase
    const { data, error } = await supabaseClient.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          is_demo: true
        },
        emailRedirectTo: undefined // Brak weryfikacji dla demo
      }
    });

    if (error) {
      throw error;
    }

    // 3. Automatycznie zaloguj użytkownika demo
    const { data: sessionData, error: signInError } =
      await supabaseClient.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

    if (signInError) {
      throw signInError;
    }

    // 4. Opcjonalnie: Seeduj przykładowe produkty dla użytkownika demo
    await seedDemoProducts(sessionData.user.id);

    // 5. Przygotuj UserDTO
    const userDTO: UserDTO = {
      id: sessionData.user.id,
      email: demoEmail,
      isDemo: true,
      isEmailVerified: true // Demo nie wymaga weryfikacji
    };

    // 6. Zwróć token i dane
    return new Response(JSON.stringify({
      success: true,
      user: userDTO,
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token
    }), { status: 200 });

  } catch (error) {
    console.error('Demo creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Błąd tworzenia trybu demo' }
    }), { status: 500 });
  }
};
```

#### 3.1.7 GET /api/auth/me

**Plik:** `src/pages/api/auth/me.ts`

**Cel:** Pobranie danych zalogowanego użytkownika

**Request:**
- Wymaga Bearer token w header Authorization

**Response (Success - 200):**
```typescript
interface MeResponse {
  success: boolean;
  user: UserDTO;
}
```

**Logika:**
```typescript
import { requireAuthentication } from '@/middleware/auth';

export const GET = async ({ request, locals }: APIContext) => {
  try {
    // 1. Użyj middleware do walidacji tokenu
    const user = await requireAuthentication(request, locals.supabase);

    // 2. Zwróć UserDTO
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isDemo: user.isDemo,
        isEmailVerified: user.isEmailVerified
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Brak autoryzacji' }
    }), { status: 401 });
  }
};
```

### 3.2 Modele Danych

#### Database Schema (Supabase)

**Tabela: auth.users (zarządzana przez Supabase Auth)**
```sql
-- Supabase automatycznie tworzy tę tabelę
-- Kluczowe pola:
-- id: uuid (primary key)
-- email: varchar
-- encrypted_password: varchar
-- email_confirmed_at: timestamp
-- user_metadata: jsonb (dla is_demo flag)
-- created_at: timestamp
-- updated_at: timestamp
```

**Rozszerzenie user_metadata dla trybu demo:**
```typescript
interface UserMetadata {
  is_demo?: boolean;
}
```

**Tabela: public.user_products (już istnieje)**
```sql
-- Relacja z auth.users przez user_id
-- user_id: uuid (foreign key do auth.users.id)
-- Inne pola zgodnie z obecnym schema
```

**RLS (Row Level Security) Policies:**

Dla user_products:
```sql
-- Polityka SELECT: użytkownik widzi tylko swoje produkty
CREATE POLICY "Users can view own products"
  ON public.user_products
  FOR SELECT
  USING (auth.uid() = user_id);

-- Polityka INSERT: użytkownik może dodawać swoje produkty
CREATE POLICY "Users can insert own products"
  ON public.user_products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Polityka UPDATE: użytkownik może edytować swoje produkty
CREATE POLICY "Users can update own products"
  ON public.user_products
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Polityka DELETE: użytkownik może usuwać swoje produkty
CREATE POLICY "Users can delete own products"
  ON public.user_products
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 3.3 Walidacja Danych Wejściowych

#### Wspólne Funkcje Walidacyjne

**src/validation/auth.ts**

```typescript
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email jest wymagany';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Nieprawidłowy format email';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Hasło jest wymagane';
  if (password.length < 8) return 'Hasło musi mieć min. 8 znaków';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Hasło musi zawierać małe i wielkie litery oraz cyfrę';
  }
  return null;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): string | null => {
  if (password !== confirmPassword) {
    return 'Hasła muszą być identyczne';
  }
  return null;
};

export const validateRegistrationData = (
  data: AuthRegisterRequest
): string | null => {
  const emailError = validateEmail(data.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) return passwordError;

  const matchError = validatePasswordMatch(data.password, data.confirmPassword);
  if (matchError) return matchError;

  return null;
};
```

### 3.4 Obsługa Wyjątków

#### Centralizacja Błędów

**src/lib/auth-errors.ts**

```typescript
export enum AuthErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR'
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.VALIDATION_ERROR]: 'Błąd walidacji danych',
  [AuthErrorCode.EMAIL_EXISTS]: 'Email już istnieje w systemie',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Email lub hasło nieprawidłowe',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Konto nie zostało zweryfikowane',
  [AuthErrorCode.INVALID_TOKEN]: 'Token jest nieprawidłowy lub wygasł',
  [AuthErrorCode.WEAK_PASSWORD]: 'Hasło jest za słabe',
  [AuthErrorCode.UNAUTHORIZED]: 'Brak autoryzacji',
  [AuthErrorCode.SERVER_ERROR]: 'Błąd serwera'
};

export const createAuthError = (
  code: AuthErrorCode,
  customMessage?: string
): { code: AuthErrorCode; message: string } => {
  return {
    code,
    message: customMessage || AUTH_ERROR_MESSAGES[code]
  };
};
```

### 3.5 Aktualizacja Renderowania Server-Side

#### Middleware Astro - Rozszerzenie

**src/middleware/index.ts (modyfikacja)**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';

export const onRequest = defineMiddleware(async (context, next) => {
  // Dodaj supabase do context
  context.locals.supabase = supabaseClient;

  // Sprawdź czy użytkownik jest zalogowany (opcjonalnie)
  const authHeader = context.request.headers.get('authorization');
  const cookieToken = context.cookies.get('sb-access-token')?.value;

  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (token) {
    try {
      const { data, error } = await supabaseClient.auth.getUser(token);

      if (!error && data.user) {
        // Dodaj użytkownika do context
        context.locals.user = {
          id: data.user.id,
          email: data.user.email!,
          isDemo: data.user.user_metadata?.is_demo || false,
          isEmailVerified: !!data.user.email_confirmed_at
        };
      }
    } catch (err) {
      console.error('Auth middleware error:', err);
    }
  }

  // Ochrona chronionych stron
  const protectedPaths = ['/fridge', '/fridge/add', '/fridge/edit'];
  const isProtectedPath = protectedPaths.some(path =>
    context.url.pathname.startsWith(path)
  );

  if (isProtectedPath && !context.locals.user) {
    // Przekieruj do logowania z redirect param
    return context.redirect(
      `/auth/login?redirect=${encodeURIComponent(context.url.pathname)}`
    );
  }

  return next();
});
```

**Typy dla context.locals:**

**src/env.d.ts (rozszerzenie)**

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly PUBLIC_APP_URL: string;
}

declare namespace App {
  interface Locals {
    supabase: import('@supabase/supabase-js').SupabaseClient<
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

---

## 4. SYSTEM AUTENTYKACJI Z SUPABASE

### 4.1 Konfiguracja Supabase Auth

#### Email Templates

**Weryfikacja emaila (Confirmation):**
```html
<h2>Witaj w FridgePick!</h2>
<p>Kliknij poniższy link, aby zweryfikować swój adres email:</p>
<a href="{{ .ConfirmationURL }}">Zweryfikuj email</a>
<p>Link jest ważny przez 24 godziny.</p>
```

**Reset hasła (Recovery):**
```html
<h2>Reset hasła - FridgePick</h2>
<p>Otrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta.</p>
<a href="{{ .ConfirmationURL }}">Zresetuj hasło</a>
<p>Jeśli to nie Ty, zignoruj ten email.</p>
<p>Link jest ważny przez 1 godzinę.</p>
```

#### Redirect URLs

Konfiguracja w Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://fridgepick.app (lub localhost:3000 dla dev)

Redirect URLs:
- https://fridgepick.app/auth/verify-email
- https://fridgepick.app/auth/reset-password
- http://localhost:3000/auth/verify-email (dev)
- http://localhost:3000/auth/reset-password (dev)
```

#### Auth Settings

```
Email confirmations: Enabled
Secure email change: Enabled
Email OTP expiry: 86400 (24h dla weryfikacji)
Password minimum length: 8
```

### 4.2 Integracja Supabase Auth w Aplikacji

#### Client-Side: Inicjalizacja Supabase

**src/db/supabase.client.ts (rozszerzenie)**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Helper do ustawiania tokenu z localStorage (np. po logowaniu)
export const setSupabaseSession = async (accessToken: string, refreshToken: string) => {
  const { data, error } = await supabaseClient.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error) {
    console.error('Failed to set session:', error);
    throw error;
  }

  return data;
};

// Helper do wylogowania
export const signOutSupabase = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error('Failed to sign out:', error);
    throw error;
  }

  // Wyczyść localStorage
  localStorage.removeItem('supabase_token');
};
```

#### Hook useAuth - Prawdziwa Implementacja

**src/hooks/useAuth.ts (pełna implementacja)**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { UserDTO, AuthLoginRequest, AuthRegisterRequest } from '@/types';
import { supabaseClient, setSupabaseSession, signOutSupabase } from '@/db/supabase.client';

interface AuthState {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  });

  // Sprawdź sesję przy montowaniu komponentu
  useEffect(() => {
    checkSession();

    // Nasłuchuj zmian sesji
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          const userDTO: UserDTO = {
            id: session.user.id,
            email: session.user.email!,
            isDemo: session.user.user_metadata?.is_demo || false,
            isEmailVerified: !!session.user.email_confirmed_at
          };

          setState({
            user: userDTO,
            loading: false,
            isAuthenticated: true
          });
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        const userDTO: UserDTO = {
          id: session.user.id,
          email: session.user.email!,
          isDemo: session.user.user_metadata?.is_demo || false,
          isEmailVerified: !!session.user.email_confirmed_at
        };

        setState({
          user: userDTO,
          loading: false,
          isAuthenticated: true
        });
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    }
  };

  const login = useCallback(async (credentials: AuthLoginRequest) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Logowanie nie powiodło się');
      }

      const data = await response.json();

      // Ustaw sesję w Supabase client
      await setSupabaseSession(data.accessToken, data.refreshToken);

      setState({
        user: data.user,
        loading: false,
        isAuthenticated: true
      });

      return data.user;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: AuthRegisterRequest) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Rejestracja nie powiodła się');
      }

      const data = await response.json();

      setState(prev => ({ ...prev, loading: false }));

      return data;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutSupabase();

      // Opcjonalnie wywołaj backend endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`
        }
      });

      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const startDemoMode = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Nie udało się uruchomić trybu demo');
      }

      const data = await response.json();

      // Ustaw sesję
      await setSupabaseSession(data.accessToken, data.refreshToken);

      setState({
        user: data.user,
        loading: false,
        isAuthenticated: true
      });

      return data.user;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    startDemoMode,
    refreshSession: checkSession
  };
};
```

### 4.3 Zarządzanie Sesją

#### Token Storage

**Client-Side:**
- Supabase automatycznie zarządza tokenami przez `localStorage`
- Key: `sb-<project-id>-auth-token`
- Zawiera: access_token, refresh_token, expires_at

**Server-Side:**
- Tokeny przekazywane przez Authorization header: `Bearer <access_token>`
- Walidacja przez Supabase `auth.getUser(token)`

#### Token Refresh

**Automatyczny Refresh:**
- Supabase client automatycznie odświeża tokeny przy `autoRefreshToken: true`
- Refresh następuje przed wygaśnięciem tokenu (domyślnie 1h)

**Manual Refresh (jeśli potrzebny):**
```typescript
const refreshToken = async () => {
  const { data, error } = await supabaseClient.auth.refreshSession();

  if (error) {
    console.error('Token refresh failed:', error);
    // Wyloguj użytkownika
    await signOutSupabase();
    window.location.href = '/auth/login';
    return;
  }

  return data.session;
};
```

#### Session Persistence

**Cross-Tab Synchronization:**
- Supabase automatycznie synchronizuje sesję między kartami
- Listener `onAuthStateChange` reaguje na zmiany

**Logout z wszystkich kart:**
```typescript
// W useAuth.logout():
await supabaseClient.auth.signOut({ scope: 'global' });
```

### 4.4 Demo Mode Implementation

#### DemoService

**src/services/DemoService.ts**

```typescript
import { supabaseClient } from '@/db/supabase.client';

export class DemoService {
  /**
   * Tworzy użytkownika demo z przykładowymi produktami
   */
  static async createDemoUser(): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const demoEmail = `demo_${crypto.randomUUID()}@fridgepick.demo`;
    const demoPassword = crypto.randomUUID();

    // 1. Utwórz użytkownika
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          is_demo: true
        }
      }
    });

    if (signUpError) {
      throw new Error(`Failed to create demo user: ${signUpError.message}`);
    }

    // 2. Zaloguj użytkownika
    const { data: signInData, error: signInError } =
      await supabaseClient.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

    if (signInError) {
      throw new Error(`Failed to sign in demo user: ${signInError.message}`);
    }

    return {
      userId: signInData.user.id,
      accessToken: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token
    };
  }

  /**
   * Seeduje przykładowe produkty dla użytkownika demo
   */
  static async seedDemoProducts(userId: string): Promise<void> {
    const demoProducts = [
      {
        user_id: userId,
        name: 'Mleko',
        category_id: 1, // Nabiał
        quantity: 1,
        unit: 'l',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        name: 'Jajka',
        category_id: 1,
        quantity: 10,
        unit: 'szt',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        name: 'Pomidory',
        category_id: 4, // Warzywa
        quantity: 500,
        unit: 'g',
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        name: 'Pierś z kurczaka',
        category_id: 2, // Mięso
        quantity: 500,
        unit: 'g',
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { error } = await supabaseClient
      .from('user_products')
      .insert(demoProducts);

    if (error) {
      console.error('Failed to seed demo products:', error);
      // Nie rzucaj błędu - produkty to nice-to-have
    }
  }

  /**
   * Sprawdza czy użytkownik jest w trybie demo
   */
  static isDemoUser(user: { isDemo: boolean }): boolean {
    return user.isDemo;
  }

  /**
   * Czyści dane użytkownika demo (opcjonalne - do crona)
   */
  static async cleanupDemoData(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    // 1. Znajdź starych użytkowników demo
    const { data: oldDemoUsers, error: fetchError } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('user_metadata->>is_demo', 'true')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      console.error('Failed to fetch old demo users:', fetchError);
      return;
    }

    // 2. Usuń ich produkty
    for (const user of oldDemoUsers || []) {
      await supabaseClient
        .from('user_products')
        .delete()
        .eq('user_id', user.id);

      // Note: Usunięcie użytkownika z auth.users wymaga admin API
      // Można to zrobić przez Supabase Admin SDK lub scheduled function
    }
  }
}
```

#### Demo Mode UX

**Ograniczenia trybu demo:**
1. Brak możliwości edycji profilu
2. Dane mogą być usunięte po 7 dniach
3. Brak możliwości eksportu danych
4. Baner informacyjny na górze strony

**DemoModeIndicator.tsx:**
```typescript
export const DemoModeIndicator = () => {
  const { user } = useAuth();

  if (!user?.isDemo) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-yellow-800 font-medium">
            🎭 Tryb Demo
          </span>
          <span className="text-yellow-700 text-sm">
            Twoje dane będą usunięte po 7 dniach
          </span>
        </div>
        <a
          href="/auth/register"
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Zarejestruj się, aby zapisać dane
        </a>
      </div>
    </div>
  );
};
```

### 4.5 Security Best Practices

#### Rate Limiting

**Wykorzystanie istniejącego systemu z auth.ts:**
- Funkcja `checkUserRateLimit()` już zaimplementowana
- Domyślnie: 100 req/min dla zwykłych, 50 req/min dla demo
- Przykład użycia w endpointach:

```typescript
// W /api/auth/login
const user = await requireAuthentication(request, locals.supabase);
const rateLimitCheck = checkUserRateLimit(user, 10, 60 * 1000); // 10 req/min

if (!rateLimitCheck.allowed) {
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Zbyt wiele prób. Spróbuj za chwilę.' }
  }), {
    status: 429,
    headers: rateLimitCheck.headers
  });
}
```

#### CSRF Protection

**Dla API endpoints:**
- Supabase JWT tokens zawierają signature
- Walidacja przez `auth.getUser(token)` zapobiega CSRF

**Dla form submissions:**
```typescript
// Opcjonalnie: dodaj CSRF token do formularzy
// Dla Astro można użyć middleware do generowania tokenów
```

#### XSS Prevention

- Wszystkie dane użytkownika sanityzowane przez React (automatyczne escaping)
- Content Security Policy w headers:

```typescript
// W Layout.astro lub middleware
const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
```

#### SQL Injection Prevention

- Supabase używa prepared statements
- RLS policies zapobiegają nieautoryzowanemu dostępowi
- TypeScript types zapewniają type safety

---

## 5. PODSUMOWANIE I KLUCZOWE KONTRAKY

### 5.1 Struktura Katalogów

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── DemoModeIndicator.tsx
│   ├── AppNavigation.tsx (modyfikacja)
│   └── ...
├── hooks/
│   └── useAuth.ts (pełna implementacja)
├── layouts/
│   ├── AuthLayout.astro (nowy)
│   └── Layout.astro (modyfikacja)
├── middleware/
│   ├── auth.ts (istniejący)
│   └── index.ts (rozszerzenie)
├── pages/
│   ├── auth/
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── forgot-password.astro
│   │   ├── reset-password.astro
│   │   └── verify-email.astro
│   ├── api/
│   │   └── auth/
│   │       ├── register.ts
│   │       ├── login.ts
│   │       ├── logout.ts
│   │       ├── forgot-password.ts
│   │       ├── reset-password.ts
│   │       ├── demo.ts
│   │       └── me.ts
│   ├── index.astro (modyfikacja)
│   ├── fridge.astro (modyfikacja - auth required)
│   └── ...
├── services/
│   └── DemoService.ts (nowy)
├── validation/
│   └── auth.ts (nowy)
├── lib/
│   └── auth-errors.ts (nowy)
├── db/
│   └── supabase.client.ts (rozszerzenie)
└── types.ts (istniejący - zawiera już typy auth)
```

### 5.2 Kluczowe Kontrakty

#### API Contracts

**POST /api/auth/register**
- Input: `{ email, password, confirmPassword }`
- Output: `{ success: true, message: string }`
- Errors: 400 (validation), 500 (server)

**POST /api/auth/login**
- Input: `{ email, password }`
- Output: `{ success: true, user: UserDTO, accessToken: string, refreshToken: string }`
- Errors: 401 (invalid creds), 403 (not verified), 500

**POST /api/auth/logout**
- Headers: `Authorization: Bearer <token>`
- Output: `{ success: true, message: string }`
- Errors: 401 (unauthorized), 500

**POST /api/auth/forgot-password**
- Input: `{ email }`
- Output: `{ success: true, message: string }`
- Errors: 500

**POST /api/auth/reset-password**
- Input: `{ token, newPassword }`
- Output: `{ success: true, message: string }`
- Errors: 400 (invalid token), 500

**POST /api/auth/demo**
- Input: None
- Output: `{ success: true, user: UserDTO, accessToken: string, refreshToken: string }`
- Errors: 500

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Output: `{ success: true, user: UserDTO }`
- Errors: 401

#### Component Contracts

**useAuth hook:**
```typescript
interface UseAuthReturn {
  user: UserDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthLoginRequest) => Promise<UserDTO>;
  register: (credentials: AuthRegisterRequest) => Promise<ApiSuccessResponse>;
  logout: () => Promise<void>;
  startDemoMode: () => Promise<UserDTO>;
  refreshSession: () => Promise<void>;
}
```

**LoginForm component:**
```typescript
interface LoginFormProps {
  redirectTo?: string; // Opcjonalny redirect po logowaniu
}
```

**RegisterForm component:**
```typescript
interface RegisterFormProps {
  // Brak props
}
```

**DemoModeIndicator component:**
```typescript
interface DemoModeIndicatorProps {
  // Brak props - używa useAuth internally
}
```

### 5.3 Environment Variables

**Wymagane:**
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx... (anon key)

# App
PUBLIC_APP_URL=http://localhost:3000 (lub https://fridgepick.app w prod)
```

### 5.4 Implementacja w Fazach

**Faza 1: Backend Auth (Priority: HIGH)**
1. API endpoints: login, register, logout
2. Middleware protection dla chronionych stron
3. Walidacja server-side

**Faza 2: Frontend Auth UI (Priority: HIGH)**
1. Strony auth (login, register)
2. Komponenty formularzy (LoginForm, RegisterForm)
3. Hook useAuth - pełna implementacja

**Faza 3: Email Verification (Priority: MEDIUM - SHOULD)**
1. API endpoint verify-email
2. Strona verify-email
3. Email templates w Supabase

**Faza 4: Password Reset (Priority: MEDIUM - SHOULD)**
1. API endpoints forgot-password, reset-password
2. Strony i formularze
3. Email templates

**Faza 5: Demo Mode (Priority: HIGH)**
1. API endpoint demo
2. DemoService z seedowaniem
3. DemoModeIndicator component
4. Ograniczenia UX dla demo

**Faza 6: Polish & Security (Priority: MEDIUM)**
1. Rate limiting na endpointach auth
2. CSRF protection
3. Security headers
4. Error handling improvements

### 5.5 Testing Strategy

**Unit Tests:**
- Walidacja funkcji (validateEmail, validatePassword)
- DemoService metody
- Auth error handling

**Integration Tests:**
- API endpoints (register, login, logout)
- Middleware protection
- Session management

**E2E Tests (Playwright):**
- Pełny flow rejestracji
- Pełny flow logowania
- Pełny flow resetu hasła
- Demo mode flow
- Ochrona chronionych stron

**Manual Testing Checklist:**
- [ ] Rejestracja nowego użytkownika
- [ ] Weryfikacja emaila
- [ ] Logowanie z poprawnymi danymi
- [ ] Logowanie z błędnymi danymi
- [ ] Wylogowanie
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Demo mode creation
- [ ] Demo user limitations
- [ ] Protected routes redirect
- [ ] Session persistence across tabs
- [ ] Token refresh
- [ ] Rate limiting

---

## 6. ZGODNOŚĆ Z WYMAGANIAMI PRD

### User Stories Coverage

✅ **US-001: Rejestracja użytkownika**
- Formularz rejestracji: RegisterForm.tsx
- Walidacja: client + server
- Link aktywacyjny: Supabase email + verify-email.astro
- Endpoint: POST /api/auth/register

✅ **US-002: Logowanie użytkownika**
- Formularz logowania: LoginForm.tsx
- Walidacja: client + server
- Przekierowanie: SSR w login.astro + middleware
- Opcja "Zapamiętaj mnie": Supabase persistSession
- Endpoint: POST /api/auth/login

✅ **US-003: Reset hasła**
- Link "Zapomniałem hasła": /auth/forgot-password
- Formularz reset: ForgotPasswordForm.tsx, ResetPasswordForm.tsx
- Email z linkiem: Supabase recovery email
- Endpoints: POST /api/auth/forgot-password, POST /api/auth/reset-password

✅ **US-004: Tryb demo**
- Przycisk demo: na index.astro
- Dostęp bez rejestracji: DemoService.createDemoUser
- Przykładowe dane: DemoService.seedDemoProducts
- Przekierowanie: POST /api/auth/demo → /fridge?demo=true
- UX: DemoModeIndicator.tsx

✅ **US-016: Wylogowanie**
- Przycisk w nawigacji: AppNavigation.tsx
- Endpoint: POST /api/auth/logout
- Czyszczenie sesji: useAuth.logout()

✅ **US-017: Nawigacja**
- Menu: AppNavigation.tsx (rozszerzenie)
- Sekcje: Lodówka, Przepisy (future), Plan tygodnia (future)
- User menu z email i wylogowaniem

### Metryki Sukcesu

**Konwersja z demo do rejestracji (cel: ≥15%):**
- Tracking: event "demo_started", "registration_from_demo"
- Implementacja: DemoModeIndicator z CTA "Zarejestruj się"

**Retencja użytkowników (cel: ≥40% w 7 dni):**
- Auth system umożliwia tracking logowań
- Session persistence zwiększa retencję

**Dostępność aplikacji (cel: ≥99%):**
- Supabase Auth ma wysoką dostępność
- Graceful degradation przy błędach

---

## KONIEC SPECYFIKACJI

Ta specyfikacja stanowi kompletny blueprint dla implementacji systemu autentykacji w aplikacji FridgePick. Wszystkie komponenty, endpointy, typy i serwisy zostały zaprojektowane zgodnie z wymaganiami PRD oraz obecną architekturą projektu opartą na Astro 5 + Supabase.

import type { APIRoute } from "astro";

/**
 * POST /api/auth/login
 * Authenticates user with email and password
 *
 * Request body:
 * {
 *   email: string;
 *   password: string;
 *   rememberMe?: boolean;
 * }
 *
 * Response:
 * Success (200): { success: true, user: User, session: Session }
 * Error (400/401): { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email jest wymagany",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Hasło jest wymagane",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nieprawidłowy format email",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Hasło musi mieć minimum 8 znaków",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate with Supabase
    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase errors to user-friendly messages
      let errorMessage = "Wystąpił błąd podczas logowania";

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Nieprawidłowy email lub hasło";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.";
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user exists
    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nie udało się zalogować użytkownika",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success with user data
    // Note: Supabase SSR automatically sets HTTP-only cookies via the middleware
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          isDemo: data.user.user_metadata?.is_demo ?? false,
          isEmailVerified: data.user.email_confirmed_at !== null,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    console.error("Login API error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

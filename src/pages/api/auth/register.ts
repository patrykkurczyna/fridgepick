import type { APIRoute } from 'astro';

/**
 * POST /api/auth/register
 * Registers a new user with email and password
 *
 * Request body:
 * {
 *   email: string;
 *   password: string;
 * }
 *
 * Response:
 * Success (200): { success: true, user: User, requiresEmailVerification: boolean }
 * Error (400): { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email jest wymagany',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hasło jest wymagane',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nieprawidłowy format email',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hasło musi mieć minimum 8 znaków',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check password requirements
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (criteriaCount < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hasło musi zawierać co najmniej 2 z: małe litery, wielkie litery, cyfry, znaki specjalne',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user already exists in auth.users
    const { data: existingUsers, error: checkError } = await locals.supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing user:', checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Użytkownik o tym adresie email już istnieje',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Register with Supabase
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          is_demo: false, // Regular user, not demo
        },
      },
    });

    if (error) {
      console.error('Supabase signUp error:', error);

      // Map Supabase errors to user-friendly messages
      let errorMessage = 'Wystąpił błąd podczas rejestracji';

      // Check for various duplicate user error messages
      if (error.message.includes('User already registered') ||
          error.message.includes('already been registered') ||
          error.message.includes('duplicate key value') ||
          error.message.includes('unique constraint') ||
          error.status === 422) {
        errorMessage = 'Użytkownik o tym adresie email już istnieje';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Hasło jest zbyt słabe';
      } else if (error.message.includes('Unable to validate email')) {
        errorMessage = 'Nieprawidłowy adres email';
      } else if (error.message.includes('email rate limit')) {
        errorMessage = 'Zbyt wiele prób rejestracji. Spróbuj ponownie za chwilę.';
      }

      console.error('Mapped error message:', errorMessage);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user was created
    if (!data.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nie udało się utworzyć konta użytkownika',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // CRITICAL: Sync user to public.users table using SECURITY DEFINER function
    // This bypasses RLS policies that would block direct INSERT
    try {
      const { error: syncError } = await locals.supabase.rpc('sync_user_to_public', {
        user_id: data.user.id,
        user_email: email,
        email_verified: data.user.email_confirmed_at !== null,
      });

      if (syncError) {
        console.error('Error syncing user to public.users:', syncError);
        // Don't fail the whole request - user is created in auth.users
        // This might happen if user already exists in public.users
      }
    } catch (syncError) {
      console.error('Exception syncing user:', syncError);
      // Continue anyway
    }

    // Check if email verification is required
    // If session exists, user is auto-confirmed (email verification disabled)
    // If session is null, user needs to verify email
    const requiresEmailVerification = !data.session;

    // Return success
    // Note: Supabase SSR automatically sets HTTP-only cookies via the middleware
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          isDemo: false,
          isEmailVerified: data.user.email_confirmed_at !== null,
        },
        requiresEmailVerification,
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        } : null,
        message: requiresEmailVerification
          ? 'Konto zostało utworzone. Sprawdź swoją skrzynkę pocztową i potwierdź adres email.'
          : 'Konto zostało utworzone pomyślnie!',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Register API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

import type { APIRoute } from 'astro';

/**
 * POST /api/auth/reset-password
 * Resets user password using a reset token
 *
 * Request body:
 * {
 *   password: string;
 * }
 *
 * Note: User must be authenticated with a valid password reset token
 * (Supabase automatically validates the token from the email link)
 *
 * Response:
 * Success (200): { success: true, message: string }
 * Error (400/401): { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { password } = body;

    // Validate input
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

    // Update password
    // Supabase automatically validates the reset token from the session
    const { error } = await locals.supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('Reset password error:', error);

      let errorMessage = 'Wystąpił błąd podczas resetowania hasła';

      if (error.message.includes('session_not_found') || error.message.includes('Invalid token')) {
        errorMessage = 'Link resetowania hasła wygasł lub jest nieprawidłowy. Poproś o nowy link.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Hasło jest zbyt słabe';
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        {
          status: error.message.includes('session_not_found') ? 401 : 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Hasło zostało zmienione pomyślnie. Możesz teraz zalogować się nowym hasłem.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Reset password API error:', error);
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

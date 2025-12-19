import type { APIRoute } from 'astro';

/**
 * POST /api/auth/logout
 * Logs out the current user and clears session cookies
 *
 * Request body: none (or empty)
 *
 * Response:
 * Success (200): { success: true, message: string }
 * Error (500): { success: false, error: string }
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    // Sign out from Supabase
    // This will automatically clear HTTP-only cookies via SSR integration
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Wystąpił błąd podczas wylogowywania',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Wylogowano pomyślnie',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Logout API error:', error);
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

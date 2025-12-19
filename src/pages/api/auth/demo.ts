import type { APIRoute } from 'astro';

/**
 * POST /api/auth/demo
 * Creates a demo user account with auto-expiry (7 days)
 * Uses unified flow: creates a real Supabase user with is_demo flag
 *
 * Request body: none (or empty)
 *
 * Response:
 * Success (200): { success: true, user: User, demoEmail: string, expiresIn: string }
 * Error (500): { success: false, error: string }
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    // Generate unique demo email
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const demoEmail = `demo_${timestamp}_${randomSuffix}@fridgepick.local`;

    // Generate random password (user won't need it)
    const demoPassword = Math.random().toString(36).substring(2, 15) +
                         Math.random().toString(36).substring(2, 15) +
                         'Aa1!'; // Ensure it meets password requirements

    // Calculate expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Create demo user with Supabase
    const { data, error } = await locals.supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: {
          is_demo: true,
          demo_expires_at: expiryDate.toISOString(),
        },
        // Skip email verification for demo users
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      console.error('Demo user creation error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nie udało się utworzyć konta demo. Spróbuj ponownie.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user was created
    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nie udało się utworzyć konta demo',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // CRITICAL: Sync user to public.users table using SECURITY DEFINER function
    // This bypasses RLS policies that would block direct INSERT
    try {
      const { error: syncError } = await locals.supabase.rpc('sync_user_to_public', {
        user_id: data.user.id,
        user_email: demoEmail,
        email_verified: true,
      });

      if (syncError) {
        console.error('Error syncing demo user to public.users:', syncError);
        // Don't fail the whole request - user is created in auth.users
        // This might happen if user already exists in public.users
      }
    } catch (syncError) {
      console.error('Exception syncing demo user:', syncError);
      // Continue anyway
    }

    // Return success with demo user data
    // Note: Supabase SSR automatically sets HTTP-only cookies via the middleware
    // We also return demoPassword so the client can save it to localStorage for reuse
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: demoEmail,
          isDemo: true,
          isEmailVerified: true, // Demo users are auto-verified
        },
        demoEmail,
        demoPassword, // Return password for localStorage caching (client-side only)
        expiresIn: '7 dni',
        expiresAt: expiryDate.toISOString(),
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
        message: 'Konto demo zostało utworzone. Twoje dane będą dostępne przez 7 dni.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Demo API error:', error);
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

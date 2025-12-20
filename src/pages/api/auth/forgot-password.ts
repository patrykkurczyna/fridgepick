import type { APIRoute } from "astro";

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email to the user
 *
 * Request body:
 * {
 *   email: string;
 * }
 *
 * Response:
 * Success (200): { success: true, message: string }
 * Error (400): { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;

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

    // Send password reset email
    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Forgot password error:", error);
      // Don't reveal if email exists for security reasons
      // Return success even if email doesn't exist
    }

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({
        success: true,
        message: "Jeśli konto o tym adresie email istnieje, otrzymasz wiadomość z instrukcjami resetowania hasła.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    console.error("Forgot password API error:", error);
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

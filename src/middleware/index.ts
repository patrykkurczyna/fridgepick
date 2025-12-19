import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '../db/supabase.client.ts';

/**
 * Public paths that don't require authentication
 * Users can access these routes without being logged in
 */
const PUBLIC_PATHS = [
  '/',                          // Landing page
  '/auth/login',                // Login page
  '/auth/register',             // Registration page
  '/auth/forgot-password',      // Forgot password page
  '/auth/reset-password',       // Reset password page
  '/auth/verify-email',         // Email verification page
  '/api/auth/login',            // Login API endpoint
  '/api/auth/register',         // Register API endpoint
  '/api/auth/logout',           // Logout API endpoint
  '/api/auth/demo',             // Demo mode API endpoint
  '/api/auth/forgot-password',  // Forgot password API endpoint
  '/api/auth/reset-password',   // Reset password API endpoint
];

/**
 * Check if the current path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  // Exact match for paths in PUBLIC_PATHS
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }

  // Check for demo mode query parameter (allow demo access to /fridge)
  if (pathname === '/fridge') {
    return false; // Will be checked later with query params
  }

  // All other paths require authentication
  return false;
}

/**
 * Astro middleware for SSR authentication
 * - Creates Supabase SSR server instance with cookies
 * - Checks for active session
 * - Populates context.locals.session and context.locals.user
 * - Redirects unauthenticated users to /auth/login (except for public paths)
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Create Supabase SSR server instance with request and cookies
  const supabase = createSupabaseServerInstance(context.request, context.cookies);
  context.locals.supabase = supabase;

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If session exists, verify user exists in public.users table
  // This prevents issues when database is cleaned but cookies remain
  if (session?.user) {
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    // If user doesn't exist in public.users, clear invalid session
    if (userError || !userRecord) {
      console.log('User session exists but user not found in database, clearing session');
      await supabase.auth.signOut();
      context.locals.session = null;
      context.locals.user = null;
    } else {
      // User exists, populate context
      context.locals.session = session;
      context.locals.user = session.user;
    }
  } else {
    // No session, clear context
    context.locals.session = null;
    context.locals.user = null;
  }

  // Get current pathname
  const pathname = context.url.pathname;

  // Check if this is a public path
  const isPublic = isPublicPath(pathname);

  // Special case: Allow demo mode access to /fridge
  const isDemoMode = pathname === '/fridge' && context.url.searchParams.get('demo') === 'true';

  // If path is public or demo mode, allow access
  if (isPublic || isDemoMode) {
    return next();
  }

  // If user is not authenticated, redirect to login
  if (!session) {
    // Preserve the original URL for redirect after login
    const redirectTo = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/auth/login?redirect=${redirectTo}`);
  }

  // User is authenticated, proceed to the route
  return next();
});

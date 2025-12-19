import { createServerClient, createBrowserClient } from '@supabase/ssr';
import type { Database } from '../db/database.types.ts';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

/**
 * Parse cookies from a Cookie header string
 */
function parseCookieHeader(cookieHeader: string | null): Array<{ name: string; value: string }> {
  if (!cookieHeader) return [];

  return cookieHeader.split(';').map(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    return {
      name: name.trim(),
      value: rest.join('=').trim()
    };
  }).filter(cookie => cookie.name && cookie.value);
}

/**
 * Creates a Supabase server instance for SSR (Astro pages, middleware, API routes)
 * Uses HTTP-only cookies for secure session management
 *
 * @param request - Astro request object
 * @param cookies - Astro cookies object from context
 * @returns Supabase client instance configured for server-side rendering
 */
export function createSupabaseServerInstance(request: Request, cookies: AstroCookies) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Parse cookies from request headers since AstroCookies doesn't have getAll()
        const cookieHeader = request.headers.get('cookie');
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Creates a Supabase browser client for client-side React components
 * Uses browser storage for session management
 *
 * @returns Supabase client instance configured for browser use
 */
export function createSupabaseClientInstance() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use createSupabaseServerInstance() or createSupabaseClientInstance() instead
 */
export const supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

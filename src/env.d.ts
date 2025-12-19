/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types.ts';

declare global {
  namespace App {
    interface Locals {
      /**
       * Supabase server instance configured with SSR cookies
       * Use this in Astro pages, middleware, and API routes
       */
      supabase: SupabaseClient<Database>;

      /**
       * Current user session (populated by middleware)
       * null if user is not authenticated
       */
      session: import('@supabase/supabase-js').Session | null;

      /**
       * Current authenticated user (populated by middleware)
       * null if user is not authenticated
       */
      user: import('@supabase/supabase-js').User | null;
    }
  }
}

interface ImportMetaEnv {
  // Server-only environment variables
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;

  // Client-accessible environment variables (PUBLIC_ prefix)
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;

  // Development credentials (optional)
  readonly SUPABASE_EMAIL?: string;
  readonly SUPABASE_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

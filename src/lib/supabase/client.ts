import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le NAVIGATEUR.
 *
 * Utilise la clé ANON (publique) : toutes les opérations sont filtrées par
 * les politiques Row Level Security définies en base.
 *
 * ⚠️ Ne jamais importer ce fichier depuis un Server Component ou une
 *    Server Action — utiliser `./server.ts` à la place.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

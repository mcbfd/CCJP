import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Client Supabase PRIVILÉGIÉ (Service Role).
 *
 * ⚠️⚠️ CE FICHIER EST LE POINT LE PLUS SENSIBLE DU PROJET ⚠️⚠️
 *
 * La clé `SUPABASE_SERVICE_ROLE_KEY` contourne TOUTES les politiques
 * Row Level Security. Quiconque obtient cette clé peut lire, modifier et
 * supprimer l'intégralité de la base du CCJP.
 *
 * Règles absolues :
 *   1. Ne JAMAIS préfixer la variable par NEXT_PUBLIC_ (elle serait alors
 *      exposée dans le bundle JavaScript envoyé au navigateur).
 *   2. Ne JAMAIS importer ce fichier depuis un composant client
 *      (« use client ») ni depuis un fichier importé par un tel composant.
 *   3. Ne l'utiliser que pour des tâches d'administration légitimes
 *      (ex. export CSV complet, scripts de seeding).
 *
 * Usage typique : script CLI dans `scripts/`, Route Handler protégée,
 * ou Server Action dont l'accès est déjà vérifié par `isCurrentUserAdmin()`.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et " +
        "SUPABASE_SERVICE_ROLE_KEY doivent être définies (voir .env.local.example).",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      // Pas de persistance de session : ce client est sans état.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

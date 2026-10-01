import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/types";
import { cookies } from "next/headers";

/**
 * Client Supabase pour le SERVEUR (Server Components, Server Actions, Route Handlers).
 *
 * Contrairement au client navigateur, il lit et écrit les cookies de session,
 * ce qui permet de connaître l'utilisateur connecté côté serveur.
 *
 * ⚠️ La clé utilisée reste la clé ANON : la sécurité vient des politiques RLS,
 *    pas de la clé. C'est voulu.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` est appelé depuis un Server Component, où l'écriture
            // de cookies n'est pas autorisée. Ce n'est pas une erreur si la
            // session est rafraîchie par le middleware.
          }
        },
      },
    },
  );
}

/**
 * Raccourci : récupère l'utilisateur Supabase courant, ou `null`.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Raccourci : indique si l'utilisateur courant est un administrateur habilité.
 *
 * Interroge la table `admins` (voir PLAN_IMPLEMENTATION.md §7.1).
 * La table `admins` est protégée par RLS : un visiteur anonyme ne peut pas
 * lire les lignes des autres, et un simple utilisateur authentifié obtient
 * `false` s'il n'est pas habilité.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();

  if (error || !data) return false;
  return true;
}

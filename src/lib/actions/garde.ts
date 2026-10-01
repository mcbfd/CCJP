"use server";

/**
 * Garde d'accès des Server Actions d'administration (PLAN §7, P4.x)
 *
 * ⚠️⚠️ POINT LE PLUS IMPORTANT DE LA SÉCURITÉ DU BACK-OFFICE ⚠️⚠️
 *
 * Une Server Action est un point d'entrée HTTP PUBLIC : n'importe qui peut
 * envoyer une requête POST vers l'endpoint d'une action, avec n'importe quels
 * arguments. Le `middleware.ts` ne protège que la NAVIGATION vers `/admin` —
 * il ne voit pas ces appels.
 *
 * Conséquence : toute Server Action qui écrit en base DOIT appeler
 * `exigerAdmin()` AVANT de toucher aux données. Sans cela, un visiteur
 * anonyme pourrait créer, modifier ou supprimer du contenu.
 *
 * La vérification se fait en deux temps, et les deux sont nécessaires :
 *   1. `auth.getUser()` valide le JWT auprès de Supabase — un cookie forgé
 *      ne passe pas ;
 *   2. une lecture de la table `admins` confirme l'habilitation, protégée par
 *      RLS (« Un admin voit sa propre ligne »).
 *
 * `exigerAdmin()` renvoie l'identifiant de l'utilisateur, ou `null` si
 * l'accès est refusé. L'appelant doit alors s'arrêter immédiatement.
 */

import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Vérifie que l'appelant est un administrateur habilité.
 *
 * Renvoie `{ id, email }` si oui, `null` si non. Ne lève pas d'exception :
 * l'appelant décide du message d'erreur à renvoyer.
 */
export async function exigerAdmin(): Promise<{
  id: string;
  email: string | null;
} | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;
    if (!(await isCurrentUserAdmin())) return null;

    return { id: user.id, email: user.email ?? null };
  } catch (e) {
    // En cas de doute, on refuse. Échouer en mode ouvert transformerait une
    // panne de base en faille de sécurité.
    console.error("[garde] exigerAdmin a échoué :", e);
    return null;
  }
}

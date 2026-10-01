"use server";

/**
 * Server Actions d'authentification (PLAN_IMPLEMENTATION.md §7.2)
 *
 * Connexion par e-mail + mot de passe via Supabase Auth. Aucune inscription
 * publique : les comptes sont créés dans Supabase Auth, puis habilités
 * nominativement dans la table `admins` (§7.1).
 *
 * La vérification du rôle d'administrateur se fait en deux endroits, et c'est
 * volontaire :
 *   - le `middleware.ts` filtre les requêtes vers `/admin` (P4.2) ;
 *   - chaque Server Action d'écriture revérifie `isCurrentUserAdmin()`, car
 *     une Server Action est un point d'entrée HTTP public — le middleware ne
 *     protège que la navigation, pas les appels directs.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Connecte un administrateur.
 *
 * `redirect()` lève une exception interne de Next : elle doit donc être
 * appelée hors de tout `try/catch`, sinon elle serait avalée.
 */
export async function connexion(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("motdepasse") ?? "");

  // Validation minimale côté serveur — la validation navigateure n'est qu'un
  // confort et peut toujours être contournée.
  if (!email || !motDePasse) {
    redirect("/auth/login?erreur=champs");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    // Message volontairement vague : on ne révèle pas si l'e-mail existe.
    console.error("[auth] connexion refusée :", error.message);
    redirect("/auth/login?erreur=identifiants");
  }

  // La session est posée par les cookies écrits via `setAll`. On vérifie
  // ensuite que l'utilisateur est bien habilité dans `admins`.
  const estAdmin = await isCurrentUserAdmin();
  if (!estAdmin) {
    // Compte authentifié mais non habilité : on le déconnecte immédiatement
    // pour ne pas laisser traîner une session inutile.
    await supabase.auth.signOut();
    redirect("/auth/login?erreur=nonautorise");
  }

  redirect("/admin");
}

/**
 * Déconnecte l'administrateur courant.
 *
 * `redirect()` est appelé après le `signOut()` et hors `try/catch`.
 */
export async function deconnexion() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login?deconnecte=1");
}

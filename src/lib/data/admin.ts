import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

/**
 * Accès aux données — back-office (PLAN_IMPLEMENTATION.md §10)
 *
 * Toutes les lectures passent par le client serveur, donc par les politiques
 * RLS. Les politiques « Admins gèrent … » (migration 0002) accordent un accès
 * complet à un utilisateur habilité dans la table `admins` ; les autres ne
 * voient rien.
 *
 * ⚠️ Ces fonctions ne doivent être appelées que depuis des pages ou actions
 *    dont l'accès a déjà été vérifié (`middleware.ts` + layout `/admin`).
 *    Elles ne constituent PAS une barrière de sécurité par elles-mêmes :
 *    elles s'appuient sur la RLS, qui est la vraie garde.
 *
 * Le client privilégié (`createAdminClient`, clé service_role) n'est pas
 * utilisé ici : il contournerait la RLS et rendrait la vérification
 * d'habilitation inutile. On garde le chemin le plus restrictif.
 */

export type ActualiteRow = Database["public"]["Tables"]["actualites"]["Row"];
export type EvenementRow = Database["public"]["Tables"]["evenements"]["Row"];
export type AdhesionRow = Database["public"]["Tables"]["adhesions"]["Row"];
export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];

/** Les compteurs du tableau de bord (§10.1). */
export interface StatistiquesAdmin {
  actualitesPubliees: number;
  actualitesBrouillons: number;
  evenementsAVenir: number;
  adhesionsEnAttente: number;
  messagesNonLus: number;
  membres: number;
}

/**
 * Compteurs du tableau de bord.
 *
 * Chaque valeur est comptée séparément plutôt que par une requête agrégée :
 * `count: "exact"` sur une requête filtrée est lisible et suffisamment rapide
 * à cette échelle. Les requêtes sont lancées en parallèle.
 */
export const getStatistiquesAdmin = cache(
  async (): Promise<StatistiquesAdmin> => {
    const vide: StatistiquesAdmin = {
      actualitesPubliees: 0,
      actualitesBrouillons: 0,
      evenementsAVenir: 0,
      adhesionsEnAttente: 0,
      messagesNonLus: 0,
      membres: 0,
    };

    try {
      const supabase = createClient();
      const maintenant = new Date().toISOString();

      const [
        publiees,
        brouillons,
        evenements,
        adhesions,
        messages,
        membres,
      ] = await Promise.all([
        supabase
          .from("actualites")
          .select("id", { count: "exact", head: true })
          .eq("statut", "publie"),
        supabase
          .from("actualites")
          .select("id", { count: "exact", head: true })
          .eq("statut", "brouillon"),
        supabase
          .from("evenements")
          .select("id", { count: "exact", head: true })
          .eq("statut", "a_venir")
          .gte("date_debut", maintenant),
        supabase
          .from("adhesions")
          .select("id", { count: "exact", head: true })
          .eq("statut", "en_attente"),
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("lu", false),
        supabase
          .from("membres_bureau")
          .select("id", { count: "exact", head: true }),
      ]);

      // Une erreur RLS se manifeste par un compte nul, pas par une exception :
      // on logue mais on renvoie quand même les zéros pour ne pas casser la page.
      const erreurs = [
        publiees.error,
        brouillons.error,
        evenements.error,
        adhesions.error,
        messages.error,
        membres.error,
      ].filter(Boolean);
      if (erreurs.length > 0) {
        console.error(
          "[data/admin] getStatistiquesAdmin :",
          erreurs.map((e) => e?.message).join(" | "),
        );
      }

      return {
        actualitesPubliees: publiees.count ?? 0,
        actualitesBrouillons: brouillons.count ?? 0,
        evenementsAVenir: evenements.count ?? 0,
        adhesionsEnAttente: adhesions.count ?? 0,
        messagesNonLus: messages.count ?? 0,
        membres: membres.count ?? 0,
      };
    } catch (e) {
      console.error("[data/admin] getStatistiquesAdmin :", e);
      return vide;
    }
  },
);

/** Les `n` dernières actualités, tous statuts confondus (§10.1). */
export const getDernieresActualitesAdmin = cache(
  async (n = 5): Promise<ActualiteRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actualites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(n);

      if (error) {
        console.error(
          "[data/admin] getDernieresActualitesAdmin :",
          error.message,
        );
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/admin] getDernieresActualitesAdmin :", e);
      return [];
    }
  },
);

/** Les `n` derniers messages de contact (§10.1). */
export const getDerniersMessagesAdmin = cache(
  async (n = 5): Promise<ContactRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(n);

      if (error) {
        console.error("[data/admin] getDerniersMessagesAdmin :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/admin] getDerniersMessagesAdmin :", e);
      return [];
    }
  },
);

/** Les `n` demandes d'adhésion les plus récentes (§10.1). */
export const getAdhesionsRecentesAdmin = cache(
  async (n = 5): Promise<AdhesionRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("adhesions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(n);

      if (error) {
        console.error("[data/admin] getAdhesionsRecentesAdmin :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/admin] getAdhesionsRecentesAdmin :", e);
      return [];
    }
  },
);

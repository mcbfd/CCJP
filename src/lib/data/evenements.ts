import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

/** Accès aux données — Événements */

export type EvenementRow = Database["public"]["Tables"]["evenements"]["Row"];

export const REVALIDATION_EVENEMENTS = 300;
export const REVALIDATION_EVENEMENT = 600;

/** Prochains événements (date de début dans le futur), triés par date. */
export const getProchainsEvenements = cache(
  async (limite = 3): Promise<EvenementRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("evenements")
        .select("*")
        .eq("statut", "a_venir")
        .gte("date_debut", new Date().toISOString())
        .order("date_debut", { ascending: true })
        .limit(limite);

      if (error) {
        console.error("[data/evenements] getProchainsEvenements :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/evenements] getProchainsEvenements :", e);
      return [];
    }
  },
);

/**
 * Tous les événements à venir — vue liste de `/evenements`.
 */
export const getEvenementsAVenir = cache(async (): Promise<EvenementRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("evenements")
      .select("*")
      .eq("statut", "a_venir")
      .gte("date_debut", new Date().toISOString())
      .order("date_debut", { ascending: true });

    if (error) {
      console.error("[data/evenements] getEvenementsAVenir :", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("[data/evenements] getEvenementsAVenir :", e);
    return [];
  }
});

/**
 * Événements passés, du plus récent au plus ancien.
 */
export const getEvenementsPasses = cache(
  async (limite = 12): Promise<EvenementRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("evenements")
        .select("*")
        .or(`statut.eq.termine,date_debut.lt.${new Date().toISOString()}`)
        .order("date_debut", { ascending: false })
        .limit(limite);

      if (error) {
        console.error("[data/evenements] getEvenementsPasses :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/evenements] getEvenementsPasses :", e);
      return [];
    }
  },
);

/** Un événement par son identifiant. */
export const getEvenementById = cache(
  async (id: string): Promise<EvenementRow | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("evenements")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("[data/evenements] getEvenementById :", error.message);
        return null;
      }
      return data ?? null;
    } catch (e) {
      console.error("[data/evenements] getEvenementById :", e);
      return null;
    }
  },
);

/**
 * Tous les événements, passés comme à venir, en version allégée.
 *
 * Le sitemap référence aussi les événements passés : leur page reste en ligne
 * et consultable après coup. On ne sélectionne que l'identifiant et la date
 * de modification.
 */
export const getEvenementsPourSitemap = cache(
  async (): Promise<Array<{ id: string; updated_at: string }>> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("evenements")
        .select("id, updated_at")
        .order("date_debut", { ascending: false })
        .limit(5000);

      if (error) {
        console.error("[data/evenements] getEvenementsPourSitemap :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/evenements] getEvenementsPourSitemap :", e);
      return [];
    }
  },
);

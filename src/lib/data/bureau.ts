import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

/**
 * Accès aux données — Bureau exécutif, projets phares, indicateurs
 */

export type MembreBureauRow =
  Database["public"]["Tables"]["membres_bureau"]["Row"];
export type ProjetPhareRow =
  Database["public"]["Tables"]["projets_phares"]["Row"];
export type IndicateurRow =
  Database["public"]["Tables"]["statistiques_indicateurs"]["Row"];

export const REVALIDATION_BUREAU = 3600;

/** Membres du bureau, triés par `ordre` croissant (CDC §9.2). */
export const getMembresBureau = cache(async (): Promise<MembreBureauRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("membres_bureau")
      .select("*")
      .order("ordre", { ascending: true });

    if (error) {
      console.error("[data/bureau] getMembresBureau :", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("[data/bureau] getMembresBureau :", e);
    return [];
  }
});

/**
 * Projets phares d'une commission, triés par `ordre`.
 */
export const getProjetsParCommission = cache(
  async (commissionId: string): Promise<ProjetPhareRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projets_phares")
        .select("*")
        .eq("commission_id", commissionId)
        .order("ordre", { ascending: true });

      if (error) {
        console.error("[data/bureau] getProjetsParCommission :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/bureau] getProjetsParCommission :", e);
      return [];
    }
  },
);

/**
 * Tous les projets phares groupés par commission — page `/programme`.
 */
export const getTousLesProjets = cache(async () => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projets_phares")
      .select("*, commissions(numero, slug, nom, couleur)")
      .order("ordre", { ascending: true });

    if (error) {
      console.error("[data/bureau] getTousLesProjets :", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("[data/bureau] getTousLesProjets :", e);
    return [];
  }
});

/** Indicateurs d'impact actifs, triés par `ordre` (CDC §9.1 section 3). */
export const getIndicateurs = cache(async (): Promise<IndicateurRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("statistiques_indicateurs")
      .select("*")
      .eq("actif", true)
      .order("ordre", { ascending: true });

    if (error) {
      console.error("[data/bureau] getIndicateurs :", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("[data/bureau] getIndicateurs :", e);
    return [];
  }
});

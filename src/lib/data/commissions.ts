import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

/**
 * Accès aux données — Commissions
 *
 * Toutes les lectures passent par le client serveur, donc par les politiques
 * RLS. Un visiteur anonyme ne voit que ce que les politiques autorisent.
 *
 * Chaque fonction est mémorisée avec `cache()` de React : une seule requête
 * par rendu de page, même si la fonction est appelée plusieurs fois.
 */

export type CommissionRow = Database["public"]["Tables"]["commissions"]["Row"];

/** Durée de revalidation ISR — les commissions changent rarement (§3.3). */
export const REVALIDATION_COMMISSIONS = 3600;

/**
 * Les 14 commissions, triées par numéro.
 */
export const getCommissions = cache(
  async (): Promise<CommissionRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("commissions")
        .select("*")
        .order("numero", { ascending: true });

      if (error) {
        console.error("[data/commissions] getCommissions :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/commissions] getCommissions :", e);
      return [];
    }
  },
);

/**
 * Une commission par son slug, ou `null`.
 */
export const getCommissionBySlug = cache(
  async (slug: string): Promise<CommissionRow | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("commissions")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("[data/commissions] getCommissionBySlug :", error.message);
        return null;
      }
      return data ?? null;
    } catch (e) {
      console.error("[data/commissions] getCommissionBySlug :", e);
      return null;
    }
  },
);

/**
 * Les 5 axes thématiques et le nombre de commissions rattachées à chacun.
 * Sert à la page `/commissions` pour regrouper les cartes.
 */
export const getCommissionsParAxe = cache(async () => {
  const commissions = await getCommissions();
  const groupes = new Map<string, CommissionRow[]>();

  for (const c of commissions) {
    for (const axe of c.axes_strategiques ?? []) {
      if (!groupes.has(axe)) groupes.set(axe, []);
      groupes.get(axe)!.push(c);
    }
  }

  return [...groupes.entries()].map(([axe, liste]) => ({
    axe,
    commissions: liste.sort((a, b) => a.numero - b.numero),
  }));
});

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

/**
 * Accès aux données — Actualités
 *
 * Point de sécurité central : la politique RLS « Actualités publiées lisibles
 * publiquement » (migration 0002) garantit qu'un visiteur anonyme ne peut
 * voir que les articles au statut `publie`. Aucun filtre `statut` n'est
 * donc ajouté ici côté application : c'est la base qui décide, et un oubli
 * de filtre ne peut pas exposer un brouillon.
 */

export type ActualiteRow = Database["public"]["Tables"]["actualites"]["Row"];

/** Revalidation ISR : la liste doit rester fraîche (§3.3). */
export const REVALIDATION_ACTUALITES = 120;
export const REVALIDATION_ARTICLE = 300;

/** Nombre d'articles par page sur `/actualites`. */
export const PAR_PAGE = 12;

export interface PageActualites {
  actualites: ActualiteRow[];
  page: number;
  totalPages: number;
  total: number;
}

/**
 * Liste paginée des actualités visibles, avec filtre optionnel par commission.
 *
 * Les articles épinglés (`epingle = true`) remontent en tête, puis tri par
 * date de publication décroissante (CDC §9.2).
 */
export const getActualites = cache(
  async (options: {
    page?: number;
    parPage?: number;
    commissionId?: string;
  } = {}): Promise<PageActualites> => {
    const page = Math.max(1, options.page ?? 1);
    const parPage = options.parPage ?? PAR_PAGE;
    const depuis = (page - 1) * parPage;

    try {
      const supabase = createClient();

      let requete = supabase
        .from("actualites")
        .select("*", { count: "exact" })
        .order("epingle", { ascending: false })
        .order("date_publication", { ascending: false, nullsFirst: false })
        .range(depuis, depuis + parPage - 1);

      if (options.commissionId) {
        requete = requete.eq("commission_id", options.commissionId);
      }

      const { data, error, count } = await requete;

      if (error) {
        console.error("[data/actualites] getActualites :", error.message);
        return { actualites: [], page, totalPages: 0, total: 0 };
      }

      const total = count ?? 0;
      return {
        actualites: data ?? [],
        page,
        totalPages: Math.max(1, Math.ceil(total / parPage)),
        total,
      };
    } catch (e) {
      console.error("[data/actualites] getActualites :", e);
      return { actualites: [], page, totalPages: 0, total: 0 };
    }
  },
);

/**
 * Un article par son slug. Renvoie `null` si l'article n'existe pas ou n'est
 * pas publié — la RLS s'en charge, donc un brouillon donne un 404 et non un
 * accès interdit.
 */
export const getActualiteBySlug = cache(
  async (slug: string): Promise<ActualiteRow | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actualites")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("[data/actualites] getActualiteBySlug :", error.message);
        return null;
      }
      return data ?? null;
    } catch (e) {
      console.error("[data/actualites] getActualiteBySlug :", e);
      return null;
    }
  },
);

/** Les `n` derniers articles publiés, pour la page d'accueil. */
export const getDernieresActualites = cache(
  async (n = 3): Promise<ActualiteRow[]> => {
    const { actualites } = await getActualites({ parPage: n });
    return actualites;
  },
);

/**
 * Articles liés à une commission (hors article courant).
 * Sert à la page de détail d'une commission.
 */
export const getActualitesParCommission = cache(
  async (commissionId: string, limite = 3): Promise<ActualiteRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actualites")
        .select("*")
        .eq("commission_id", commissionId)
        .order("date_publication", { ascending: false, nullsFirst: false })
        .limit(limite);

      if (error) {
        console.error("[data/actualites] getActualitesParCommission :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/actualites] getActualitesParCommission :", e);
      return [];
    }
  },
);

/**
 * Tous les articles visibles, en version allégée, pour le sitemap.
 *
 * Ne sélectionne que les champs utiles au sitemap afin de rester léger même
 * quand le nombre d'articles grandit. Le filtre de publication est porté par
 * la RLS, exactement comme pour `getActualites`.
 */
export const getActualitesPourSitemap = cache(
  async (): Promise<
    Array<{ slug: string; updated_at: string; created_at: string }>
  > => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("actualites")
        .select("slug, updated_at, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (error) {
        console.error("[data/actualites] getActualitesPourSitemap :", error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("[data/actualites] getActualitesPourSitemap :", e);
      return [];
    }
  },
);

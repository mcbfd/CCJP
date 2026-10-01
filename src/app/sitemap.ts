import type { MetadataRoute } from "next";
import { urlAbsolue } from "@/lib/site";
import {
  getCommissions,
  REVALIDATION_COMMISSIONS,
} from "@/lib/data/commissions";
import {
  getActualitesPourSitemap,
  REVALIDATION_ACTUALITES,
} from "@/lib/data/actualites";
import {
  getEvenementsPourSitemap,
  REVALIDATION_EVENEMENTS,
} from "@/lib/data/evenements";

/**
 * Sitemap XML (§13.2)
 *
 * Liste les pages statiques du site public et y ajoute les pages dynamiques
 * issues de la base : une entrée par commission, par article et par
 * événement.
 *
 * Les `lastModified` reprennent `updated_at` de la base quand il existe, ce
 * qui permet aux moteurs de recherche de détecter les modifications réelles
 * plutôt que de tout réindexer à chaque passage.
 *
 * L'espace d'administration (`/admin`) est volontairement absent : il est
 * protégé par authentification et ne doit jamais être indexé.
 */

/** Pages fixes, avec leur fréquence de changement et leur priorité. */
const PAGES_STATIQUES: Array<{
  chemin: string;
  frequence: MetadataRoute.Sitemap[number]["changeFrequency"];
  priorite: number;
}> = [
  { chemin: "/", frequence: "weekly", priorite: 1.0 },
  { chemin: "/programme", frequence: "monthly", priorite: 0.8 },
  { chemin: "/commissions", frequence: "monthly", priorite: 0.9 },
  { chemin: "/actualites", frequence: "daily", priorite: 0.9 },
  { chemin: "/evenements", frequence: "weekly", priorite: 0.8 },
  { chemin: "/bureau-executif", frequence: "monthly", priorite: 0.7 },
  { chemin: "/a-propos", frequence: "yearly", priorite: 0.6 },
  { chemin: "/rejoindre", frequence: "monthly", priorite: 0.7 },
  { chemin: "/contact", frequence: "yearly", priorite: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statiques: MetadataRoute.Sitemap = PAGES_STATIQUES.map((p) => ({
    url: urlAbsolue(p.chemin),
    lastModified: new Date(),
    changeFrequency: p.frequence,
    priority: p.priorite,
  }));

  // Les lectures passent par RLS : un visiteur anonyme ne voit que les
  // contenus publiés, exactement ce qui doit apparaître dans le sitemap.
  // Les événements passés restent inclus : leur page reste consultable.
  let commissions: Awaited<ReturnType<typeof getCommissions>> = [];
  let actualites: Array<{ slug: string; updated_at: string; created_at: string }> =
    [];
  let evenements: Array<{ id: string; updated_at: string }> = [];

  try {
    [commissions, actualites, evenements] = await Promise.all([
      getCommissions(),
      getActualitesPourSitemap(),
      getEvenementsPourSitemap(),
    ]);
  } catch (e) {
    // Une base injoignable ne doit pas casser le sitemap : on sert au moins
    // les pages statiques.
    console.error("[sitemap] lecture base échouée :", e);
  }

  const pagesCommissions: MetadataRoute.Sitemap = commissions.map((c) => ({
    url: urlAbsolue(`/commissions/${c.slug}`),
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const pagesActualites: MetadataRoute.Sitemap = actualites.map((a) => ({
    url: urlAbsolue(`/actualites/${a.slug}`),
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(a.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pagesEvenements: MetadataRoute.Sitemap = evenements.map((ev) => ({
    url: urlAbsolue(`/evenements/${ev.id}`),
    lastModified: ev.updated_at ? new Date(ev.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...statiques,
    ...pagesCommissions,
    ...pagesActualites,
    ...pagesEvenements,
  ];
}

// Fréquence de régénération du sitemap — calquée sur les pages les plus
// volatiles qu'il référence.
export const revalidate = Math.min(
  REVALIDATION_COMMISSIONS,
  REVALIDATION_ACTUALITES,
  REVALIDATION_EVENEMENTS,
);

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Paramètres du site — lus dans la table `parametres` (CDC §10.1).
 *
 * Ces valeurs alimentent le pied de page, le bandeau d'accueil et les
 * métadonnées. Elles sont modifiables depuis le back-office
 * (`/admin/parametres`), donc jamais codées en dur dans les composants.
 *
 * ⚠️ Sécurité : la politique RLS « Paramètres non sensibles lisibles
 *    publiquement » (migration 0002) masque les clés contenant `secret`,
 *    `token` ou `password`. Ce module ne lit donc que des valeurs publiques.
 *
 * Repli : si les variables d'environnement Supabase sont absentes (phase de
 * développement initial) ou si la base est injoignable, on retombe sur les
 * valeurs du seed afin que le site s'affiche toujours.
 */

export interface ParametresSite {
  siteNom: string;
  siteDescription: string;
  emailContact: string;
  telephone: string;
  adresse: string;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  tiktokUrl: string;
  heroTitre: string;
  heroSousTitre: string;
}

/** Valeurs de repli — identiques au seed de la migration 0003. */
const DEFAULTS: ParametresSite = {
  siteNom: "CCJP — Conseil Consultatif des Jeunes de Podor",
  siteDescription:
    "Plateforme officielle du Conseil Consultatif des Jeunes de Podor. Écoute · Participation · Impact.",
  emailContact: "contact@ccjp-podor.sn",
  telephone: "",
  adresse: "Podor, Région de Saint-Louis, Sénégal",
  facebookUrl: "",
  instagramUrl: "",
  xUrl: "",
  tiktokUrl: "",
  heroTitre: "La voix de la jeunesse podoroise",
  heroSousTitre: "Écoute · Participation · Impact",
};

/** Correspondance clé en base → propriété typée. */
const CORRESPONDANCE: Record<string, keyof ParametresSite> = {
  site_nom: "siteNom",
  site_description: "siteDescription",
  email_contact: "emailContact",
  telephone: "telephone",
  adresse: "adresse",
  facebook_url: "facebookUrl",
  instagram_url: "instagramUrl",
  x_url: "xUrl",
  tiktok_url: "tiktokUrl",
  hero_titre: "heroTitre",
  hero_sous_titre: "heroSousTitre",
};

/**
 * Récupère les paramètres du site. Mémorisé pour la durée du rendu
 * (`cache` de React) afin de ne faire qu'une seule requête par page.
 */
export const getParametresSite = cache(async (): Promise<ParametresSite> => {
  const parametres: ParametresSite = { ...DEFAULTS };

  // Base non configurée : on sert les valeurs de repli.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return parametres;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("parametres")
      .select("cle, valeur");

    if (error || !data) return parametres;

    for (const ligne of data) {
      const propriete = CORRESPONDANCE[ligne.cle];
      if (propriete && typeof ligne.valeur === "string") {
        parametres[propriete] = ligne.valeur;
      }
    }
  } catch {
    // Base injoignable ou RLS bloquante : les valeurs de repli suffisent.
    return parametres;
  }

  return parametres;
});

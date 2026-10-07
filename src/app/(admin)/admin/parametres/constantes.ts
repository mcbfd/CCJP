/**
 * Constantes du module Paramètres (§10.2, P4.11)
 *
 * Module neutre, SANS directive `"use server"` : consommé par la page serveur,
 * le formulaire client et l'action.
 *
 * Les clés sont celles du seed de la migration 0003. Elles sont fixées ici
 * plutôt que lues dynamiquement en base, pour deux raisons :
 *   1. le formulaire doit proposer des libellés et des types de champ adaptés
 *      (une URL n'est pas un texte libre, un e-mail se valide) ;
 *   2. accepter n'importe quelle clé reviendrait à permettre la création de
 *      paramètres fantômes que personne ne lit.
 *
 * ⚠️ La politique RLS « Paramètres non sensibles lisibles publiquement »
 *    masque au public toute clé contenant `secret`, `token` ou `password`.
 *    Ces clés sont volontairement absentes de ce formulaire : elles relèvent
 *    des variables d'environnement, pas de l'interface d'administration.
 */

export type TypeChamp = "texte" | "email" | "url" | "zone";

export interface ChampParametre {
  /** Clé en base, ex. `site_nom`. */
  cle: string;
  /** Libellé affiché, en français. */
  label: string;
  /** Regroupement dans le formulaire. */
  groupe: "Identité" | "Contact" | "Réseaux sociaux" | "Bandeau d'accueil";
  type: TypeChamp;
  /** Aide affichée sous le champ. */
  aide?: string;
  obligatoire?: boolean;
  /** Nombre de lignes pour les champs de type `zone`. */
  lignes?: number;
}

export const CHAMPS_PARAMETRES: readonly ChampParametre[] = [
  /* --- Identité --- */
  {
    cle: "site_nom",
    label: "Nom du site",
    groupe: "Identité",
    type: "texte",
    aide: "Apparaît dans l'en-tête, le pied de page et les métadonnées.",
    obligatoire: true,
  },
  {
    cle: "site_description",
    label: "Description du site",
    groupe: "Identité",
    type: "zone",
    lignes: 3,
    aide: "Utilisée par les moteurs de recherche et les partages sur les réseaux sociaux.",
    obligatoire: true,
  },

  /* --- Contact --- */
  {
    cle: "email_contact",
    label: "E-mail de contact",
    groupe: "Contact",
    type: "email",
    aide: "Adresse vers laquelle sont envoyés les messages du formulaire public.",
    obligatoire: true,
  },
  {
    cle: "telephone",
    label: "Téléphone",
    groupe: "Contact",
    type: "texte",
    aide: "Laisser vide pour ne pas l'afficher.",
  },
  {
    cle: "adresse",
    label: "Adresse postale",
    groupe: "Contact",
    type: "texte",
  },

  /* --- Réseaux sociaux --- */
  {
    cle: "facebook_url",
    label: "Facebook",
    groupe: "Réseaux sociaux",
    type: "url",
    aide: "Laisser vide pour masquer l'icône dans le pied de page.",
  },
  {
    cle: "instagram_url",
    label: "Instagram",
    groupe: "Réseaux sociaux",
    type: "url",
  },
  {
    cle: "x_url",
    label: "X (ex-Twitter)",
    groupe: "Réseaux sociaux",
    type: "url",
  },
  {
    cle: "tiktok_url",
    label: "TikTok",
    groupe: "Réseaux sociaux",
    type: "url",
  },

  /* --- Bandeau d'accueil --- */
  {
    cle: "hero_titre",
    label: "Titre du bandeau",
    groupe: "Bandeau d'accueil",
    type: "texte",
    aide: "La première chose que voit un visiteur sur la page d'accueil.",
    obligatoire: true,
  },
  {
    cle: "hero_sous_titre",
    label: "Sous-titre du bandeau",
    groupe: "Bandeau d'accueil",
    type: "texte",
  },
] as const;

/** Ordre d'affichage des groupes dans le formulaire. */
export const GROUPES = [
  "Identité",
  "Contact",
  "Réseaux sociaux",
  "Bandeau d'accueil",
] as const;

/** Regroupe les champs par section, dans l'ordre d'affichage. */
export function champsParGroupe(): Array<{
  groupe: string;
  champs: ChampParametre[];
}> {
  return GROUPES.map((g) => ({
    groupe: g,
    champs: CHAMPS_PARAMETRES.filter((c) => c.groupe === g),
  }));
}

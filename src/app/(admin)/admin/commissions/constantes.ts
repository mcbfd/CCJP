/**
 * Constantes du module Commissions (§10.2, P4.7)
 *
 * Module neutre, SANS directive `"use server"` : ces valeurs sont consommées
 * par les pages serveur, les formulaires clients et les actions.
 */

/** Les statuts autorisés par l'enum `projet_statut`. */
export const STATUTS_PROJET = ["planifie", "en_cours", "realise"] as const;
export type StatutProjet = (typeof STATUTS_PROJET)[number];

/** Libellés français des statuts de projet. */
export const LIBELLES_STATUT_PROJET: Record<StatutProjet, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  realise: "Réalisé",
};

/**
 * Les couleurs proposées pour une commission.
 *
 * Le CDC n'impose pas de palette par commission ; ces valeurs reprennent les
 * jetons de la charte graphique du site, pour que les cartes restent
 * cohérentes visuellement.
 */
export const COULEURS_COMMISSION = [
  { valeur: "#1B5E20", nom: "Vert CCJP" },
  { valeur: "#F9A825", nom: "Or CCJP" },
  { valeur: "#C62828", nom: "Rouge CCJP" },
  { valeur: "#1A3A5C", nom: "Marine CCJP" },
  { valeur: "#00695C", nom: "Turquoise" },
  { valeur: "#4527A0", nom: "Violet" },
] as const;

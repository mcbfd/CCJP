/**
 * Constantes du module Événements (§10.2, P4.5)
 *
 * Ce module est volontairement SANS directive `"use server"`. Un fichier
 * portant cette directive ne peut exporter que des fonctions asynchrones, et
 * on a besoin ici de listes et de libellés — consommés à la fois par :
 *   - `actions.ts` (« use server ») ;
 *   - `page.tsx` (composant serveur) ;
 *   - `FormulaireEvenement.tsx` (« use client »).
 * Un module neutre est le seul endroit qui satisfasse les trois usages.
 */

/** Les statuts autorisés par l'enum `evenement_statut`. */
export const STATUTS_EVENEMENT = ["a_venir", "termine", "annule"] as const;
export type StatutEvenement = (typeof STATUTS_EVENEMENT)[number];

/** Libellés français des statuts, pour les listes et les filtres. */
export const LIBELLES_STATUT_EVENEMENT: Record<StatutEvenement, string> = {
  a_venir: "À venir",
  termine: "Terminé",
  annule: "Annulé",
};

/** Quelques types d'événement proposés dans le formulaire. */
export const TYPES_EVENEMENT = [
  "Réunion",
  "Formation",
  "Cérémonie",
  "Conférence",
  "Atelier",
  "Assemblée générale",
  "Sortie",
  "Autre",
] as const;

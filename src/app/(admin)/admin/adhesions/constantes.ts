/**
 * Constantes du module Adhésions (§10.2, P4.8)
 *
 * Module neutre, SANS directive `"use server"` : les libellés sont consommés
 * par les pages serveur, le formulaire client et les actions. Un fichier
 * portant `"use server"` ne peut exporter que des fonctions asynchrones.
 */

/** Les statuts autorisés par l'enum `adhesion_statut`. */
export const STATUTS_ADHESION = ["en_attente", "accepte", "refuse"] as const;
export type StatutAdhesion = (typeof STATUTS_ADHESION)[number];

/** Libellés français des statuts. */
export const LIBELLES_STATUT_ADHESION: Record<StatutAdhesion, string> = {
  en_attente: "En attente",
  accepte: "Acceptée",
  refuse: "Refusée",
};

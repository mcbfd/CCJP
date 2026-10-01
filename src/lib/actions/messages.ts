/**
 * Messages partagés par les Server Actions d'administration.
 *
 * Ce module est volontairement SANS directive `"use server"` : un fichier
 * portant cette directive ne peut exporter que des fonctions asynchrones, et
 * on a besoin d'exporter ici une simple constante.
 */

/** Message renvoyé quand un appelant n'est pas administrateur habilité. */
export const MESSAGE_ACCES_REFUSE =
  "Action refusée : vous devez être connecté en tant qu'administrateur.";

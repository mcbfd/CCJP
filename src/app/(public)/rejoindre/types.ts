/**
 * État du formulaire d'adhésion — partagé entre la Server Action
 * (`actions.ts`) et le composant client (`FormulaireRejoindre.tsx`).
 */

export interface EtatAdhesion {
  /** La demande a bien été enregistrée. */
  succes?: boolean;
  /** Erreur générale (problème technique, base injoignable). */
  erreur?: string;
  /** Erreurs par champ, à afficher sous l'input concerné. */
  champs?: Record<string, string>;
}

export const ETAT_INITIAL: EtatAdhesion = {};

/** Option proposée dans la liste déroulante des commissions. */
export interface OptionCommission {
  id: string;
  nom: string;
}

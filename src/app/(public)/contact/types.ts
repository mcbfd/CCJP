/**
 * État du formulaire de contact — partagé entre la Server Action
 * (`actions.ts`) et le composant client (`FormulaireContact.tsx`).
 *
 * Doit rester sérialisable : il traverse la frontière serveur → client à
 * chaque appel de `useFormState`.
 */

export interface EtatContact {
  /** Le message a bien été enregistré. */
  succes?: boolean;
  /** Erreur générale (problème technique, base injoignable). */
  erreur?: string;
  /** Erreurs par champ, à afficher sous l'input concerné. */
  champs?: Record<string, string>;
}

export const ETAT_INITIAL: EtatContact = {};

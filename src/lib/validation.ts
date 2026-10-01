/**
 * Validation des formulaires publics (PLAN_IMPLEMENTATION.md §9.2, §10.2)
 *
 * Ces vérifications tournent des deux côtés :
 *   - côté client, pour un retour immédiat à la personne ;
 *   - côté serveur, dans les Server Actions, car la validation navigateure
 *     n'est qu'un confort et peut toujours être contournée.
 *
 * La sécurité réelle reste portée par les politiques RLS (migration 0002) :
 * un anonyme peut insérer dans `contacts` et `adhesions`, mais ne peut jamais
 * y relire les lignes des autres.
 */

/* ------------------------------------------------------------------ */
/* Constantes                                                           */
/* ------------------------------------------------------------------ */

/** Longueurs maximales — alignées sur les contraintes du cahier des charges. */
export const LONGUEUR_MAX = {
  nom: 120,
  email: 160,
  sujet: 160,
  telephone: 32,
  quartier: 120,
  message: 4000,
  motivation: 2000,
} as const;

/** Nombre minimal de caractères pour un message utile. */
export const MESSAGE_MIN = 10;

/* ------------------------------------------------------------------ */
/* Vérificateurs                                                        */
/* ------------------------------------------------------------------ */

/**
 * Adresse e-mail plausible.
 * Volontairement permissif : la seule preuve définitive est l'envoi d'un
 * message. On écarte les cas évidemment invalides (espace, double arobase,
 * absence de point dans le domaine).
 */
export function estEmailValide(valeur: string): boolean {
  const v = valeur.trim();
  if (v.length === 0 || v.length > LONGUEUR_MAX.email) return false;
  if (/\s/.test(v)) return false;
  if ((v.match(/@/g) ?? []).length !== 1) return false;

  const [locale, domaine] = v.split("@");
  if (!locale || !domaine) return false;
  if (!/^[^@.]+(\.[^@.]+)*$/.test(domaine)) return false;
  // Le domaine doit contenir au moins un point et pas de point final.
  if (!domaine.includes(".") || domaine.endsWith(".")) return false;
  // Le dernier label doit faire au moins 2 caractères.
  return /[a-z]{2,}$/i.test(domaine);
}

/**
 * Numéro de téléphone sénégalais (optionnel dans les deux formulaires).
 * Accepte les formats locaux et internationaux les plus courants :
 *   77 123 45 67 · +221 77 123 45 67 · 00221 77 123 45 67 · 33 123 45 67
 * Les espaces, points, tirets et parenthèses sont ignorés.
 */
export function estTelephoneValide(valeur: string): boolean {
  const v = valeur.trim();
  if (v.length === 0) return false; // champ vide = non renseigné, pas invalide

  const chiffres = v.replace(/[\s.\-()]/g, "");
  if (!/^(\+221|00221|221)?\d{9}$/.test(chiffres)) return false;
  // Un numéro sénégalais national compte 9 chiffres après l'indicatif.
  return true;
}

/**
 * Champ texte obligatoire : non vide après nettoyage et dans la limite de
 * longueur. Renvoie la valeur nettoyée, ou `null` si invalide.
 */
export function nettoyerRequis(
  valeur: FormDataEntryValue | null | undefined,
  longueurMax: number,
): string | null {
  if (typeof valeur !== "string") return null;
  const v = valeur.trim().replace(/\s+/g, " ");
  if (v.length === 0 || v.length > longueurMax) return null;
  return v;
}

/**
 * Champ texte optionnel : vide autorisé, longueur limitée.
 * Renvoie la valeur nettoyée (éventuellement "") ou `null` si trop longue.
 */
export function nettoyerOptionnel(
  valeur: FormDataEntryValue | null | undefined,
  longueurMax: number,
): string | null {
  if (typeof valeur !== "string") return "";
  const v = valeur.trim().replace(/\s+/g, " ");
  if (v.length > longueurMax) return null;
  return v;
}

/** Récupère une valeur de `FormData` en chaîne (jamais `undefined`). */
export function champ(formData: FormData, nom: string): string {
  const v = formData.get(nom);
  return typeof v === "string" ? v : "";
}

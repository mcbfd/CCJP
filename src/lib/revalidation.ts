import { revalidatePath } from "next/cache";

/**
 * Revalidation du cache ISR (PLAN_IMPLEMENTATION.md §13.1, P4.12)
 *
 * Après chaque publication ou modification, les pages publiques concernées
 * sont invalidées pour que le contenu apparaisse en moins d'une minute —
 * sans attendre l'expiration du délai ISR.
 *
 * `revalidatePath` accepte un chemin exact ou, avec `type: "page"`, une page
 * dynamique. On invalide toujours les VUES LISTE et la page de détail, car
 * une modification d'article change les deux (la liste affiche le titre).
 */

/** Chemins invalidés par une modification des actualités. */
export function revaliderActualites(slug?: string | null) {
  revalidatePath("/actualites");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/actualites/${slug}`);
}

/** Chemins invalidés par une modification des événements. */
export function revaliderEvenements(id?: string | null) {
  revalidatePath("/evenements");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (id) revalidatePath(`/evenements/${id}`);
}

/** Chemins invalidés par une modification des commissions ou projets. */
export function revaliderCommissions(slug?: string | null) {
  revalidatePath("/commissions");
  revalidatePath("/programme");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/commissions/${slug}`);
}

/** Chemins invalidés par une modification du Bureau Exécutif. */
export function revaliderMembres() {
  revalidatePath("/bureau-executif");
  revalidatePath("/");
}

/** Chemins invalidés par une modification des paramètres du site. */
export function revaliderParametres() {
  revalidatePath("/", "layout");
}

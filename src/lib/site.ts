/**
 * URL canonique du site — source unique pour le sitemap, le robots.txt et
 * `metadataBase`.
 *
 * En production, `NEXT_PUBLIC_SITE_URL` est renseignée dans les variables
 * d'environnement Vercel. En développement local, elle vaut
 * `http://localhost:3000`. On retire toujours la barre finale pour pouvoir
 * concaténer des chemins.
 */

export function urlSite(): string {
  const brut = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!brut) return "http://localhost:3000";
  return brut.replace(/\/+$/, "");
}

/** Chemin absolu vers une page du site (pour le sitemap et le canonical). */
export function urlAbsolue(chemin: string): string {
  const c = chemin.startsWith("/") ? chemin : `/${chemin}`;
  return `${urlSite()}${c}`;
}

import { PageIntrouvable } from "@/components/sections/PageIntrouvable";

/**
 * Page 404 du site public — levée par `notFound()` depuis les pages du
 * groupe `(public)` (ex. un article supprimé, une commission inconnue).
 *
 * Elle hérite de la navbar et du pied de page posés par le layout public.
 */

export default function PublicIntrouvable() {
  return <PageIntrouvable />;
}

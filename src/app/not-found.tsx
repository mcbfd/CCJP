import type { Metadata } from "next";
import { PageIntrouvable } from "@/components/sections/PageIntrouvable";

/**
 * Page 404 racine — URLs qui ne correspondent à aucune route du site.
 * (Ajout labellisé v2.0 : pages 404/500 en français.)
 *
 * Elle vit à la racine et non dans `(public)` afin d'intercepter aussi les
 * adresses inconnues en dehors du groupe public. Elle n'hérite donc pas de la
 * navbar : elle est autonome.
 */

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "La page demandée n'existe pas ou a été déplacée. Retrouvez les " +
    "commissions, actualités et événements du CCJP depuis l'accueil.",
  robots: { index: false, follow: true },
};

export default function RacineIntrouvable() {
  return (
    <div className="flex min-h-screen flex-col bg-ccjp-beige">
      <main id="contenu" className="flex-1">
        <PageIntrouvable />
      </main>
    </div>
  );
}

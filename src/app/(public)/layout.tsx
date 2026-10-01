import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getParametresSite } from "@/lib/parametres";

/**
 * Layout public — enveloppe toutes les pages visibles par les visiteurs
 * (PLAN_IMPLEMENTATION.md §5, tâche P2.5)
 *
 * Le groupe de routes `(public)` n'ajoute aucun segment à l'URL : `/`,
 * `/commissions`, `/actualites`… restent inchangés.
 *
 * La navbar et le pied de page sont posés ici une fois pour toutes, et le
 * contenu de chaque page est injecté dans `<main id="contenu">` — cible du
 * lien d'évitement déclaré dans le layout racine.
 */

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Coordonnées et réseaux sociaux, éditables depuis le back-office.
  const parametres = await getParametresSite();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="contenu" className="flex-1">
        {children}
      </main>

      <Footer
        email={parametres.emailContact}
        telephone={parametres.telephone || undefined}
        adresse={parametres.adresse}
        facebookUrl={parametres.facebookUrl || undefined}
        instagramUrl={parametres.instagramUrl || undefined}
        xUrl={parametres.xUrl || undefined}
        tiktokUrl={parametres.tiktokUrl || undefined}
      />
    </div>
  );
}

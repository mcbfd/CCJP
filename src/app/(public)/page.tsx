import type { Metadata } from "next";
import {
  HeroSection,
  StatistiquesSection,
  AProposSection,
  ProgrammeSection,
  CommissionsSection,
  ActualitesSection,
  EvenementsSection,
  CtaRejoindreSection,
} from "@/components/sections/AccueilSections";
import { getParametresSite } from "@/lib/parametres";
import { getCommissions } from "@/lib/data/commissions";
import { getIndicateurs } from "@/lib/data/bureau";
import { getDernieresActualites } from "@/lib/data/actualites";
import { getProchainsEvenements } from "@/lib/data/evenements";

/**
 * Page d'accueil — les 10 sections du cahier des charges (§9.1)
 *
 * La navbar (section 1) et le pied de page (section 10) sont dans
 * `(public)/layout.tsx`. Rendu ISR, revalidation 60 s (§3.3) : les actualités
 * et événements doivent rester frais sans reconstruire tout le site.
 */

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParametresSite();
  return {
    title: `${p.siteNom} — CCJP`,
    description: p.siteDescription,
    alternates: { canonical: "/" },
  };
}

export default async function Page() {
  // Lectures parallèles : une seule vague de requêtes pour toute la page.
  const [parametres, commissions, indicateurs, actualites, evenements] =
    await Promise.all([
      getParametresSite(),
      getCommissions(),
      getIndicateurs(),
      getDernieresActualites(3),
      getProchainsEvenements(3),
    ]);

  return (
    <>
      {/* Section 2 — Bandeau d'accueil */}
      <HeroSection
        titre={parametres.heroTitre}
        sousTitre={parametres.heroSousTitre}
      />

      {/* Section 3 — Les 8 indicateurs d'impact */}
      <StatistiquesSection indicateurs={indicateurs} />

      {/* Section 4 — À propos : mission, vision, valeurs */}
      <AProposSection />

      {/* Section 5 — Programme triennal 2026-2029 */}
      <ProgrammeSection />

      {/* Section 6 — Les 14 commissions */}
      <CommissionsSection commissions={commissions} />

      {/* Section 7 — Actualités récentes */}
      <ActualitesSection actualites={actualites} commissions={commissions} />

      {/* Section 8 — Prochains événements */}
      <EvenementsSection evenements={evenements} />

      {/* Section 9 — Appel à l'action */}
      <CtaRejoindreSection />
    </>
  );
}

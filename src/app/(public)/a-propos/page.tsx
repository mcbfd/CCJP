import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AXES_THEMATIQUES, COMMISSIONS, DEVISE_CCJP, NOM_CCJP } from "@/lib/constants";

/**
 * Page « À propos du CCJP » (§9.2)
 *
 * Mission, vision, valeurs, organisation. Contenu statique tiré du cahier
 * des charges : rendu SSG, sans accès base.
 */

export const metadata: Metadata = {
  title: "À propos du CCJP",
  description:
    "Découvrez la mission, la vision, les valeurs et l'organisation du " +
    "Conseil Consultatif des Jeunes de Podor : 14 commissions techniques, " +
    "un Bureau Exécutif élu et un mandat triennal 2026–2029.",
  alternates: { canonical: "/a-propos" },
};

const MISSION =
  "Le Conseil Consultatif des Jeunes de Podor a pour mission d'être " +
  "l'instance permanente de dialogue entre la jeunesse podoroise et les " +
  "autorités locales. Il recueille les aspirations des jeunes, les " +
  "transforme en propositions concrètes et suit leur mise en œuvre.";

const VISION =
  "Faire de la jeunesse de Podor un acteur reconnu et associé aux " +
  "décisions qui façonnent sa commune, aujourd'hui et pour les " +
  "générations à venir.";

const VALEURS = [
  {
    titre: "Écoute",
    texte:
      "Aller à la rencontre des jeunes dans tous les quartiers de la commune " +
      "de Podor, sans distinction, pour recueillir leurs aspirations réelles.",
  },
  {
    titre: "Participation",
    texte:
      "Associer la jeunesse à chaque étape : conception, mise en œuvre, suivi " +
      "et évaluation des actions qui la concernent.",
  },
  {
    titre: "Impact",
    texte:
      "Privilégier les actions dont les résultats sont mesurables et durables " +
      "pour la communauté, plutôt que les annonces sans suite.",
  },
];

export default function AProposPage() {
  return (
    <>
      {/* Bandeau de tête */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            {NOM_CCJP}
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            À propos du CCJP
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg italic text-white/85">{DEVISE_CCJP}</p>
        </div>
      </section>

      {/* Mission et vision */}
      <section className="px-4 py-16" aria-labelledby="mission-titre">
        <div className="ccjp-container grid gap-8 lg:grid-cols-2">
          <div>
            <SectionTitle surtitre="Notre raison d'être" as="h2">
              <span id="mission-titre">Mission</span>
            </SectionTitle>
            <p className="mt-5 text-base leading-relaxed text-ccjp-marine/80">
              {MISSION}
            </p>
          </div>

          <div>
            <SectionTitle surtitre="Notre cap" as="h2">
              Vision
            </SectionTitle>
            <div className="mt-5 rounded-card border-l-4 border-ccjp-or bg-ccjp-creme p-6">
              <p className="text-base leading-relaxed text-ccjp-marine/80">{VISION}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Les 3 valeurs */}
      <section className="bg-ccjp-creme px-4 py-16" aria-labelledby="valeurs-titre">
        <div className="ccjp-container">
          <SectionTitle surtitre="Ce qui nous guide" as="h2" align="centre">
            <span id="valeurs-titre">Nos trois valeurs</span>
          </SectionTitle>

          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {VALEURS.map((v, i) => (
              <li key={v.titre}>
                <Card className="h-full">
                  <span
                    aria-hidden="true"
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ccjp-vert/10 font-display text-lg font-extrabold text-ccjp-vert"
                  >
                    {i + 1}
                  </span>
                  <CardTitle as="h3">{v.titre}</CardTitle>
                  <p className="mt-2 text-sm leading-relaxed text-ccjp-marine/75">
                    {v.texte}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Organisation : axes et commissions */}
      <section className="px-4 py-16" aria-labelledby="org-titre">
        <div className="ccjp-container">
          <SectionTitle
            surtitre="Comment nous travaillons"
            as="h2"
            chapo="Le CCJP est organisé en 5 axes thématiques qui regroupent 14 commissions techniques, chacune chargée d'un domaine précis."
          >
            <span id="org-titre">Organisation</span>
          </SectionTitle>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AXES_THEMATIQUES.map((axe, i) => {
              const nombre = COMMISSIONS.filter((c) => c.axe === axe).length;
              return (
                <li key={axe}>
                  <Card interactive className="h-full">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <Badge ton={i % 2 === 0 ? "vert" : "marine"}>
                        {nombre} commission{nombre > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <CardTitle as="h3" className="text-base leading-snug">
                      {axe}
                    </CardTitle>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/commissions" variante="primaire">
              Voir les 14 commissions
            </ButtonLink>
            <ButtonLink href="/bureau-executif" variante="secondaire">
              Le Bureau Exécutif
            </ButtonLink>
            <ButtonLink href="/programme" variante="fantome">
              Le programme triennal
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

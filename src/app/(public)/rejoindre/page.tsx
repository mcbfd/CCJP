import type { Metadata } from "next";
import { Sparkles, Users, HandHeart, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { FormulaireRejoindre } from "./FormulaireRejoindre";
import { getCommissions } from "@/lib/data/commissions";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Page « Rejoindre le CCJP » (§9.2)
 *
 * Présente les conditions d'adhésion puis le formulaire qui insère une
 * demande dans `adhesions` (statut `en_attente`). Le choix de la commission
 * est facultatif : la demande reste valable sans rattachement.
 */

export const metadata: Metadata = {
  title: "Rejoindre le CCJP",
  description:
    "Rejoignez le Conseil Consultatif des Jeunes de Podor : conditions " +
    "d'adhésion, choix d'une commission parmi les 14 et formulaire de demande.",
  alternates: { canonical: "/rejoindre" },
};

/** Conditions d'adhésion — reprises du cahier des charges (§2). */
const CONDITIONS = [
  "Être jeune de la commune de Podor ou y résider",
  "Avoir entre 15 et 35 ans",
  "Partager les valeurs du CCJP : écoute, participation, impact",
  "Souhaiter contribuer à la vie citoyenne locale",
];

export default async function RejoindrePage() {
  const commissions = await getCommissions();

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            S’engager
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Rejoindre le CCJP
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Le Conseil Consultatif des Jeunes de Podor est ouvert à toutes les
            jeunes Podoroises et Podorois qui veulent faire avancer leur
            commune.
          </p>
        </div>
      </section>

      <section className="px-4 py-16" aria-labelledby="rejoindre-titre">
        <div className="ccjp-container grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Pourquoi nous rejoindre */}
          <div>
            <SectionTitle surtitre="Pourquoi adhérer" as="h2">
              <span id="rejoindre-titre">Ce que l’adhésion vous apporte</span>
            </SectionTitle>

            <ul className="mt-8 space-y-4">
              <Avantage
                icone={<Users className="h-5 w-5" aria-hidden="true" />}
                titre="Un réseau de jeunes engagés"
                texte="Rencontrez d’autres jeunes de la commune autour de projets concrets."
              />
              <Avantage
                icone={<HandHeart className="h-5 w-5" aria-hidden="true" />}
                titre="Une action de terrain"
                texte="Participez aux campagnes de sensibilisation, aux forums et aux chantiers."
              />
              <Avantage
                icone={<Sparkles className="h-5 w-5" aria-hidden="true" />}
                titre="Une place dans les instances"
                texte="Contribuez aux travaux d’une des 14 commissions techniques."
              />
            </ul>

            <div className="mt-10 rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-ccjp-marine">
                Conditions d’adhésion
              </h3>
              <ul className="space-y-2.5">
                {CONDITIONS.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-ccjp-marine/85">
                    <CheckCircle2
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ccjp-vert"
                      aria-hidden="true"
                    />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <ButtonLink href="/programme" variante="fantome" taille="md">
                Découvrir notre programme
              </ButtonLink>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <Card className="p-6 sm:p-8">
              <SectionTitle surtitre="Formulaire" as="h2">
                Faire une demande d’adhésion
              </SectionTitle>
              <p className="mt-4 text-sm text-ccjp-marine/75">
                Votre demande est transmise au secrétariat. Le choix d’une
                commission est facultatif et pourra être ajusté après votre
                intégration.
              </p>
              <div className="mt-6">
                <FormulaireRejoindre
                  commissions={commissions.map((c) => ({
                    id: c.id,
                    nom: c.nom,
                  }))}
                />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Avantage                                                            */
/* ------------------------------------------------------------------ */

function Avantage({
  icone,
  titre,
  texte,
}: {
  icone: React.ReactNode;
  titre: string;
  texte: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ccjp-or/15 text-ccjp-marine">
        {icone}
      </span>
      <div>
        <h3 className="font-display text-base font-bold text-ccjp-marine">
          {titre}
        </h3>
        <p className="mt-0.5 text-sm leading-relaxed text-ccjp-marine/75">
          {texte}
        </p>
      </div>
    </li>
  );
}

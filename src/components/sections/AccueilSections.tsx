import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatCard } from "@/components/ui/StatCard";
import { CommissionCard } from "@/components/ui/CommissionCard";
import { ActualiteCard, EvenementCard } from "@/components/ui/Cartes";
import {
  COMMISSIONS,
  PHASES_MANDAT,
  DEVISE_CCJP,
  NOM_CCJP,
} from "@/lib/constants";
import type { IndicateurRow } from "@/lib/data/bureau";
import type { CommissionRow } from "@/lib/data/commissions";
import type { ActualiteRow } from "@/lib/data/actualites";
import type { EvenementRow } from "@/lib/data/evenements";

/**
 * Les 10 sections de la page d'accueil (PLAN_IMPLEMENTATION.md §9.1)
 *
 * La navbar (section 1) et le pied de page (section 10) sont fournis par
 * `(public)/layout.tsx`. Ce fichier contient les sections 2 à 9.
 */

/* ------------------------------------------------------------------ */
/* Section 2 — Hero                                                    */
/* ------------------------------------------------------------------ */

export function HeroSection({
  titre,
  sousTitre,
}: {
  titre: string;
  sousTitre: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ccjp-hero px-4 py-20 text-white sm:py-24">
      {/* Décor : évoque le fleuve Sénégal, sans image externe à charger */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(249,168,37,0.5) 0, transparent 45%)," +
            "radial-gradient(circle at 80% 80%, rgba(26,58,92,0.9) 0, transparent 50%)",
        }}
      />

      <div className="ccjp-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-ccjp-or">
            {NOM_CCJP}
          </p>

          <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {titre}
          </h1>

          <div className="ccjp-rule mx-auto mb-6" aria-hidden="true" />

          <p className="mb-9 text-lg italic text-white/85 sm:text-xl">
            {sousTitre || DEVISE_CCJP}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/rejoindre" taille="lg" variante="accent">
              Rejoindre le CCJP
            </ButtonLink>
            <ButtonLink
              href="/commissions"
              taille="lg"
              variante="fantome"
              className="border-white/60 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              Découvrir les 14 commissions
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 3 — Bande statistiques (8 indicateurs)                      */
/* ------------------------------------------------------------------ */

const ICONES_INDICATEURS: Record<string, string> = {
  school: "🎓",
  laptop: "💻",
  trees: "🌳",
  trophy: "🏆",
  rocket: "🚀",
  building: "🏢",
  handshake: "🤝",
  clipboard: "📋",
};

export function StatistiquesSection({
  indicateurs,
}: {
  indicateurs: IndicateurRow[];
}) {
  if (indicateurs.length === 0) return null;

  return (
    <section className="bg-ccjp-creme px-4 py-14" aria-labelledby="stats-titre">
      <div className="ccjp-container">
        <h2 id="stats-titre" className="sr-only">
          Le CCJP en chiffres
        </h2>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {indicateurs.map((ind) => (
            <li key={ind.id}>
              <StatCard
                libelle={ind.libelle}
                valeur={ind.valeur}
                unite={ind.unite || undefined}
                icone={ICONES_INDICATEURS[ind.icone ?? ""] ?? "📈"}
                ton={ind.ordre % 2 === 0 ? "or" : "vert"}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 4 — À propos (mission, vision, valeurs)                     */
/* ------------------------------------------------------------------ */

export function AProposSection() {
  const valeurs = [
    {
      titre: "Écoute",
      texte:
        "Recueillir les aspirations des jeunes de Podor, dans tous les quartiers de la commune.",
    },
    {
      titre: "Participation",
      texte:
        "Associer la jeunesse aux décisions qui la concernent, de la conception au suivi.",
    },
    {
      titre: "Impact",
      texte:
        "Produire des résultats mesurables et durables pour la communauté.",
    },
  ];

  return (
    <section className="px-4 py-16" aria-labelledby="apropos-titre">
      <div className="ccjp-container grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionTitle surtitre="Qui sommes-nous" as="h2">
            <span id="apropos-titre">Le CCJP, la voix de la jeunesse podoroise</span>
          </SectionTitle>

          <p className="mt-5 text-base leading-relaxed text-ccjp-marine/80">
            Le Conseil Consultatif des Jeunes de Podor est l&apos;instance de
            dialogue entre la jeunesse podoroise et les autorités locales. Il
            réunit <strong>14 commissions techniques</strong> et un{" "}
            <strong>Bureau Exécutif élu</strong>, et œuvre pour que les jeunes
            soient associés aux décisions qui les concernent.
          </p>

          <p className="mt-4 text-base leading-relaxed text-ccjp-marine/80">
            Notre mandat triennal 2026–2029 se déploie en trois phases :
            structuration, consolidation, puis pérennisation.
          </p>

          <div className="mt-7">
            <ButtonLink href="/a-propos" variante="secondaire">
              En savoir plus sur le CCJP
            </ButtonLink>
          </div>
        </div>

        {/* Les 3 valeurs */}
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {valeurs.map((v, i) => (
            <li
              key={v.titre}
              className="flex gap-4 rounded-card border-l-4 bg-white p-5 shadow-card"
              style={{ borderLeftColor: i === 1 ? "#F9A825" : "#1B5E20" }}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ccjp-vert/10 font-display text-lg font-extrabold text-ccjp-vert"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ccjp-marine">
                  {v.titre}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ccjp-marine/75">
                  {v.texte}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 5 — Programme triennal                                      */
/* ------------------------------------------------------------------ */

export function ProgrammeSection() {
  return (
    <section className="bg-ccjp-creme px-4 py-16" aria-labelledby="programme-titre">
      <div className="ccjp-container">
        <SectionTitle
          surtitre="Notre feuille de route"
          as="h2"
          chapo="Le mandat triennal 2026–2029 se déploie en trois phases, chacune avec ses objectifs propres."
        >
          <span id="programme-titre">Programme Triennal 2026–2029</span>
        </SectionTitle>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {PHASES_MANDAT.map((phase, i) => (
            <li
              key={phase.annee}
              className="relative flex flex-col rounded-card border border-ccjp-marine/10 bg-white p-6 shadow-card"
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 left-6 rounded-full bg-ccjp-or px-3 py-1 text-xs font-bold text-ccjp-marine"
              >
                Phase {i + 1}
              </span>

              <p className="mb-2 mt-2 font-display text-2xl font-extrabold text-ccjp-vert">
                {phase.annee}
              </p>

              <h3 className="mb-3 font-display text-lg font-bold leading-snug text-ccjp-marine">
                {phase.titre}
              </h3>

              <p className="text-sm leading-relaxed text-ccjp-marine/75">
                {phase.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 text-center">
          <ButtonLink href="/programme" variante="secondaire">
            Voir le programme détaillé
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 6 — Les 14 commissions                                      */
/* ------------------------------------------------------------------ */

export function CommissionsSection({
  commissions,
}: {
  commissions: CommissionRow[];
}) {
  // La base est la source de vérité. Si elle n'est pas encore peuplée, on
  // retombe sur les constantes du CDC, converties dans la même forme que les
  // lignes de la base pour que le rendu soit identique dans les deux cas.
  const liste =
    commissions.length > 0
      ? commissions
      : COMMISSIONS.map((c) => ({
          numero: c.numero,
          slug: c.slug,
          nom: c.nom,
          couleur: c.couleurHex,
          icone: c.icone,
          axes_strategiques: [c.axe],
        }));

  return (
    <section className="px-4 py-16" aria-labelledby="commissions-titre">
      <div className="ccjp-container">
        <SectionTitle
          surtitre="Section 06"
          as="h2"
          align="centre"
          chapo="Quatorze commissions techniques couvrent tous les domaines de la vie des jeunes de Podor."
        >
          <span id="commissions-titre">Nos 14 commissions</span>
        </SectionTitle>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {liste.map((c) => (
            <li key={c.slug} className="h-full">
              <CommissionCard
                commission={{
                  numero: c.numero,
                  slug: c.slug,
                  nom: c.nom,
                  couleur: c.couleur,
                  couleurHex: c.couleur,
                  icone: c.icone,
                  axe: c.axes_strategiques?.[0] ?? null,
                }}
                taille="sm"
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 7 — Actualités récentes                                     */
/* ------------------------------------------------------------------ */

export function ActualitesSection({
  actualites,
  commissions,
}: {
  actualites: ActualiteRow[];
  commissions: CommissionRow[];
}) {
  if (actualites.length === 0) return null;

  const parId = new Map(commissions.map((c) => [c.id, c]));

  return (
    <section className="bg-ccjp-creme px-4 py-16" aria-labelledby="actu-titre">
      <div className="ccjp-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle surtitre="Section 07" as="h2">
            <span id="actu-titre">Actualités récentes</span>
          </SectionTitle>

          <Link
            href="/actualites"
            className="rounded font-semibold text-ccjp-vert transition-colors hover:text-ccjp-vert/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            Voir toutes les actualités →
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {actualites.map((a, i) => {
            const commission = a.commission_id ? parId.get(a.commission_id) : null;
            return (
              <li key={a.id} className="h-full">
                <ActualiteCard
                  actualite={a}
                  variante={i === 0 ? "vedette" : "normale"}
                  commission={
                    commission
                      ? {
                          slug: commission.slug,
                          nom: commission.nom,
                          couleur: commission.couleur,
                        }
                      : null
                  }
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 8 — Prochains événements                                    */
/* ------------------------------------------------------------------ */

export function EvenementsSection({
  evenements,
}: {
  evenements: EvenementRow[];
}) {
  if (evenements.length === 0) return null;

  return (
    <section className="px-4 py-16" aria-labelledby="event-titre">
      <div className="ccjp-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle surtitre="Section 08" as="h2">
            <span id="event-titre">Prochains événements</span>
          </SectionTitle>

          <Link
            href="/evenements"
            className="rounded font-semibold text-ccjp-vert transition-colors hover:text-ccjp-vert/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            Voir tout l&apos;agenda →
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {evenements.map((e) => (
            <li key={e.id} className="h-full">
              <EvenementCard evenement={e} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 9 — Appel à l'action                                        */
/* ------------------------------------------------------------------ */

export function CtaRejoindreSection() {
  return (
    <section className="bg-ccjp-marine px-4 py-16 text-white" aria-labelledby="cta-titre">
      <div className="ccjp-container text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
          Rejoindre le CCJP
        </p>

        <h2
          id="cta-titre"
          className="mx-auto mb-5 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl"
        >
          Fais entendre ta voix pour Podor
        </h2>

        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/80">
          Tu as entre 15 et 35 ans, tu vis à Podor et tu veux agir pour ta
          commune ? Le CCJP t&apos;accueille, quelle que soit ta commission
          d&apos;intérêt.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/rejoindre" taille="lg" variante="accent">
            Déposer ma candidature
          </ButtonLink>
          <ButtonLink
            href="/contact"
            taille="lg"
            variante="fantome"
            className="border-white/50 text-white hover:border-white hover:bg-white/10 hover:text-white"
          >
            Nous contacter
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

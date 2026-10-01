import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { getEvenementsAVenir, getEvenementsPasses } from "@/lib/data/evenements";
import { formatDateFr, formatDateCourteFr } from "@/lib/utils";

/**
 * Page « Événements » (§9.2)
 *
 * Vue liste des événements à venir, puis les événements passés. Chaque
 * événement dispose d'un export `.ics` pour l'ajouter à un agenda.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Événements",
  description:
    "L'agenda du Conseil Consultatif des Jeunes de Podor : réunions, " +
    "formations, cérémonies et compétitions ouvertes à la jeunesse podoroise.",
  alternates: { canonical: "/evenements" },
};

/** Libellés en français des types d'événement. */
const TYPES: Record<string, string> = {
  reunion: "Réunion",
  formation: "Formation",
  ceremonie: "Cérémonie",
  competition: "Compétition",
  conference: "Conférence",
  autre: "Autre",
};

export default async function EvenementsPage() {
  const [aVenir, passes] = await Promise.all([
    getEvenementsAVenir(),
    getEvenementsPasses(12),
  ]);

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Agenda
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Événements
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Réunions, formations, cérémonies et compétitions : retrouvez tous
            les rendez-vous du CCJP et ajoutez-les à votre agenda.
          </p>
        </div>
      </section>

      <div className="px-4 py-14">
        <div className="ccjp-container space-y-14">
          {/* À venir */}
          <section aria-labelledby="avenir-titre">
            <h2
              id="avenir-titre"
              className="mb-6 font-display text-2xl font-extrabold text-ccjp-marine"
            >
              Prochains événements
            </h2>

            {aVenir.length === 0 ? (
              <div className="rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-10 text-center">
                <p className="text-lg font-semibold text-ccjp-marine">
                  Aucun événement programmé pour le moment.
                </p>
                <p className="mt-2 text-sm text-ccjp-marine/70">
                  Les prochaines dates seront publiées ici.
                </p>
                <div className="mt-6">
                  <ButtonLink href="/rejoindre" variante="secondaire">
                    Rejoindre le CCJP
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {aVenir.map((e) => (
                  <li key={e.id}>
                    <article className="flex flex-col gap-4 rounded-card border border-ccjp-marine/10 bg-white p-5 shadow-card sm:flex-row sm:items-center">
                      {/* Bloc date */}
                      <div
                        aria-hidden="true"
                        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-ccjp-vert text-white"
                      >
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {formatDateFr(e.date_debut).split(" ")[1]}
                        </span>
                        <span className="text-2xl font-extrabold leading-none">
                          {new Date(e.date_debut).getDate()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          {e.type_evenement && (
                            <Badge ton="creme">
                              {TYPES[e.type_evenement] ?? e.type_evenement}
                            </Badge>
                          )}
                        </div>

                        <h3 className="mb-1 font-display text-lg font-bold leading-snug text-ccjp-marine">
                          <Link
                            href={`/evenements/${e.id}`}
                            className="rounded transition-colors hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                          >
                            {e.titre}
                          </Link>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ccjp-marine/60">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                            {formatDateFr(e.date_debut)}
                          </span>
                          {e.lieu && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                              {e.lieu}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          href={`/api/ics/${e.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ccjp-marine/25 px-3 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Agenda
                        </Link>
                        {e.lien_inscription && (
                          <a
                            href={e.lien_inscription}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg bg-ccjp-or px-3 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:bg-ccjp-or/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                          >
                            S&apos;inscrire
                          </a>
                        )}
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Passés */}
          {passes.length > 0 && (
            <section aria-labelledby="passes-titre">
              <h2
                id="passes-titre"
                className="mb-6 font-display text-2xl font-extrabold text-ccjp-marine"
              >
                Événements passés
              </h2>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {passes.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/evenements/${e.id}`}
                      className="block h-full rounded-card border border-ccjp-marine/10 bg-white p-4 opacity-80 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:opacity-100 hover:shadow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                    >
                      <Badge ton="neutre">{formatDateCourteFr(e.date_debut)}</Badge>
                      <h3 className="mt-2 font-display text-base font-bold leading-snug text-ccjp-marine">
                        {e.titre}
                      </h3>
                      {e.lieu && (
                        <p className="mt-1 text-xs text-ccjp-marine/60">{e.lieu}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

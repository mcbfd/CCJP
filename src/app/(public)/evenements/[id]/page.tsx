import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { getEvenementById } from "@/lib/data/evenements";
import { formatDateFr, formatDateTimeFr } from "@/lib/utils";

/**
 * Détail d'un événement (§9.2)
 */

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const evenement = await getEvenementById(params.id);
  if (!evenement) return { title: "Événement introuvable" };

  return {
    title: evenement.titre,
    description:
      evenement.description ??
      `${evenement.titre} — événement du Conseil Consultatif des Jeunes de Podor.`,
  };
}

const TYPES: Record<string, string> = {
  reunion: "Réunion",
  formation: "Formation",
  ceremonie: "Cérémonie",
  competition: "Compétition",
  conference: "Conférence",
  autre: "Autre",
};

export default async function EvenementPage({
  params,
}: {
  params: { id: string };
}) {
  const evenement = await getEvenementById(params.id);
  if (!evenement) notFound();

  const memeJour =
    evenement.date_fin &&
    new Date(evenement.date_fin).toDateString() ===
      new Date(evenement.date_debut).toDateString();

  return (
    <article>
      {/* En-tête */}
      <header className="bg-ccjp-hero px-4 py-12 text-white">
        <div className="ccjp-container max-w-3xl">
          <Link
            href="/evenements"
            className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tous les événements
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {evenement.type_evenement && (
              <Badge ton="or">
                {TYPES[evenement.type_evenement] ?? evenement.type_evenement}
              </Badge>
            )}
            <Badge
              ton={
                evenement.statut === "a_venir"
                  ? "vert"
                  : evenement.statut === "annule"
                    ? "rouge"
                    : "neutre"
              }
            >
              {evenement.statut === "a_venir"
                ? "À venir"
                : evenement.statut === "annule"
                  ? "Annulé"
                  : "Terminé"}
            </Badge>
          </div>

          <h1 className="mb-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            {evenement.titre}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {memeJour
                ? formatDateFr(evenement.date_debut)
                : `Du ${formatDateFr(evenement.date_debut)} au ${formatDateFr(
                    evenement.date_fin!,
                  )}`}
            </span>
            {evenement.lieu && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {evenement.lieu}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-12">
        <div className="ccjp-container max-w-3xl">
          {evenement.image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage
            <img
              src={evenement.image_url}
              alt=""
              className="mb-8 w-full rounded-card shadow-hover"
            />
          )}

          {evenement.description && (
            <p className="mb-8 text-lg leading-relaxed text-ccjp-marine/85">
              {evenement.description}
            </p>
          )}

          {/* Informations pratiques */}
          <dl className="mb-8 divide-y divide-ccjp-marine/10 rounded-card border border-ccjp-marine/10 bg-white">
            <div className="flex flex-wrap gap-x-4 px-5 py-3">
              <dt className="font-semibold text-ccjp-marine">Début</dt>
              <dd className="text-ccjp-marine/75">
                {formatDateTimeFr(evenement.date_debut)}
              </dd>
            </div>
            {evenement.date_fin && (
              <div className="flex flex-wrap gap-x-4 px-5 py-3">
                <dt className="font-semibold text-ccjp-marine">Fin</dt>
                <dd className="text-ccjp-marine/75">
                  {formatDateTimeFr(evenement.date_fin)}
                </dd>
              </div>
            )}
            {evenement.lieu && (
              <div className="flex flex-wrap gap-x-4 px-5 py-3">
                <dt className="font-semibold text-ccjp-marine">Lieu</dt>
                <dd className="text-ccjp-marine/75">{evenement.lieu}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/ics/${evenement.id}`}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-ccjp-marine/25 px-5 py-2.5 font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Ajouter à mon agenda
            </a>

            {evenement.lien_inscription && (
              <a
                href={evenement.lien_inscription}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-ccjp-or px-5 py-2.5 font-semibold text-ccjp-marine transition-colors hover:bg-ccjp-or/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
              >
                Lien d&apos;inscription
              </a>
            )}

            <ButtonLink href="/evenements" variante="fantome" taille="md">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour à l&apos;agenda
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}

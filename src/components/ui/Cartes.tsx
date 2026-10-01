import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatDateFr } from "@/lib/utils";
import type { ActualiteRow } from "@/lib/data/actualites";
import type { CommissionRow } from "@/lib/data/commissions";

/**
 * ActualiteCard — carte d'un article (liste et accueil)
 */

export interface ActualiteCardProps {
  actualite: ActualiteRow;
  /** Commission liée, si elle est connue (évite une requête par carte) */
  commission?: Pick<CommissionRow, "slug" | "nom" | "couleur"> | null;
  /** Mise en avant : image plus grande, texte plus long */
  variante?: "normale" | "vedette";
}

export function ActualiteCard({
  actualite,
  commission,
  variante = "normale",
}: ActualiteCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-ccjp-marine/10 bg-white shadow-card",
        "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-hover",
      )}
    >
      {/* Image de une */}
      {actualite.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externe Supabase Storage
        <img
          src={actualite.image_url}
          alt=""
          className={cn(
            "w-full object-cover",
            variante === "vedette" ? "h-52" : "h-40",
          )}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center bg-ccjp-hero text-4xl text-white/70",
            variante === "vedette" ? "h-52" : "h-40",
          )}
        >
          📰
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Métadonnées */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {actualite.epingle && <Badge ton="or">📌 À la une</Badge>}
          {commission && (
            <Link href={`/commissions/${commission.slug}`}>
              <Badge couleur={commission.couleur}>{commission.nom}</Badge>
            </Link>
          )}
          {actualite.date_publication && (
            <time
              dateTime={actualite.date_publication}
              className="text-xs text-ccjp-marine/55"
            >
              {formatDateFr(actualite.date_publication)}
            </time>
          )}
        </div>

        <h3
          className={cn(
            "mb-2 font-display font-bold leading-snug text-ccjp-marine",
            variante === "vedette" ? "text-xl" : "text-lg",
          )}
        >
          <Link
            href={`/actualites/${actualite.slug}`}
            className="rounded transition-colors hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            {actualite.titre}
          </Link>
        </h3>

        {actualite.extrait && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-ccjp-marine/75">
            {actualite.extrait}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <Link
            href={`/actualites/${actualite.slug}`}
            className="rounded text-sm font-semibold text-ccjp-vert transition-colors hover:text-ccjp-vert/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            Lire l&apos;article →
          </Link>

          {actualite.tags.length > 0 && (
            <span className="text-xs text-ccjp-marine/45">
              {actualite.tags.slice(0, 2).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * ÉvénementCard — carte d'un événement
 */

export interface EvenementCardProps {
  evenement: {
    id: string;
    titre: string;
    slug: string;
    description: string | null;
    lieu: string | null;
    date_debut: string;
    date_fin: string | null;
    type_evenement: string | null;
    lien_inscription: string | null;
  };
}

export function EvenementCard({ evenement }: EvenementCardProps) {
  return (
    <article className="flex h-full gap-4 rounded-card border border-ccjp-marine/10 bg-white p-5 shadow-card">
      {/* Bloc date */}
      <div
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-ccjp-vert text-white"
      >
        <span className="text-[10px] font-bold uppercase leading-none">
          {formatDateFr(evenement.date_debut).split(" ")[1]}
        </span>
        <span className="text-2xl font-extrabold leading-none">
          {new Date(evenement.date_debut).getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {evenement.type_evenement && (
            <Badge ton="creme">{evenement.type_evenement}</Badge>
          )}
        </div>

        <h3 className="mb-1 font-display text-lg font-bold leading-snug text-ccjp-marine">
          <Link
            href={`/evenements/${evenement.id}`}
            className="rounded transition-colors hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            {evenement.titre}
          </Link>
        </h3>

        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ccjp-marine/60">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDateFr(evenement.date_debut)}
          </span>
          {evenement.lieu && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {evenement.lieu}
            </span>
          )}
        </div>

        {evenement.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ccjp-marine/75">
            {evenement.description}
          </p>
        )}

        {evenement.lien_inscription && (
          <a
            href={evenement.lien_inscription}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded text-sm font-semibold text-ccjp-vert hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            S&apos;inscrire →
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * MembreCard — carte d'un membre du bureau exécutif
 */

export interface MembreCardProps {
  membre: {
    id: string;
    prenom: string;
    nom: string;
    poste: string;
    biographie: string | null;
    photo_url: string | null;
    commission_id: string | null;
  };
  /** Nom de la commission, si connu */
  commissionNom?: string | null;
  commissionSlug?: string | null;
}

export function MembreCard({
  membre,
  commissionNom,
  commissionSlug,
}: MembreCardProps) {
  return (
    <article className="flex h-full flex-col rounded-card border border-ccjp-marine/10 bg-white p-5 text-center shadow-card">
      {membre.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externe Supabase Storage
        <img
          src={membre.photo_url}
          alt={`${membre.prenom} ${membre.nom}`}
          className="mx-auto mb-4 h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-ccjp-creme text-4xl"
        >
          👤
        </div>
      )}

      <h3 className="font-display text-lg font-bold leading-snug text-ccjp-marine">
        {membre.prenom} {membre.nom}
      </h3>

      <p className="mt-1 text-sm font-semibold text-ccjp-vert">{membre.poste}</p>

      {commissionNom && (
        <p className="mt-2 text-xs text-ccjp-marine/60">
          {commissionSlug ? (
            <Link
              href={`/commissions/${commissionSlug}`}
              className="rounded hover:text-ccjp-vert hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
            >
              {commissionNom}
            </Link>
          ) : (
            commissionNom
          )}
        </p>
      )}

      {membre.biographie && (
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ccjp-marine/75">
          {membre.biographie}
        </p>
      )}
    </article>
  );
}

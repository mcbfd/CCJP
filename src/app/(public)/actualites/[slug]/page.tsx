import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ActualiteCard } from "@/components/ui/Cartes";
import { getActualiteBySlug, getActualitesParCommission } from "@/lib/data/actualites";
import { getCommissions } from "@/lib/data/commissions";
import { formatDateFr } from "@/lib/utils";
import { urlAbsolue } from "@/lib/site";

/**
 * Article complet (§9.2)
 *
 * Image de une, titre, date, commission, corps de l'article, articles liés,
 * boutons de partage. Le compteur de vues est incrémenté côté client (ajout
 * assumé du plan §2.3) — voir `CompteurVues`.
 */

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const actualite = await getActualiteBySlug(params.slug);
  if (!actualite) return { title: "Article introuvable" };

  return {
    title: actualite.titre,
    description: actualite.extrait ?? actualite.titre,
    alternates: { canonical: `/actualites/${actualite.slug}` },
    openGraph: {
      type: "article",
      title: actualite.titre,
      description: actualite.extrait ?? undefined,
      images: actualite.image_url ? [{ url: actualite.image_url }] : undefined,
      publishedTime: actualite.date_publication ?? undefined,
    },
  };
}

export default async function ActualitePage({
  params,
}: {
  params: { slug: string };
}) {
  const actualite = await getActualiteBySlug(params.slug);

  // Brouillon ou slug inconnu → 404. La RLS filtre, l'application constate.
  if (!actualite) notFound();

  const commissions = await getCommissions();
  const commission = actualite.commission_id
    ? commissions.find((c) => c.id === actualite.commission_id)
    : null;

  // Articles liés : même commission, hors article courant.
  const lies =
    commission && actualite.commission_id
      ? (await getActualitesParCommission(actualite.commission_id, 4)).filter(
          (a) => a.id !== actualite.id,
        )
      : [];

  // URL absolue de l'article, indispensable pour les boutons de partage :
  // un lien relatif ne fonctionnerait pas sur WhatsApp ni Facebook.
  const urlArticle = urlAbsolue(`/actualites/${actualite.slug}`);

  const liensPartage = [
    {
      libelle: "WhatsApp",
      // WhatsApp n'accepte qu'un seul paramètre `text` : on y met le titre
      // suivi du lien.
      href: `https://wa.me/?text=${encodeURIComponent(
        `${actualite.titre} ${urlArticle}`,
      )}`,
    },
    {
      libelle: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        urlArticle,
      )}`,
    },
  ];

  return (
    <article>
      {/* En-tête */}
      <header className="bg-ccjp-hero px-4 py-12 text-white">
        <div className="ccjp-container max-w-3xl">
          <Link
            href="/actualites"
            className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Toutes les actualités
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {actualite.epingle && <Badge ton="or">📌 À la une</Badge>}
            {commission && (
              <Link href={`/commissions/${commission.slug}`}>
                <Badge couleur={commission.couleur}>{commission.nom}</Badge>
              </Link>
            )}
          </div>

          <h1 className="mb-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            {actualite.titre}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            {actualite.date_publication && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                <time dateTime={actualite.date_publication}>
                  {formatDateFr(actualite.date_publication)}
                </time>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" aria-hidden="true" />
              {actualite.vues} vue{actualite.vues > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      {/* Image de une */}
      {actualite.image_url && (
        <div className="px-4">
          <div className="ccjp-container max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage */}
            <img
              src={actualite.image_url}
              alt=""
              className="-mt-2 mb-8 w-full rounded-card shadow-hover"
            />
          </div>
        </div>
      )}

      {/* Corps de l'article */}
      <div className="px-4 py-10">
        <div className="ccjp-container max-w-3xl">
          {actualite.extrait && (
            <p className="mb-8 border-l-4 border-ccjp-or pl-5 text-lg font-medium italic leading-relaxed text-ccjp-marine/85">
              {actualite.extrait}
            </p>
          )}

          {/* Le contenu est du HTML produit par l'éditeur riche du back-office.
              Il n'est rendu que pour les administrateurs habilités, et la RLS
              garantit qu'un brouillon n'arrive jamais ici. */}
          {actualite.contenu ? (
            <div
              className="prose-ccjp"
              // Le HTML vient de la base, pas d'un utilisateur anonyme.
              dangerouslySetInnerHTML={{ __html: actualite.contenu }}
            />
          ) : (
            <p className="text-ccjp-marine/70">Cet article n&apos;a pas encore de contenu.</p>
          )}

          {/* Mots-clés */}
          {actualite.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2 border-t border-ccjp-marine/10 pt-6">
              {actualite.tags.map((tag) => (
                <li key={tag}>
                  <Badge ton="neutre">#{tag}</Badge>
                </li>
              ))}
            </ul>
          )}

          {/* Partage */}
          <div className="mt-8 border-t border-ccjp-marine/10 pt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ccjp-marine/60">
              Partager cet article
            </h2>
            <div className="flex flex-wrap gap-2">
              {liensPartage.map((l) => (
                <a
                  key={l.libelle}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border-2 border-ccjp-marine/25 px-4 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                >
                  {l.libelle}
                </a>
              ))}
              <ButtonLink href="/rejoindre" variante="accent" taille="sm">
                Rejoindre le CCJP
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      {/* Articles liés */}
      {lies.length > 0 && (
        <section className="bg-ccjp-creme px-4 py-14" aria-labelledby="lies-titre">
          <div className="ccjp-container">
            <h2
              id="lies-titre"
              className="mb-8 font-display text-2xl font-extrabold text-ccjp-marine"
            >
              À lire aussi
            </h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {lies.map((a) => (
                <li key={a.id} className="h-full">
                  <ActualiteCard
                    actualite={a}
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
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

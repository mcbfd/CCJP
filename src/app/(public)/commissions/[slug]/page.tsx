import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ActualiteCard } from "@/components/ui/Cartes";
import { ButtonLink } from "@/components/ui/Button";
import { getIconeCommission } from "@/lib/commission-icons";
import { getCommissionBySlug, getCommissions } from "@/lib/data/commissions";
import { getProjetsParCommission } from "@/lib/data/bureau";
import { getActualitesParCommission } from "@/lib/data/actualites";

/**
 * Détail d'une commission (§8.2)
 *
 * Structure imposée par le cahier des charges :
 *   bandeau couleur → icône + n° + nom → description | vision →
 *   axes stratégiques → projets phares → actualités liées → retour
 *
 * Objectif de vulgarisation (O3) : compréhensible par un jeune de 15 ans
 * comme par un partenaire technique.
 */

export const revalidate = 1800;

/** Pré-génère les 14 pages au build (ISR). */
export async function generateStaticParams() {
  const commissions = await getCommissions();
  return commissions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const commission = await getCommissionBySlug(params.slug);
  if (!commission) {
    return { title: "Commission introuvable" };
  }
  return {
    title: commission.nom,
    description:
      commission.description ??
      `Découvrez la commission « ${commission.nom} » du CCJP : vision, axes stratégiques et projets phares.`,
    alternates: { canonical: `/commissions/${commission.slug}` },
  };
}

const LIBELLES_STATUT: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  realise: "Réalisé",
};

export default async function CommissionPage({
  params,
}: {
  params: { slug: string };
}) {
  const commission = await getCommissionBySlug(params.slug);

  // Une commission inconnue OU non publiée donne un 404 : c'est la RLS qui
  // décide, pas l'application.
  if (!commission) notFound();

  const [projets, actualites] = await Promise.all([
    getProjetsParCommission(commission.id),
    getActualitesParCommission(commission.id, 3),
  ]);

  const Icone = getIconeCommission(commission.icone);
  const axes = commission.axes_strategiques ?? [];

  return (
    <>
      {/* Bandeau couleur commission */}
      <section
        className="px-4 py-12 text-white"
        style={{ backgroundColor: commission.couleur }}
      >
        <div className="ccjp-container">
          <Link
            href="/commissions"
            className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Toutes les commissions
          </Link>

          <div className="flex flex-wrap items-center gap-5">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15"
            >
              <Icone className="h-8 w-8" />
            </span>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                Commission {String(commission.numero).padStart(2, "0")}
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                {commission.nom}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 py-14">
        <div className="ccjp-container space-y-14">
          {/* Description + vision */}
          <section className="grid gap-6 lg:grid-cols-2" aria-label="Présentation">
            <div>
              <h2 className="mb-4 font-display text-2xl font-extrabold text-ccjp-marine">
                Description
              </h2>
              <p className="text-base leading-relaxed text-ccjp-marine/80">
                {commission.description ??
                  "La description de cette commission sera bientôt disponible."}
              </p>
            </div>

            {commission.vision && (
              <aside
                className="rounded-card border-l-4 bg-ccjp-creme p-6"
                style={{ borderLeftColor: commission.couleur }}
              >
                <h2 className="mb-3 font-display text-lg font-bold text-ccjp-marine">
                  Notre vision
                </h2>
                <p className="text-base italic leading-relaxed text-ccjp-marine/80">
                  « {commission.vision} »
                </p>
              </aside>
            )}
          </section>

          {/* Axes stratégiques */}
          {axes.length > 0 && (
            <section aria-labelledby="axes-titre">
              <h2
                id="axes-titre"
                className="mb-5 font-display text-2xl font-extrabold text-ccjp-marine"
              >
                Axes stratégiques
              </h2>
              <ul className="flex flex-wrap gap-2">
                {axes.map((axe) => (
                  <li key={axe}>
                    <Badge couleur={commission.couleur} taille="md">
                      {axe}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Projets phares */}
          <section aria-labelledby="projets-titre">
            <h2
              id="projets-titre"
              className="mb-5 font-display text-2xl font-extrabold text-ccjp-marine"
            >
              Projets phares
            </h2>

            {projets.length === 0 ? (
              <p className="rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-6 text-sm text-ccjp-marine/70">
                Les projets phares de cette commission seront publiés
                prochainement.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projets.map((p) => (
                  <li key={p.id} className="h-full">
                    <Card
                      className="h-full"
                      bordureCouleur={commission.couleur}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Badge ton="or">{p.annee ?? "—"}</Badge>
                        <Badge
                          ton={
                            p.statut === "realise"
                              ? "vert"
                              : p.statut === "en_cours"
                                ? "or"
                                : "neutre"
                          }
                        >
                          {LIBELLES_STATUT[p.statut] ?? p.statut}
                        </Badge>
                      </div>
                      <CardTitle as="h3">{p.titre}</CardTitle>
                      {p.description && (
                        <CardDescription>{p.description}</CardDescription>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Actualités liées */}
          {actualites.length > 0 && (
            <section aria-labelledby="actu-liees-titre">
              <h2
                id="actu-liees-titre"
                className="mb-5 font-display text-2xl font-extrabold text-ccjp-marine"
              >
                Actualités de la commission
              </h2>
              <ul className="grid gap-5 md:grid-cols-3">
                {actualites.map((a) => (
                  <li key={a.id} className="h-full">
                    <ActualiteCard
                      actualite={a}
                      commission={{
                        slug: commission.slug,
                        nom: commission.nom,
                        couleur: commission.couleur,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Retour */}
          <div className="flex flex-wrap gap-3 border-t border-ccjp-marine/10 pt-8">
            <ButtonLink href="/commissions" variante="secondaire">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour à toutes les commissions
            </ButtonLink>
            <ButtonLink href="/rejoindre" variante="accent">
              Rejoindre cette commission
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}

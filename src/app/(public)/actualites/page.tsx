import type { Metadata } from "next";
import Link from "next/link";
import { ActualiteCard } from "@/components/ui/Cartes";
import { ButtonLink } from "@/components/ui/Button";
import { getActualites } from "@/lib/data/actualites";
import { getCommissions } from "@/lib/data/commissions";
import { cn } from "@/lib/utils";

/**
 * Liste des actualités (§9.2)
 *
 * Pagination 12 par page, filtre par commission, articles épinglés en tête.
 * Le filtre et la pagination passent par l'URL (`?page=` et `?commission=`),
 * ce qui rend les vues partageables et indexables.
 */

export const revalidate = 120;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string; commission?: string };
}): Promise<Metadata> {
  const page = Number(searchParams.page) > 1 ? ` — page ${searchParams.page}` : "";
  return {
    title: `Actualités${page}`,
    description:
      "Toutes les actualités du Conseil Consultatif des Jeunes de Podor : " +
      "actions des commissions, événements, annonces et vie de l'institution.",
    alternates: { canonical: "/actualites" },
  };
}

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: { page?: string; commission?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const commissionSlug = searchParams.commission;

  // La commission est résolue par slug pour que l'URL reste lisible.
  const commissions = await getCommissions();
  const commissionChoisie = commissionSlug
    ? (commissions.find((c) => c.slug === commissionSlug) ?? null)
    : null;

  const { actualites, totalPages, total } = await getActualites({
    page,
    commissionId: commissionChoisie?.id,
  });

  const lienPage = (n: number) => {
    const params = new URLSearchParams();
    if (n > 1) params.set("page", String(n));
    if (commissionSlug) params.set("commission", commissionSlug);
    const q = params.toString();
    return q ? `/actualites?${q}` : "/actualites";
  };

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Vie du CCJP
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Actualités
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Suivez les actions des 14 commissions, les annonces du Bureau
            Exécutif et la vie de la jeunesse podoroise.
          </p>
        </div>
      </section>

      <section className="px-4 py-14" aria-labelledby="liste-titre">
        <div className="ccjp-container">
          <h2 id="liste-titre" className="sr-only">
            Liste des actualités
          </h2>

          {/* Filtre par commission */}
          <nav aria-label="Filtrer par commission" className="mb-8">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={commissionSlug ? "/actualites" : "/actualites"}
                  aria-current={!commissionSlug ? "page" : undefined}
                  className={cn(
                    "inline-block rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                    !commissionSlug
                      ? "bg-ccjp-vert text-white"
                      : "bg-ccjp-marine/10 text-ccjp-marine hover:bg-ccjp-marine/20",
                  )}
                >
                  Toutes
                </Link>
              </li>
              {commissions.map((c) => {
                const actif = c.slug === commissionSlug;
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/actualites?commission=${c.slug}`}
                      aria-current={actif ? "page" : undefined}
                      className={cn(
                        "inline-block rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                        actif
                          ? "text-white"
                          : "bg-ccjp-marine/10 text-ccjp-marine hover:bg-ccjp-marine/20",
                      )}
                      style={actif ? { backgroundColor: c.couleur } : undefined}
                    >
                      {c.nom}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Résultats */}
          {actualites.length === 0 ? (
            <div className="rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-10 text-center">
              <p className="text-lg font-semibold text-ccjp-marine">
                Aucune actualité à afficher pour le moment.
              </p>
              <p className="mt-2 text-sm text-ccjp-marine/70">
                {commissionSlug
                  ? "Cette commission n'a pas encore publié d'article."
                  : "Les premières actualités seront publiées très prochainement."}
              </p>
              <div className="mt-6">
                <ButtonLink href="/" variante="secondaire">
                  Retour à l&apos;accueil
                </ButtonLink>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-ccjp-marine/60">
                {total} article{total > 1 ? "s" : ""}
                {commissionChoisie && ` — ${commissionChoisie.nom}`}
                {totalPages > 1 && ` — page ${page} sur ${totalPages}`}
              </p>

              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {actualites.map((a) => {
                  const commission = a.commission_id
                    ? commissions.find((c) => c.id === a.commission_id)
                    : null;
                  return (
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
                  );
                })}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination des actualités"
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                  {page > 1 && (
                    <Link
                      href={lienPage(page - 1)}
                      className="rounded-lg border-2 border-ccjp-marine/25 px-4 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert"
                    >
                      ← Précédent
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={lienPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                        n === page
                          ? "bg-ccjp-vert text-white"
                          : "border-2 border-ccjp-marine/25 text-ccjp-marine hover:border-ccjp-vert hover:text-ccjp-vert",
                      )}
                    >
                      {n}
                    </Link>
                  ))}

                  {page < totalPages && (
                    <Link
                      href={lienPage(page + 1)}
                      className="rounded-lg border-2 border-ccjp-marine/25 px-4 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert"
                    >
                      Suivant →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

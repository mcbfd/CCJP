import type { Metadata } from "next";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { PHASES_MANDAT } from "@/lib/constants";
import { getTousLesProjets } from "@/lib/data/bureau";

/**
 * Page « Programme Triennal 2026–2029 » (§9.2)
 *
 * Les 3 phases du mandat (statique) + les projets phares regroupés par
 * commission et par année. Les projets viennent de la base ; s'il n'y en a
 * pas encore, seules les 3 phases s'affichent — pas de section vide.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Programme Triennal 2026–2029",
  description:
    "Le programme triennal du CCJP : trois phases — structuration, " +
    "consolidation, pérennisation — et les projets phares portés par " +
    "chacune des 14 commissions.",
  alternates: { canonical: "/programme" },
};

const LIBELLES_STATUT: Record<string, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  realise: "Réalisé",
};

export default async function ProgrammePage() {
  const projets = await getTousLesProjets();

  // Regroupement par commission
  const parCommission = new Map<
    string,
    { nom: string; numero: number; slug: string; couleur: string; projets: typeof projets }
  >();

  for (const p of projets) {
    const c = p.commissions;
    if (!c) continue;
    if (!parCommission.has(c.slug)) {
      parCommission.set(c.slug, { ...c, projets: [] });
    }
    parCommission.get(c.slug)!.projets.push(p);
  }

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Feuille de route
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Programme Triennal 2026–2029
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Le mandat du CCJP se déploie en trois phases, chacune avec ses
            objectifs propres et ses projets phares.
          </p>
        </div>
      </section>

      {/* Les 3 phases */}
      <section className="px-4 py-16" aria-labelledby="phases-titre">
        <div className="ccjp-container">
          <SectionTitle surtitre="Les trois temps du mandat" as="h2">
            <span id="phases-titre">Les trois phases</span>
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
        </div>
      </section>

      {/* Projets phares par commission */}
      {parCommission.size > 0 && (
        <section className="bg-ccjp-creme px-4 py-16" aria-labelledby="projets-titre">
          <div className="ccjp-container">
            <SectionTitle
              surtitre="Concrètement"
              as="h2"
              chapo="Les projets phares portés par chaque commission, avec leur année et leur statut d'avancement."
            >
              <span id="projets-titre">Projets phares par commission</span>
            </SectionTitle>

            <div className="mt-10 space-y-6">
              {[...parCommission.values()]
                .sort((a, b) => a.numero - b.numero)
                .map((groupe) => (
                  <article
                    key={groupe.slug}
                    className="overflow-hidden rounded-card border border-ccjp-marine/10 bg-white shadow-card"
                  >
                    <header
                      className="flex flex-wrap items-center gap-3 border-b border-ccjp-marine/10 px-5 py-3"
                      style={{ borderLeft: `4px solid ${groupe.couleur}` }}
                    >
                      <span className="text-xs font-bold tabular-nums text-ccjp-marine/40">
                        {String(groupe.numero).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-lg font-bold text-ccjp-marine">
                        {groupe.nom}
                      </h3>
                      <Badge ton="neutre">
                        {groupe.projets.length} projet
                        {groupe.projets.length > 1 ? "s" : ""}
                      </Badge>
                    </header>

                    <ul className="divide-y divide-ccjp-marine/10">
                      {groupe.projets
                        .slice()
                        .sort((a, b) => (a.annee ?? 0) - (b.annee ?? 0))
                        .map((p) => (
                          <li key={p.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                            <Badge ton="or" taille="md">
                              {p.annee ?? "—"}
                            </Badge>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold leading-snug text-ccjp-marine">
                                {p.titre}
                              </h4>
                              {p.description && (
                                <p className="mt-1 text-sm leading-relaxed text-ccjp-marine/70">
                                  {p.description}
                                </p>
                              )}
                            </div>

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
                          </li>
                        ))}
                    </ul>
                  </article>
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

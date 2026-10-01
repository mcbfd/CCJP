import type { Metadata } from "next";
import { CommissionCard } from "@/components/ui/CommissionCard";
import { Badge } from "@/components/ui/Badge";
import { getCommissionsParAxe } from "@/lib/data/commissions";
import { COMMISSIONS } from "@/lib/constants";

/**
 * Page « Les 14 commissions » (§9.2)
 *
 * Grille des 14 commissions, regroupées par axe thématique. Les couleurs et
 * les icônes viennent de la base (colonne `couleur` et `icone`).
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Les 14 commissions",
  description:
    "Les 14 commissions techniques du Conseil Consultatif des Jeunes de " +
    "Podor, regroupées en 5 axes thématiques : gouvernance, éducation, " +
    "emploi, environnement et pilotage territorial.",
  alternates: { canonical: "/commissions" },
};

export default async function CommissionsPage() {
  const groupes = await getCommissionsParAxe();

  // Repli sur les constantes du CDC si la base n'est pas encore peuplée.
  const donnees =
    groupes.length > 0
      ? groupes
      : [
          {
            axe: "Toutes les commissions",
            commissions: COMMISSIONS.map((c) => ({ ...c, axes_strategiques: [c.axe] })),
          },
        ];

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Organisation
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Les 14 commissions
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Chaque commission porte un domaine précis de la vie des jeunes de
            Podor. Cliquez sur une commission pour découvrir sa vision, ses
            axes stratégiques et ses projets phares.
          </p>
        </div>
      </section>

      {/* Groupes par axe */}
      <div className="px-4 py-14">
        <div className="ccjp-container space-y-14">
          {donnees.map((groupe) => (
            <section key={groupe.axe} aria-labelledby={`axe-${slug(groupe.axe)}`}>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <h2
                  id={`axe-${slug(groupe.axe)}`}
                  className="font-display text-2xl font-extrabold text-ccjp-marine"
                >
                  {groupe.axe}
                </h2>
                <Badge ton="vert">
                  {groupe.commissions.length} commission
                  {groupe.commissions.length > 1 ? "s" : ""}
                </Badge>
              </div>

              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groupe.commissions.map((c) => (
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
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function slug(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

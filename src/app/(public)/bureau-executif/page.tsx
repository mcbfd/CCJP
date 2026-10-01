import type { Metadata } from "next";
import { MembreCard } from "@/components/ui/Cartes";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getMembresBureau } from "@/lib/data/bureau";
import { getCommissions } from "@/lib/data/commissions";

/**
 * Page « Bureau Exécutif » (§9.2)
 *
 * Membres triés par `ordre` croissant. Le nom de leur commission est
 * résolu côté serveur pour éviter une requête par carte.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bureau Exécutif",
  description:
    "Découvrez les membres du Bureau Exécutif du Conseil Consultatif des " +
    "Jeunes de Podor et leurs commissions de rattachement.",
  alternates: { canonical: "/bureau-executif" },
};

export default async function BureauExecutifPage() {
  const [membres, commissions] = await Promise.all([
    getMembresBureau(),
    getCommissions(),
  ]);

  const commissionParId = new Map(commissions.map((c) => [c.id, c]));

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Instance dirigeante
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Bureau Exécutif
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            L&apos;instance élue qui porte le mandat du CCJP et coordonne les
            14 commissions techniques.
          </p>
        </div>
      </section>

      <section className="px-4 py-16" aria-labelledby="membres-titre">
        <div className="ccjp-container">
          {membres.length === 0 ? (
            <div className="rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-10 text-center">
              <p className="text-lg font-semibold text-ccjp-marine">
                Le Bureau Exécutif sera présenté ici après son installation.
              </p>
              <p className="mt-2 text-sm text-ccjp-marine/70">
                Les membres sont ajoutés depuis l&apos;espace d&apos;administration.
              </p>
            </div>
          ) : (
            <>
              <SectionTitle
                surtitre={`${membres.length} membre${membres.length > 1 ? "s" : ""}`}
                as="h2"
              >
                <span id="membres-titre">Les membres du Bureau</span>
              </SectionTitle>

              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {membres.map((m) => {
                  const commission = m.commission_id
                    ? commissionParId.get(m.commission_id)
                    : null;
                  return (
                    <li key={m.id} className="h-full">
                      <MembreCard
                        membre={m}
                        commissionNom={commission?.nom ?? null}
                        commissionSlug={commission?.slug ?? null}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}

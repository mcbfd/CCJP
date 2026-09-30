import Link from "next/link";
import { COMMISSIONS, DEVISE_CCJP, NOM_CCJP } from "@/lib/constants";

/**
 * Page d'accueil provisoire — Phase 0.
 *
 * Cette page sera remplacée à la Phase 3 par les 10 sections décrites dans
 * PLAN_IMPLEMENTATION.md §9.1. Elle sert ici de test de fumée : elle valide
 * que la charte graphique, les polices et les constantes des 14 commissions
 * sont correctement câblées.
 */
export default function Page() {
  return (
    <main id="contenu" className="min-h-screen">
      {/* Bandeau provisoire */}
      <div className="bg-ccjp-or px-4 py-2 text-center text-sm font-semibold text-ccjp-marine">
        🚧 Phase 0 — squelette du projet. Le site complet arrive en Phase 3.
      </div>

      {/* Hero */}
      <section className="bg-ccjp-hero px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-ccjp-or bg-white text-5xl shadow-lg"
          >
            🏛️
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-ccjp-or">
            {NOM_CCJP}
          </p>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            La voix de la jeunesse podoroise
          </h1>

          <div className="ccjp-rule mx-auto mb-6" />

          <p className="mb-8 text-lg italic text-white/85">{DEVISE_CCJP}</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rejoindre"
              className="rounded-lg bg-ccjp-or px-6 py-3 font-semibold text-ccjp-marine transition hover:brightness-95"
            >
              Rejoindre le CCJP
            </Link>
            <Link
              href="/commissions"
              className="rounded-lg border-2 border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Découvrir les 14 commissions
            </Link>
          </div>
        </div>
      </section>

      {/* Les 14 commissions */}
      <section className="bg-ccjp-creme px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ccjp-or">
            Section 03
          </p>
          <h2 className="mb-3 text-3xl font-extrabold text-ccjp-marine">
            Nos 14 commissions
          </h2>
          <div className="ccjp-rule mb-8" />

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COMMISSIONS.map((c) => (
              <li
                key={c.slug}
                className="rounded-lg border-l-4 bg-white p-4 shadow-card"
                style={{ borderLeftColor: c.couleurHex }}
              >
                <div aria-hidden="true" className="mb-1 text-2xl">
                  {c.icone}
                </div>
                <div className="text-xs font-bold text-ccjp-marine/40">
                  {String(c.numero).padStart(2, "0")}
                </div>
                <div className="text-sm font-bold leading-snug text-ccjp-marine">
                  {c.nom}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pied de page provisoire */}
      <footer className="bg-ccjp-marine px-4 py-8 text-center text-sm text-white/70">
        <p className="mb-1 font-semibold text-ccjp-or">{DEVISE_CCJP}</p>
        <p>
          {NOM_CCJP} — Programme Triennal 2026–2029 · Stack : Next.js 14 ·
          Supabase · Tailwind CSS · Vercel
        </p>
      </footer>
    </main>
  );
}

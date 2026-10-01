import Link from "next/link";
import { FileQuestion, Home, Search, Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Page « 404 » en français (ajout labellisé v2.0 — CDC §1.3)
 *
 * Partageable entre le `not-found.tsx` racine et celui du groupe `(public)`.
 * Propose des sorties utiles : retour à l'accueil, recherche par rubrique,
 * et contact.
 */

const RUBRIQUES = [
  { label: "Les 14 commissions", href: "/commissions" },
  { label: "Actualités", href: "/actualites" },
  { label: "Événements", href: "/evenements" },
  { label: "Programme", href: "/programme" },
  { label: "Bureau Exécutif", href: "/bureau-executif" },
  { label: "Nous contacter", href: "/contact" },
];

export function PageIntrouvable() {
  return (
    <section className="px-4 py-20">
      <div className="ccjp-container max-w-2xl text-center">
        <p className="mb-3 font-display text-7xl font-extrabold text-ccjp-vert/25 sm:text-8xl">
          404
        </p>

        <FileQuestion
          className="mx-auto mb-5 h-14 w-14 text-ccjp-or"
          aria-hidden="true"
        />

        <h1 className="mb-4 font-display text-3xl font-extrabold leading-tight text-ccjp-marine sm:text-4xl">
          Page introuvable
        </h1>

        <div className="ccjp-rule mx-auto mb-6" aria-hidden="true" />

        <p className="mx-auto mb-8 text-lg leading-relaxed text-ccjp-marine/75">
          La page que vous cherchez n’existe pas, ou son adresse a changé.
          Vous pouvez retrouver l’essentiel du site depuis les rubriques
          ci-dessous.
        </p>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" variante="primaire" taille="lg">
            <Home className="h-4 w-4" aria-hidden="true" />
            Retour à l’accueil
          </ButtonLink>
          <ButtonLink href="/contact" variante="fantome" taille="lg">
            <Mail className="h-4 w-4" aria-hidden="true" />
            Nous écrire
          </ButtonLink>
        </div>

        <div className="rounded-card border border-ccjp-marine/10 bg-ccjp-creme p-6 text-left">
          <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ccjp-marine">
            <Search className="h-4 w-4 text-ccjp-or" aria-hidden="true" />
            Chercher ailleurs sur le site
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {RUBRIQUES.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ccjp-marine transition-colors hover:bg-ccjp-vert/10 hover:text-ccjp-vert"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-ccjp-or"
                    aria-hidden="true"
                  />
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

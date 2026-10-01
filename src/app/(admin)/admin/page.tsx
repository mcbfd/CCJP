import Link from "next/link";
import { MODULES_ADMIN } from "@/lib/modules-admin";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * Tableau de bord — page provisoire (Phase 2, tâche P2.6)
 *
 * Le tableau de bord complet (4 compteurs, actions rapides, dernières
 * actualités, derniers messages) est construit en Phase 4 (P4.3), une fois
 * la base Supabase connectée.
 *
 * Cette page provisoire vérifie que la sidebar des 9 modules est bien
 * rendue et que chaque module est annoncé correctement.
 */

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <Badge ton="or">Phase 2</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Tableau de bord
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Bienvenue dans l&apos;espace d&apos;administration du CCJP. Les 9
          modules ci-dessous seront alimentés par la base Supabase dès la
          Phase 4.
        </p>
      </header>

      <section aria-labelledby="modules-titre">
        <h2
          id="modules-titre"
          className="mb-4 font-display text-xl font-bold text-ccjp-marine"
        >
          Les 9 modules
        </h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES_ADMIN.map((m) => (
            <li key={m.href}>
              <Card interactive as="div" className="h-full">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ccjp-vert/10"
                  >
                    <m.Icone className="h-5 w-5 text-ccjp-vert" aria-hidden="true" />
                  </span>
                  <CardTitle as="h3">{m.libelle}</CardTitle>
                </div>
                <CardDescription>{m.description}</CardDescription>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-ccjp-marine/60">
        Besoin d&apos;un rappel ? Consultez{" "}
        <Link
          href="/"
          className="font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
        >
          le site public
        </Link>
        .
      </p>
    </div>
  );
}

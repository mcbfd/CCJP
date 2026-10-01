import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { FormulaireConnexion } from "./FormulaireConnexion";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { NOM_CCJP } from "@/lib/constants";

/**
 * Page de connexion (§7.2)
 *
 * Si une session administrateur valide existe déjà, on renvoie directement
 * vers `/admin` — inutile de réafficher le formulaire.
 *
 * Le paramètre `?next=` est validé avant d'être réinjecté dans le formulaire :
 * n'importe quelle chaîne venant de l'URL serait une porte ouverte à une
 * redirection malveillante (open redirect).
 */

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Accès à l'espace d'administration du Conseil Consultatif des Jeunes de Podor.",
};

/**
 * Ne conserve que les destinations internes sûres.
 * Refuse notamment `//evil.com` (URL relative au protocole) et tout ce qui
 * ne commence pas par `/admin`.
 */
function destinationSure(next: string | undefined): string | undefined {
  if (!next) return undefined;
  if (!next.startsWith("/admin")) return undefined;
  if (next.startsWith("//")) return undefined;
  return next;
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: { erreur?: string; next?: string };
}) {
  // Session déjà valide et habilitée ? Direction le tableau de bord.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (await isCurrentUserAdmin())) {
    redirect("/admin");
  }

  const destination = destinationSure(searchParams.next);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ccjp-or bg-white text-2xl"
        >
          🏛️
        </span>
        <h1 className="font-display text-2xl font-extrabold text-white">
          Espace d&apos;administration
        </h1>
        <p className="mt-1.5 text-sm text-white/60">{NOM_CCJP}</p>
      </div>

      <div className="rounded-card border border-white/10 bg-white/5 p-6 shadow-hover backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-ccjp-or">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
            Connexion
          </h2>
        </div>

        <FormulaireConnexion
          erreur={searchParams.erreur}
          destination={destination}
        />
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        Problème d&apos;accès ? Contactez le secrétariat à{" "}
        <a
          href="mailto:contact@ccjp-podor.sn"
          className="underline hover:text-white/70"
        >
          contact@ccjp-podor.sn
        </a>
      </p>
    </div>
  );
}

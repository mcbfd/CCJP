import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { deconnexion } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

/**
 * Page « Accès non autorisé » (§7.2)
 *
 * Atteinte lorsqu'un utilisateur est authentifié auprès de Supabase mais
 * n'est pas habilité dans la table `admins`. C'est une situation distincte de
 * « non connecté » : la session existe, elle n'a simplement pas les droits.
 *
 * On propose la déconnexion pour pouvoir se reconnecter avec un autre compte.
 */

export const metadata: Metadata = {
  title: "Accès non autorisé",
  robots: { index: false, follow: false },
};

export default function AccesNonAutorisePage() {
  return (
    <div className="w-full max-w-lg text-center">
      <span
        aria-hidden="true"
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-ccjp-rouge/60 bg-ccjp-rouge/10"
      >
        <ShieldAlert className="h-8 w-8 text-ccjp-or" aria-hidden="true" />
      </span>

      <h1 className="mb-3 font-display text-3xl font-extrabold text-white">
        Accès non autorisé
      </h1>

      <div className="ccjp-rule mx-auto mb-6" aria-hidden="true" />

      <p className="mb-8 leading-relaxed text-white/75">
        Votre compte est authentifié mais n&apos;est pas habilité à administrer
        le site du CCJP. Seuls les membres désignés par le Bureau Exécutif
        disposent de cet accès.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <form action={deconnexion}>
          <Button type="submit" variante="accent" taille="md">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Se déconnecter
          </Button>
        </form>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-white/25 px-5 py-2.5 font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Retour au site
        </Link>
      </div>

      <p className="mt-8 text-xs text-white/40">
        Besoin d&apos;un accès ? Écrivez à{" "}
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

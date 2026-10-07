import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireParametres } from "./FormulaireParametres";
import { CHAMPS_PARAMETRES } from "./constantes";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Module Paramètres (§10.2, P4.11)
 *
 * Les valeurs affichées sont lues via la RLS. Un administrateur habilité voit
 * aussi les clés sensibles (secret, token, password) grâce à la politique
 * « Admins gèrent les paramètres » ; le formulaire n'en propose aucune, ces
 * valeurs relevant des variables d'environnement et non de l'interface.
 *
 * Les clés absentes de la base apparaissent vides plutôt que de faire échouer
 * la page : l'action d'enregistrement les créera au besoin (upsert).
 */

export const metadata: Metadata = {
  title: "Paramètres du site",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/parametres");

  const { data: lignes } = await supabase.from("parametres").select("cle, valeur");

  const valeurs: Record<string, string> = {};
  for (const l of lignes ?? []) valeurs[l.cle] = l.valeur ?? "";

  return (
    <div className="space-y-6">
      <header>
        <Badge ton="or">Module Paramètres</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Paramètres du site
        </h1>
        <p className="mt-2 max-w-3xl text-ccjp-marine/75">
          Ces valeurs alimentent l&apos;en-tête, le pied de page, le bandeau
          d&apos;accueil et les métadonnées de toutes les pages. Elles ne sont
          jamais codées en dur dans les composants : le site les lit en base à
          chaque affichage.
        </p>
      </header>

      <Card className="p-6">
        <FormulaireParametres valeurs={valeurs} />
      </Card>

      {/* Rappel de ce qui n'est PAS ici */}
      <Card className="bg-ccjp-creme p-4">
        <h2 className="text-sm font-bold text-ccjp-marine">
          Ce qui ne se règle pas ici
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-ccjp-marine/75">
          <li>
            Les secrets et clés d&apos;API (Supabase, revalidation) vivent dans
            les variables d&apos;environnement, jamais en base : une fuite de
            base ne doit pas compromettre l&apos;accès aux services.
          </li>
          <li>
            Les comptes administrateurs se gèrent dans la table{" "}
            <code className="rounded bg-white px-1">admins</code>, via le
            tableau de bord Supabase.
          </li>
          <li>
            Le nom de domaine et le certificat se configurent côté hébergeur
            (Vercel).
          </li>
        </ul>
      </Card>

      {/* État des clés connues, utile en diagnostic */}
      <Card className="p-4">
        <h2 className="text-sm font-bold text-ccjp-marine">
          État des {CHAMPS_PARAMETRES.length} paramètres connus
        </h2>
        <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          {CHAMPS_PARAMETRES.map((c) => {
            const present = (valeurs[c.cle] ?? "").length > 0;
            return (
              <li key={c.cle} className="flex items-center gap-2">
                <span
                  className={
                    present
                      ? "inline-block h-2 w-2 flex-none rounded-full bg-ccjp-vert"
                      : "inline-block h-2 w-2 flex-none rounded-full bg-ccjp-or"
                  }
                  aria-hidden="true"
                />
                <code className="text-ccjp-marine/70">{c.cle}</code>
                <span className="text-ccjp-marine/50">
                  {present ? "renseigné" : "vide"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireMembre, type ValeursInitiales } from "../FormulaireMembre";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Modification d'un membre du bureau (§10.2, P4.6)
 */

export const metadata: Metadata = {
  title: "Modifier un membre",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModifierMembrePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(`/auth/login?next=/admin/membres/${params.id}`);
  }

  const { data: membre } = await supabase
    .from("membres_bureau")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!membre) notFound();

  const commissions = await getCommissions();

  const valeurs: ValeursInitiales = {
    id: membre.id,
    prenom: membre.prenom,
    nom: membre.nom,
    poste: membre.poste,
    commission_id: membre.commission_id ?? "",
    biographie: membre.biographie ?? "",
    photo_url: membre.photo_url ?? "",
    email: membre.email ?? "",
    telephone: membre.telephone ?? "",
    ordre: membre.ordre,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/membres"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ccjp-marine/70 transition-colors hover:text-ccjp-vert"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au bureau exécutif
        </Link>
        <Badge ton="marine">{membre.poste}</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Modifier {membre.prenom} {membre.nom}
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Position d&apos;affichage actuelle : {membre.ordre + 1}.
          {" · "}
          <Link
            href="/bureau-executif"
            className="font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
          >
            voir sur le site
          </Link>
        </p>
      </div>

      <Card className="p-6">
        <FormulaireMembre commissions={commissions} valeurs={valeurs} />
      </Card>
    </div>
  );
}

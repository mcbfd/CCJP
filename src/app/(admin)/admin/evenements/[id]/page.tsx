import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireEvenement, type ValeursInitiales } from "../FormulaireEvenement";
import { LIBELLES_STATUT_EVENEMENT } from "../constantes";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Modification d'un événement (§10.2, P4.5)
 */

export const metadata: Metadata = {
  title: "Modifier un événement",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModifierEvenementPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(`/auth/login?next=/admin/evenements/${params.id}`);
  }

  const { data: evenement } = await supabase
    .from("evenements")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!evenement) notFound();

  const valeurs: ValeursInitiales = {
    id: evenement.id,
    titre: evenement.titre,
    slug: evenement.slug,
    description: evenement.description ?? "",
    lieu: evenement.lieu ?? "",
    date_debut: evenement.date_debut,
    date_fin: evenement.date_fin ?? "",
    type_evenement: evenement.type_evenement ?? "",
    lien_inscription: evenement.lien_inscription ?? "",
    image_url: evenement.image_url ?? "",
    statut: evenement.statut,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/evenements"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ccjp-marine/70 transition-colors hover:text-ccjp-vert"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux événements
        </Link>
        <Badge ton={evenement.statut === "a_venir" ? "vert" : "neutre"}>
          {LIBELLES_STATUT_EVENEMENT[evenement.statut]}
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Modifier l&apos;événement
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          {evenement.titre}
          {" · "}
          <Link
            href={`/evenements/${evenement.id}`}
            className="font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
          >
            voir sur le site
          </Link>
        </p>
      </div>

      <Card className="p-6">
        <FormulaireEvenement valeurs={valeurs} />
      </Card>
    </div>
  );
}

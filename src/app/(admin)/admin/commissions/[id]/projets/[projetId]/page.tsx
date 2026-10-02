import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireProjet, type ValeursInitiales } from "@/app/(admin)/admin/commissions/FormulaireProjet";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Modification d'un projet phare (§10.2, P4.7)
 */

export const metadata: Metadata = {
  title: "Modifier un projet phare",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModifierProjetPage({
  params,
}: {
  params: { id: string; projetId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(
      `/auth/login?next=/admin/commissions/${params.id}/projets/${params.projetId}`,
    );
  }

  // Lecture via RLS : un administrateur habilité lit les projets phars.
  const { data: projet } = await supabase
    .from("projets_phares")
    .select("*")
    .eq("id", params.projetId)
    .maybeSingle();

  if (!projet) notFound();

  const commissions = await getCommissions();

  const valeurs: ValeursInitiales = {
    id: projet.id,
    commission_id: projet.commission_id,
    titre: projet.titre,
    description: projet.description ?? "",
    annee: projet.annee ? String(projet.annee) : "",
    statut: projet.statut,
    ordre: projet.ordre,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/commissions"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ccjp-marine/70 transition-colors hover:text-ccjp-vert"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux commissions
        </Link>
        <Badge ton="marine">Projet phare</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Modifier le projet
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">{projet.titre}</p>
      </div>

      <Card className="p-6">
        <FormulaireProjet commissions={commissions} valeurs={valeurs} />
      </Card>
    </div>
  );
}

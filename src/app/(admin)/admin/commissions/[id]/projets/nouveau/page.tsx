import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireProjet } from "@/app/(admin)/admin/commissions/FormulaireProjet";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Ajout d'un projet phare à une commission (§10.2, P4.7)
 *
 * La commission est imposée par l'URL : on ne propose pas de la changer ici,
 * ce qui évite l'erreur classique « j'ai créé le projet dans la mauvaise
 * commission ».
 */

export const metadata: Metadata = {
  title: "Nouveau projet phare",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NouveauProjetPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(`/auth/login?next=/admin/commissions/${params.id}/projets/nouveau`);
  }

  // Lecture via RLS : confirme au passage que la commission existe.
  const { data: commission } = await supabase
    .from("commissions")
    .select("id, numero, nom")
    .eq("id", params.id)
    .maybeSingle();

  if (!commission) notFound();

  const commissions = await getCommissions();

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
        <Badge ton="or">Nouveau projet</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Ajouter un projet phare
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Ce projet sera rattaché à la commission{" "}
          <strong>
            {String(commission.numero).padStart(2, "0")}. {commission.nom}
          </strong>
          .
        </p>
      </div>

      <Card className="p-6">
        <FormulaireProjet
          commissions={commissions}
          commissionParDefaut={commission.id}
        />
      </Card>
    </div>
  );
}

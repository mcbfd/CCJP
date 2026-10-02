import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireCommission, type ValeursInitiales } from "../FormulaireCommission";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Modification d'une commission (§10.2, P4.7)
 */

export const metadata: Metadata = {
  title: "Modifier une commission",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModifierCommissionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(`/auth/login?next=/admin/commissions/${params.id}`);
  }

  const { data: commission } = await supabase
    .from("commissions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!commission) notFound();

  const valeurs: ValeursInitiales = {
    id: commission.id,
    numero: commission.numero,
    nom: commission.nom,
    slug: commission.slug,
    description: commission.description ?? "",
    vision: commission.vision ?? "",
    axes_strategiques: (commission.axes_strategiques ?? []).join("\n"),
    couleur: commission.couleur,
    icone: commission.icone ?? "",
    ordre: commission.ordre,
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
        <Badge ton="marine">
          Commission {String(commission.numero).padStart(2, "0")}
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Modifier la commission
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          {commission.nom} · <code className="text-xs">/{commission.slug}</code>
        </p>
      </div>

      {/* Avertissement sur le slug : changer un slug publiquement référencé
          casse les liens déjà diffusés. */}
      <Card className="border-ccjp-or/40 bg-ccjp-or/5 p-4">
        <h2 className="text-sm font-bold text-ccjp-marine">
          Attention au changement d&apos;adresse web
        </h2>
        <p className="mt-1 text-xs text-ccjp-marine/75">
          La page publique de cette commission est accessible à{" "}
          <Link
            href={`/commissions/${commission.slug}`}
            className="font-semibold text-ccjp-vert underline"
          >
            /commissions/{commission.slug}
          </Link>
          . Modifier le slug rendra cette adresse invalide : les liens déjà
          partagés, les favoris et les résultats de moteurs de recherche
          pointeraient vers une erreur 404. Ne le changez qu&apos;en cas de
          nécessité réelle.
        </p>
      </Card>

      <Card className="p-6">
        <FormulaireCommission valeurs={valeurs} />
      </Card>
    </div>
  );
}

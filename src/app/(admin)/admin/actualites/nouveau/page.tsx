import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireActualite } from "../FormulaireActualite";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Création d'une actualité (§10.2, P4.4)
 */

export const metadata: Metadata = {
  title: "Nouvelle actualité",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NouvelleActualitePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect("/auth/login?next=/admin/actualites/nouveau");
  }

  const commissions = await getCommissions();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/actualites"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ccjp-marine/70 transition-colors hover:text-ccjp-vert"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux actualités
        </Link>
        <Badge ton="or">Nouveau</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Créer une actualité
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Un article enregistré en brouillon reste invisible du public. Passez
          le statut à « Publié » pour le rendre accessible.
        </p>
      </div>

      <Card className="p-6">
        <FormulaireActualite commissions={commissions} />
      </Card>
    </div>
  );
}

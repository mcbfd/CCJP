import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireMembre } from "../FormulaireMembre";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Création d'un membre du bureau (§10.2, P4.6)
 */

export const metadata: Metadata = {
  title: "Nouveau membre",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NouveauMembrePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect("/auth/login?next=/admin/membres/nouveau");
  }

  const commissions = await getCommissions();

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
        <Badge ton="or">Nouveau</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Ajouter un membre
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Seuls le prénom, le nom et le poste sont obligatoires. Le membre
          apparaît aussitôt sur la page publique du bureau exécutif.
        </p>
      </div>

      <Card className="p-6">
        <FormulaireMembre commissions={commissions} />
      </Card>
    </div>
  );
}

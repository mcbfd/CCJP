import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { FormulaireEvenement } from "../FormulaireEvenement";

/**
 * Création d'un événement (§10.2, P4.5)
 */

export const metadata: Metadata = {
  title: "Nouvel événement",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NouvelEvenementPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect("/auth/login?next=/admin/evenements/nouveau");
  }

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
        <Badge ton="or">Nouveau</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Créer un événement
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          Seule la date et l&apos;heure de début sont obligatoires. Un événement
          « À venir » apparaît immédiatement sur le site public et dans le flux
          d&apos;abonnement au calendrier.
        </p>
      </div>

      <Card className="p-6">
        <FormulaireEvenement />
      </Card>
    </div>
  );
}

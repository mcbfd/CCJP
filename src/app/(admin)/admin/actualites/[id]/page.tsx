import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FormulaireActualite } from "../FormulaireActualite";
import { getCommissions } from "@/lib/data/commissions";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Modification d'une actualité (§10.2, P4.4)
 */

export const metadata: Metadata = {
  title: "Modifier une actualité",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ModifierActualitePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) {
    redirect(`/auth/login?next=/admin/actualites/${params.id}`);
  }

  // Lecture via RLS : un administrateur habilité voit aussi les brouillons.
  const { data: article } = await supabase
    .from("actualites")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!article) notFound();

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
        <Badge ton={article.statut === "publie" ? "vert" : "neutre"}>
          {article.statut === "publie" ? "Publié" : "Brouillon"}
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Modifier l&apos;article
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          {article.titre}
          {" · "}
          <Link
            href={`/actualites/${article.slug}`}
            className="font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
          >
            voir sur le site
          </Link>
        </p>
      </div>

      <Card className="p-6">
        <FormulaireActualite
          commissions={commissions}
          valeurs={{
            id: article.id,
            titre: article.titre,
            slug: article.slug,
            extrait: article.extrait ?? "",
            contenu: article.contenu ?? "",
            image_url: article.image_url ?? "",
            commission_id: article.commission_id ?? "",
            statut: article.statut,
            epingle: article.epingle,
            tags: (article.tags ?? []).join(", "),
            // `datetime-local` attend un format local ; on convertit.
            date_publication: article.date_publication
              ? new Date(article.date_publication).toISOString().slice(0, 10)
              : "",
          }}
        />
      </Card>
    </div>
  );
}

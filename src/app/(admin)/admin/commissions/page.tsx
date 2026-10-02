import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, FolderPlus, Pencil, Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { actionBasculerProjet, actionSupprimerProjet } from "./actions";
import { LIBELLES_STATUT_PROJET } from "./constantes";

/**
 * Module Commissions — les 14 du CDC et leurs projets phars (§10.2, P4.7)
 *
 * La liste est ordonnée par `numero` : c'est l'ordre officiel du cahier des
 * charges. Chaque carte affiche la commission, ses axes stratégiques et ses
 * projets phars, ce qui donne une vue d'ensemble en une seule page.
 */

export const dynamic = "force-dynamic";

export default async function AdminCommissionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/commissions");

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, projets_phares(*)")
    .order("numero", { ascending: true });

  const liste = commissions ?? [];
  const totalProjets = liste.reduce(
    (somme, c) => somme + (c.projets_phares?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Commissions</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Les 14 commissions
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {liste.length} commission{liste.length > 1 ? "s" : ""} et{" "}
            {totalProjets} projet{totalProjets > 1 ? "s" : ""} phare
            {totalProjets > 1 ? "s" : ""}. L&apos;ordre est celui du cahier des
            charges.
          </p>
        </div>
      </header>

      {liste.length > 0 ? (
        <ul className="space-y-4">
          {liste.map((c) => (
            <li key={c.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Pastille de couleur de la commission */}
                  <span
                    className="mt-1 h-10 w-10 flex-none rounded-lg"
                    style={{ backgroundColor: c.couleur }}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ccjp-marine/50">
                        {String(c.numero).padStart(2, "0")}
                      </span>
                      <Link
                        href={`/admin/commissions/${c.id}`}
                        className="font-display text-lg font-bold text-ccjp-marine hover:text-ccjp-vert"
                      >
                        {c.nom}
                      </Link>
                      <Badge ton="neutre">/{c.slug}</Badge>
                      <Link
                        href={`/commissions/${c.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        voir sur le site
                      </Link>
                    </div>

                    {c.description && (
                      <p className="mt-1.5 text-sm text-ccjp-marine/75">
                        {c.description}
                      </p>
                    )}

                    {c.axes_strategiques.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {c.axes_strategiques.map((axe, i) => (
                          <li
                            key={`${axe}-${i}`}
                            className="rounded-full bg-ccjp-creme px-2.5 py-0.5 text-xs text-ccjp-marine/80"
                          >
                            {axe}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Projets phars */}
                    <div className="mt-4 border-t border-ccjp-marine/10 pt-3">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-ccjp-marine/50">
                        Projets phars ({(c.projets_phares ?? []).length})
                      </h3>
                      {(c.projets_phares ?? []).length > 0 ? (
                        <ul className="mt-2 space-y-1.5">
                          {[...(c.projets_phares ?? [])]
                            .sort((a, b) => a.ordre - b.ordre)
                            .map((p) => (
                              <li
                                key={p.id}
                                className="flex flex-wrap items-center gap-2 rounded-lg bg-ccjp-beige px-3 py-2"
                              >
                                <span className="text-sm font-semibold text-ccjp-marine">
                                  {p.titre}
                                </span>
                                {p.annee && (
                                  <span className="text-xs text-ccjp-marine/60">
                                    {p.annee}
                                  </span>
                                )}
                                <Badge
                                  ton={
                                    p.statut === "realise"
                                      ? "vert"
                                      : p.statut === "en_cours"
                                        ? "or"
                                        : "neutre"
                                  }
                                >
                                  {LIBELLES_STATUT_PROJET[p.statut]}
                                </Badge>

                                <span className="ml-auto flex items-center gap-1">
                                  <form action={actionBasculerProjet}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <Button
                                      type="submit"
                                      variante="fantome"
                                      taille="sm"
                                      aria-label={
                                        p.statut === "en_cours"
                                          ? `Replanifier ${p.titre}`
                                          : `Démarrer ${p.titre}`
                                      }
                                    >
                                      {p.statut === "en_cours" ? (
                                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                      ) : (
                                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                                      )}
                                    </Button>
                                  </form>

                                  <BoutonSuppression
                                    action={actionSupprimerProjet}
                                    id={p.id}
                                    confirmation={`Supprimer le projet « ${p.titre} » ? Cette action est irréversible.`}
                                    libelle={`Supprimer le projet ${p.titre}`}
                                  />
                                </span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs italic text-ccjp-marine/50">
                          Aucun projet phare enregistré pour cette commission.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-none flex-col gap-2">
                    <ButtonLink
                      href={`/admin/commissions/${c.id}`}
                      variante="secondaire"
                      taille="sm"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Modifier
                    </ButtonLink>
                    <ButtonLink
                      href={`/admin/commissions/${c.id}/projets/nouveau`}
                      variante="fantome"
                      taille="sm"
                    >
                      <FolderPlus className="h-4 w-4" aria-hidden="true" />
                      Ajouter un projet
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            Aucune commission enregistrée.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Les 14 commissions du cahier des charges sont normalement créées par
            la migration 0001. Vérifiez que la base a bien été initialisée.
          </p>
        </Card>
      )}

      {/* Rappel des statuts disponibles */}
      <Card className="bg-ccjp-creme p-4">
        <h2 className="text-sm font-bold text-ccjp-marine">
          Cycle de vie d&apos;un projet
        </h2>
        <p className="mt-1 text-xs text-ccjp-marine/70">
          Un projet passe de « {LIBELLES_STATUT_PROJET.planifie} » à «{" "}
          {LIBELLES_STATUT_PROJET.en_cours} » via le bouton lecture, puis à «{" "}
          {LIBELLES_STATUT_PROJET.realise} » depuis la fiche du projet. Les trois
          statuts sont définis par la base.
        </p>
      </Card>
    </div>
  );
}

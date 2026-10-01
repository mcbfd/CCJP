import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil, Trash2, Pin, PinOff, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { formatDateCourteFr } from "@/lib/utils";
import {
  actionEpingler,
  actionPublier,
  actionSupprimer,
} from "./actions";

/**
 * Module Actualités — liste (PLAN §10.2, P4.4)
 *
 * Double contrôle d'accès : le middleware filtre `/admin`, et cette page
 * revérifie la session + l'habilitation. Une page serveur est un point
 * d'entrée comme un autre.
 */

export const dynamic = "force-dynamic";

const PAR_PAGE = 20;

export default async function AdminActualitesPage({
  searchParams,
}: {
  searchParams: { page?: string; statut?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin())) redirect("/auth/login?next=/admin/actualites");

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const depuis = (page - 1) * PAR_PAGE;

  let requete = supabase
    .from("actualites")
    .select("*, commissions(nom, slug)", { count: "exact" })
    .order("epingle", { ascending: false })
    .order("created_at", { ascending: false })
    .range(depuis, depuis + PAR_PAGE - 1);

  if (searchParams.statut === "publie" || searchParams.statut === "brouillon") {
    requete = requete.eq("statut", searchParams.statut);
  }

  const { data: actualites, count } = await requete;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));

  const filtres = [
    { label: "Toutes", valeur: "", nb: total },
    { label: "Publiées", valeur: "publie", nb: null },
    { label: "Brouillons", valeur: "brouillon", nb: null },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Actualités</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Gestion des actualités
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {total} article{total > 1 ? "s" : ""} au total. Un article publié
            apparaît immédiatement sur le site public.
          </p>
        </div>
        <ButtonLink href="/admin/actualites/nouveau" variante="primaire">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle actualité
        </ButtonLink>
      </header>

      {/* Filtres par statut */}
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        {filtres.map((f) => {
          const actif = (searchParams.statut ?? "") === f.valeur;
          return (
            <Link
              key={f.valeur || "toutes"}
              href={
                f.valeur
                  ? `/admin/actualites?statut=${f.valeur}`
                  : "/admin/actualites"
              }
              aria-current={actif ? "page" : undefined}
              className={
                actif
                  ? "rounded-full bg-ccjp-marine px-4 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-ccjp-marine/20 px-4 py-1.5 text-sm font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {actualites && actualites.length > 0 ? (
        <ul className="space-y-3">
          {actualites.map((a) => (
            <li key={a.id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/actualites/${a.id}`}
                      className="font-display text-base font-bold text-ccjp-marine hover:text-ccjp-vert"
                    >
                      {a.titre}
                    </Link>
                    <Badge ton={a.statut === "publie" ? "vert" : "neutre"}>
                      {a.statut === "publie" ? "Publié" : "Brouillon"}
                    </Badge>
                    {a.epingle && <Badge ton="or">Épinglé</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-ccjp-marine/60">
                    /{a.slug}
                    {a.commissions ? ` · ${a.commissions.nom}` : ""}
                    {` · créé le ${formatDateCourteFr(a.created_at)}`}
                    {a.date_publication
                      ? ` · publié le ${formatDateCourteFr(a.date_publication)}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={actionPublier}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variante="fantome" taille="sm">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      {a.statut === "publie" ? "Dépublier" : "Publier"}
                    </Button>
                  </form>

                  <form action={actionEpingler}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button
                      type="submit"
                      variante="fantome"
                      taille="sm"
                      aria-label={
                        a.epingle ? "Retirer l'épingle" : "Épingler l'article"
                      }
                    >
                      {a.epingle ? (
                        <PinOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Pin className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </form>

                  <ButtonLink
                    href={`/admin/actualites/${a.id}`}
                    variante="secondaire"
                    taille="sm"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Modifier
                  </ButtonLink>

                  <form
                    action={actionSupprimer}
                    onSubmit={(e) => {
                      if (
                        !confirm(
                          "Supprimer définitivement cet article ? Cette action est irréversible.",
                        )
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variante="fantome" taille="sm">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            Aucun article pour le moment.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Commencez par créer votre première actualité.
          </p>
          <div className="mt-5">
            <ButtonLink href="/admin/actualites/nouveau" variante="primaire">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouvelle actualité
            </ButtonLink>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
          <p className="text-sm text-ccjp-marine/70">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <ButtonLink
                href={`/admin/actualites?page=${page - 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
                variante="fantome"
                taille="sm"
              >
                Précédent
              </ButtonLink>
            )}
            {page < totalPages && (
              <ButtonLink
                href={`/admin/actualites?page=${page + 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
                variante="fantome"
                taille="sm"
              >
                Suivant
              </ButtonLink>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

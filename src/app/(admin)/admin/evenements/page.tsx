import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { formatDateCourteFr, formatDateTimeFr } from "@/lib/utils";
import { actionSupprimer, actionTerminer } from "./actions";
import {
  LIBELLES_STATUT_EVENEMENT,
  STATUTS_EVENEMENT,
} from "./constantes";

/**
 * Module Événements — liste (PLAN §10.2, P4.5)
 *
 * Même double contrôle d'accès que les Actualités : le middleware filtre
 * `/admin`, et cette page revérifie la session et l'habilitation.
 *
 * Le tri par défaut est chronologique ascendant : l'événement le plus proche
 * remonte en haut de la liste, ce qui correspond au besoin de l'équipe.
 */

export const dynamic = "force-dynamic";

const PAR_PAGE = 20;

export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: { page?: string; statut?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/evenements");

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const depuis = (page - 1) * PAR_PAGE;

  let requete = supabase
    .from("evenements")
    .select("*", { count: "exact" })
    .order("date_debut", { ascending: true })
    .range(depuis, depuis + PAR_PAGE - 1);

  const statutFiltre = STATUTS_EVENEMENT.find(
    (s) => s === searchParams.statut,
  );
  if (statutFiltre) {
    requete = requete.eq("statut", statutFiltre);
  }

  const { data: evenements, count } = await requete;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));

  const maintenant = new Date().toISOString();

  const filtres = [
    { label: "Tous", valeur: "", nb: total },
    ...STATUTS_EVENEMENT.map((s) => ({
      label: LIBELLES_STATUT_EVENEMENT[s],
      valeur: s,
      nb: null,
    })),
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Événements</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Gestion des événements
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {total} événement{total > 1 ? "s" : ""} au total. La liste est triée
            par date, du plus proche au plus lointain.
          </p>
        </div>
        <ButtonLink href="/admin/evenements/nouveau" variante="primaire">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvel événement
        </ButtonLink>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        {filtres.map((f) => {
          const actif = (searchParams.statut ?? "") === f.valeur;
          return (
            <Link
              key={f.valeur || "tous"}
              href={
                f.valeur ? `/admin/evenements?statut=${f.valeur}` : "/admin/evenements"
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

      {evenements && evenements.length > 0 ? (
        <ul className="space-y-3">
          {evenements.map((ev) => (
            <li key={ev.id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/evenements/${ev.id}`}
                      className="font-display text-base font-bold text-ccjp-marine hover:text-ccjp-vert"
                    >
                      {ev.titre}
                    </Link>
                    <Badge
                      ton={
                        ev.statut === "a_venir"
                          ? "vert"
                          : ev.statut === "termine"
                            ? "neutre"
                            : "rouge"
                      }
                    >
                      {LIBELLES_STATUT_EVENEMENT[ev.statut]}
                    </Badge>
                    {ev.statut === "a_venir" && ev.date_debut < maintenant && (
                      <Badge ton="or">À clôturer</Badge>
                    )}
                  </div>

                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ccjp-marine/60">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDateTimeFr(ev.date_debut)}
                    </span>
                    {ev.lieu && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {ev.lieu}
                      </span>
                    )}
                    {ev.type_evenement && <span>· {ev.type_evenement}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-ccjp-marine/50">
                    /{ev.slug} · créé le {formatDateCourteFr(ev.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={actionTerminer}>
                    <input type="hidden" name="id" value={ev.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ccjp-marine transition-colors hover:bg-ccjp-creme hover:text-ccjp-vert"
                    >
                      {ev.statut === "a_venir" ? "Marquer terminé" : "Réouvrir"}
                    </button>
                  </form>

                  <ButtonLink
                    href={`/admin/evenements/${ev.id}`}
                    variante="secondaire"
                    taille="sm"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Modifier
                  </ButtonLink>

                  <BoutonSuppression
                    action={actionSupprimer}
                    id={ev.id}
                    confirmation="Supprimer définitivement cet événement ? Cette action est irréversible."
                    libelle="Supprimer l'événement"
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            Aucun événement pour le moment.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Commencez par créer votre premier événement.
          </p>
          <div className="mt-5">
            <ButtonLink href="/admin/evenements/nouveau" variante="primaire">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouvel événement
            </ButtonLink>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between gap-4"
          aria-label="Pagination"
        >
          <p className="text-sm text-ccjp-marine/70">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <ButtonLink
                href={`/admin/evenements?page=${page - 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
                variante="fantome"
                taille="sm"
              >
                Précédent
              </ButtonLink>
            )}
            {page < totalPages && (
              <ButtonLink
                href={`/admin/evenements?page=${page + 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
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

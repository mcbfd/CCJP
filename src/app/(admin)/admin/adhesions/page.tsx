import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock, Download, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { formatDateCourteFr } from "@/lib/utils";
import {
  actionAccepter,
  actionRefuser,
  actionRemettreEnAttente,
  actionSupprimer,
} from "./actions";
import { LIBELLES_STATUT_ADHESION, STATUTS_ADHESION } from "./constantes";

/**
 * Module Adhésions — liste des demandes (PLAN §10.2, P4.8)
 *
 * Les demandes en attente remontent en tête : c'est le travail à faire. Le
 * lien d'export CSV est présent en permanence, car il sert aussi bien à
 * traiter le stock courant qu'à archiver une saison.
 */

export const dynamic = "force-dynamic";

const PAR_PAGE = 20;

export default async function AdminAdhesionsPage({
  searchParams,
}: {
  searchParams: { page?: string; statut?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/adhesions");

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const depuis = (page - 1) * PAR_PAGE;

  let requete = supabase
    .from("adhesions")
    .select("*, commissions(nom)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(depuis, depuis + PAR_PAGE - 1);

  const statutFiltre = STATUTS_ADHESION.find((s) => s === searchParams.statut);
  if (statutFiltre) requete = requete.eq("statut", statutFiltre);

  const { data: adhesions, count } = await requete;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));

  const filtres = [
    { label: "Toutes", valeur: "", nb: total },
    ...STATUTS_ADHESION.map((s) => ({
      label: LIBELLES_STATUT_ADHESION[s],
      valeur: s,
      nb: null,
    })),
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Adhésions</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Demandes d&apos;adhésion
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {total} demande{total > 1 ? "s" : ""} au total. Les demandes en
            attente apparaissent en premier.
          </p>
        </div>
        <ButtonLink href="/api/admin/adhesions/export" variante="secondaire">
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter en CSV
        </ButtonLink>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par statut">
        {filtres.map((f) => {
          const actif = (searchParams.statut ?? "") === f.valeur;
          return (
            <Link
              key={f.valeur || "toutes"}
              href={f.valeur ? `/admin/adhesions?statut=${f.valeur}` : "/admin/adhesions"}
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

      {adhesions && adhesions.length > 0 ? (
        <ul className="space-y-3">
          {adhesions.map((a) => (
            <li key={a.id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/adhesions/${a.id}`}
                      className="font-display text-base font-bold text-ccjp-marine hover:text-ccjp-vert"
                    >
                      {a.prenom} {a.nom}
                    </Link>
                    <Badge
                      ton={
                        a.statut === "accepte"
                          ? "vert"
                          : a.statut === "refuse"
                            ? "rouge"
                            : "or"
                      }
                    >
                      {LIBELLES_STATUT_ADHESION[a.statut]}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ccjp-marine/60">
                    <span>{a.email}</span>
                    {a.telephone && <span>· {a.telephone}</span>}
                    {a.commissions && <span>· {a.commissions.nom}</span>}
                    <span>· reçue le {formatDateCourteFr(a.created_at)}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {a.statut !== "accepte" && (
                    <form action={actionAccepter}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" variante="primaire" taille="sm">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Accepter
                      </Button>
                    </form>
                  )}

                  {a.statut !== "refuse" && (
                    <form action={actionRefuser}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" variante="fantome" taille="sm">
                        <X className="h-4 w-4" aria-hidden="true" />
                        Refuser
                      </Button>
                    </form>
                  )}

                  {a.statut !== "en_attente" && (
                    <form action={actionRemettreEnAttente}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" variante="fantome" taille="sm">
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Remettre en attente</span>
                      </Button>
                    </form>
                  )}

                  <BoutonSuppression
                    action={actionSupprimer}
                    id={a.id}
                    confirmation={`Supprimer définitivement la demande de ${a.prenom} ${a.nom} ? Cette action est irréversible.`}
                    libelle={`Supprimer la demande de ${a.prenom} ${a.nom}`}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            <Clock className="mr-2 inline h-5 w-5" aria-hidden="true" />
            Aucune demande à traiter.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Les demandes envoyées depuis le formulaire public /rejoindre
            apparaîtront ici.
          </p>
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
                href={`/admin/adhesions?page=${page - 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
                variante="fantome"
                taille="sm"
              >
                Précédent
              </ButtonLink>
            )}
            {page < totalPages && (
              <ButtonLink
                href={`/admin/adhesions?page=${page + 1}${searchParams.statut ? `&statut=${searchParams.statut}` : ""}`}
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

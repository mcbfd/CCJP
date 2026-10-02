import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUp, Mail, Pencil, Phone, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { actionMonter, actionSupprimer } from "./actions";

/**
 * Module Membres — bureau exécutif (PLAN §10.2, P4.6)
 *
 * Le tri suit `ordre` croissant : c'est exactement l'ordre d'affichage de la
 * page publique /bureau-executif. Le bouton « Monter » permute le membre avec
 * son voisin du dessus, ce qui donne un contrôle direct sur ce que voit le
 * public sans avoir à saisir des nombres à la main.
 */

export const dynamic = "force-dynamic";

export default async function AdminMembresPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/membres");

  const { data: membres, count } = await supabase
    .from("membres_bureau")
    .select("*, commissions(nom)", { count: "exact" })
    .order("ordre", { ascending: true })
    .order("nom", { ascending: true });

  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Membres</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Bureau exécutif
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {total} membre{total > 1 ? "s" : ""}. L&apos;ordre ci-dessous est
            celui de la page publique : le premier de la liste apparaît en haut
            du site.
          </p>
        </div>
        <ButtonLink href="/admin/membres/nouveau" variante="primaire">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouveau membre
        </ButtonLink>
      </header>

      {membres && membres.length > 0 ? (
        <ol className="space-y-3">
          {membres.map((m, index) => (
            <li key={m.id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ccjp-creme text-sm font-bold text-ccjp-marine"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/membres/${m.id}`}
                      className="font-display text-base font-bold text-ccjp-marine hover:text-ccjp-vert"
                    >
                      {m.prenom} {m.nom}
                    </Link>
                    <Badge ton="marine">{m.poste}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ccjp-marine/60">
                    {m.commissions && <span>· {m.commissions.nom}</span>}
                    {m.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        {m.email}
                      </span>
                    )}
                    {m.telephone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {m.telephone}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {index > 0 && (
                    <form action={actionMonter}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        aria-label={`Monter ${m.prenom} ${m.nom} d'un rang`}
                        className="rounded-lg p-1.5 text-ccjp-marine transition-colors hover:bg-ccjp-creme hover:text-ccjp-vert"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                  )}

                  <ButtonLink
                    href={`/admin/membres/${m.id}`}
                    variante="secondaire"
                    taille="sm"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Modifier
                  </ButtonLink>

                  <BoutonSuppression
                    action={actionSupprimer}
                    id={m.id}
                    confirmation={`Supprimer ${m.prenom} ${m.nom} du bureau exécutif ? Cette action est irréversible.`}
                    libelle={`Supprimer ${m.prenom} ${m.nom}`}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            Aucun membre enregistré.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Commencez par ajouter le Président, puis les autres membres du
            bureau.
          </p>
          <div className="mt-5">
            <ButtonLink href="/admin/membres/nouveau" variante="primaire">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouveau membre
            </ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}

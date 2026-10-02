import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Mail, MailOpen, MessageSquare, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { formatDateTimeFr } from "@/lib/utils";
import {
  actionMarquerLu,
  actionMarquerNonLu,
  actionSupprimer,
} from "./actions";

/**
 * Module Messages — messages de contact (PLAN §10.2, P4.9)
 *
 * Les non-lus remontent en tête et sont signalés visuellement : un message
 * oublié est une question de citoyen restée sans réponse. Le corps du message
 * est affiché directement dans la liste (tronqué), car la majorité des
 * messages sont courts et évitent ainsi un aller-retour.
 */

export const dynamic = "force-dynamic";

const PAR_PAGE = 20;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { page?: string; lu?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/messages");

  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const depuis = (page - 1) * PAR_PAGE;

  let requete = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("lu", { ascending: true }) // false (non lus) d'abord
    .order("created_at", { ascending: false })
    .range(depuis, depuis + PAR_PAGE - 1);

  // Filtre : seulement les non-lus, ou seulement les lus.
  if (searchParams.lu === "false" || searchParams.lu === "true") {
    requete = requete.eq("lu", searchParams.lu === "true");
  }

  const { data: messages, count } = await requete;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));

  const filtres = [
    { label: "Tous", valeur: "" },
    { label: "Non lus", valeur: "false" },
    { label: "Lus", valeur: "true" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge ton="or">Module Messages</Badge>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
            Messages de contact
          </h1>
          <p className="mt-2 text-ccjp-marine/75">
            {total} message{total > 1 ? "s" : ""}. Les messages non lus
            apparaissent en premier.
          </p>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par état de lecture">
        {filtres.map((f) => {
          const actif = (searchParams.lu ?? "") === f.valeur;
          return (
            <Link
              key={f.valeur || "tous"}
              href={f.valeur ? `/admin/messages?lu=${f.valeur}` : "/admin/messages"}
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

      {messages && messages.length > 0 ? (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <Card
                className={
                  m.lu
                    ? "flex flex-wrap items-start gap-4 p-4"
                    : "flex flex-wrap items-start gap-4 border-ccjp-or/50 bg-ccjp-or/5 p-4"
                }
              >
                <span
                  className={
                    m.lu
                      ? "mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ccjp-creme text-ccjp-marine/50"
                      : "mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ccjp-or/20 text-ccjp-or"
                  }
                  aria-hidden="true"
                >
                  {m.lu ? (
                    <MailOpen className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-bold text-ccjp-marine">
                      {m.sujet}
                    </h2>
                    {!m.lu && <Badge ton="or">Non lu</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-ccjp-marine/60">
                    {m.nom} · <span className="underline">{m.email}</span> ·{" "}
                    {formatDateTimeFr(m.created_at)}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-ccjp-marine/85">
                    {m.message.length > 280
                      ? `${m.message.slice(0, 280)}…`
                      : m.message}
                  </p>
                  {m.message.length > 280 && (
                    <p className="mt-1 text-xs italic text-ccjp-marine/50">
                      Message tronqué — voir la version complète dans le
                      tableau de bord.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Répondre : ouvre le client de messagerie de l'administrateur */}
                  <ButtonLink
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}`}
                    variante="secondaire"
                    taille="sm"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Répondre
                  </ButtonLink>

                  {m.lu ? (
                    <form action={actionMarquerNonLu}>
                      <input type="hidden" name="id" value={m.id} />
                      <Button type="submit" variante="fantome" taille="sm">
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Marquer comme non lu</span>
                      </Button>
                    </form>
                  ) : (
                    <form action={actionMarquerLu}>
                      <input type="hidden" name="id" value={m.id} />
                      <Button type="submit" variante="fantome" taille="sm">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Marquer comme lu</span>
                      </Button>
                    </form>
                  )}

                  <BoutonSuppression
                    action={actionSupprimer}
                    id={m.id}
                    confirmation={`Supprimer définitivement le message de ${m.nom} ? Cette action est irréversible.`}
                    libelle={`Supprimer le message de ${m.nom}`}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            Aucun message pour le moment.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Les messages envoyés depuis le formulaire public /contact
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
                href={`/admin/messages?page=${page - 1}${searchParams.lu ? `&lu=${searchParams.lu}` : ""}`}
                variante="fantome"
                taille="sm"
              >
                Précédent
              </ButtonLink>
            )}
            {page < totalPages && (
              <ButtonLink
                href={`/admin/messages?page=${page + 1}${searchParams.lu ? `&lu=${searchParams.lu}` : ""}`}
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

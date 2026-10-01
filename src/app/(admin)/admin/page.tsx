import Link from "next/link";
import {
  Newspaper,
  CalendarDays,
  ClipboardList,
  Mail,
  Plus,
  ArrowRight,
  FileEdit,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { MODULES_ADMIN } from "@/lib/modules-admin";
import { formatDateCourteFr } from "@/lib/utils";
import {
  getAdhesionsRecentesAdmin,
  getDernieresActualitesAdmin,
  getDerniersMessagesAdmin,
  getStatistiquesAdmin,
} from "@/lib/data/admin";

/**
 * Tableau de bord (§10.1, P4.3)
 *
 * Quatre blocs conformes au cahier des charges :
 *   - compteurs (actualités publiées, événements à venir, adhésions en
 *     attente, messages non lus) ;
 *   - actions rapides ;
 *   - 5 dernières actualités avec leur statut ;
 *   - 5 derniers messages de contact.
 *
 * Les lectures passent par la RLS : un administrateur habilité voit tout, un
 * intrus ne voit rien. La page n'est de toute façon atteignable qu'après le
 * double contrôle du middleware et du layout.
 */

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, actualites, messages, adhesions] = await Promise.all([
    getStatistiquesAdmin(),
    getDernieresActualitesAdmin(5),
    getDerniersMessagesAdmin(5),
    getAdhesionsRecentesAdmin(5),
  ]);

  const compteurs = [
    {
      libelle: "Actualités publiées",
      valeur: stats.actualitesPubliees,
      detail: `${stats.actualitesBrouillons} brouillon${stats.actualitesBrouillons > 1 ? "s" : ""}`,
      icone: <Newspaper className="h-5 w-5" aria-hidden="true" />,
      lien: "/admin/actualites",
      ton: "vert" as const,
    },
    {
      libelle: "Événements à venir",
      valeur: stats.evenementsAVenir,
      detail: "Calendrier public",
      icone: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
      lien: "/admin/evenements",
      ton: "marine" as const,
    },
    {
      libelle: "Adhésions en attente",
      valeur: stats.adhesionsEnAttente,
      detail: "À traiter",
      icone: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
      lien: "/admin/adhesions",
      ton: "or" as const,
    },
    {
      libelle: "Messages non lus",
      valeur: stats.messagesNonLus,
      detail: "Boîte de contact",
      icone: <Mail className="h-5 w-5" aria-hidden="true" />,
      lien: "/admin/messages",
      ton: "vert" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <Badge ton="or">Tableau de bord</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Vue d&apos;ensemble
        </h1>
        <p className="mt-2 max-w-2xl text-ccjp-marine/75">
          État du contenu du site en un coup d&apos;œil. Les chiffres
          proviennent directement de la base, via les politiques de sécurité.
        </p>
      </header>

      {/* Compteurs */}
      <section aria-labelledby="compteurs-titre">
        <h2 id="compteurs-titre" className="sr-only">
          Compteurs
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {compteurs.map((c) => (
            <li key={c.libelle}>
              <Link href={c.lien} className="block h-full">
                <Card interactive className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        c.ton === "vert"
                          ? "flex h-10 w-10 items-center justify-center rounded-full bg-ccjp-vert/10 text-ccjp-vert"
                          : c.ton === "or"
                            ? "flex h-10 w-10 items-center justify-center rounded-full bg-ccjp-or/15 text-ccjp-marine"
                            : "flex h-10 w-10 items-center justify-center rounded-full bg-ccjp-marine/10 text-ccjp-marine"
                      }
                    >
                      {c.icone}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-ccjp-marine/30"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-4 font-display text-3xl font-extrabold leading-none text-ccjp-marine">
                    {c.valeur}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-ccjp-marine/80">
                    {c.libelle}
                  </p>
                  <p className="mt-0.5 text-xs text-ccjp-marine/55">{c.detail}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions rapides */}
      <section aria-labelledby="actions-titre">
        <h2
          id="actions-titre"
          className="mb-3 font-display text-lg font-bold text-ccjp-marine"
        >
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/actualites" variante="primaire" taille="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle actualité
          </ButtonLink>
          <ButtonLink href="/admin/evenements" variante="secondaire" taille="sm">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvel événement
          </ButtonLink>
          <ButtonLink href="/admin/adhesions" variante="fantome" taille="sm">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Traiter les adhésions
          </ButtonLink>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Dernières actualités */}
        <section aria-labelledby="actu-titre">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="actu-titre"
              className="font-display text-lg font-bold text-ccjp-marine"
            >
              Dernières actualités
            </h2>
            <Link
              href="/admin/actualites"
              className="text-sm font-semibold text-ccjp-vert hover:underline"
            >
              Tout voir
            </Link>
          </div>

          {actualites.length === 0 ? (
            <Card className="p-6 text-center text-sm text-ccjp-marine/60">
              Aucune actualité pour le moment.
            </Card>
          ) : (
            <ul className="space-y-2">
              {actualites.map((a) => (
                <li key={a.id}>
                  <Card className="flex items-center gap-3 p-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ccjp-vert/10 text-ccjp-vert"
                    >
                      {a.statut === "publie" ? (
                        <Newspaper className="h-4 w-4" />
                      ) : (
                        <FileEdit className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/admin/actualites/${a.id}`}
                        className="block truncate text-sm font-semibold text-ccjp-marine hover:text-ccjp-vert"
                      >
                        {a.titre}
                      </Link>
                      <span className="text-xs text-ccjp-marine/55">
                        {formatDateCourteFr(a.created_at)}
                      </span>
                    </span>
                    <Badge ton={a.statut === "publie" ? "vert" : "neutre"}>
                      {a.statut === "publie" ? "Publié" : "Brouillon"}
                    </Badge>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Derniers messages */}
        <section aria-labelledby="msg-titre">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="msg-titre"
              className="font-display text-lg font-bold text-ccjp-marine"
            >
              Derniers messages
            </h2>
            <Link
              href="/admin/messages"
              className="text-sm font-semibold text-ccjp-vert hover:underline"
            >
              Tout voir
            </Link>
          </div>

          {messages.length === 0 ? (
            <Card className="p-6 text-center text-sm text-ccjp-marine/60">
              Aucun message reçu.
            </Card>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => (
                <li key={m.id}>
                  <Card className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ccjp-marine">
                          {m.nom}
                        </p>
                        <p className="truncate text-xs text-ccjp-marine/60">
                          {m.sujet}
                        </p>
                      </div>
                      {!m.lu && <Badge ton="or">Non lu</Badge>}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-ccjp-marine/70">
                      {m.message}
                    </p>
                    <p className="mt-1 text-[11px] text-ccjp-marine/45">
                      {formatDateCourteFr(m.created_at)}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Dernières adhésions */}
      {adhesions.length > 0 && (
        <section aria-labelledby="adh-titre">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="adh-titre"
              className="font-display text-lg font-bold text-ccjp-marine"
            >
              Dernières demandes d&apos;adhésion
            </h2>
            <Link
              href="/admin/adhesions"
              className="text-sm font-semibold text-ccjp-vert hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <ul className="space-y-2">
            {adhesions.slice(0, 3).map((a) => (
              <li key={a.id}>
                <Card className="flex items-center gap-3 p-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ccjp-marine/10 text-ccjp-marine"
                  >
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ccjp-marine">
                      {a.prenom} {a.nom}
                    </span>
                    <span className="text-xs text-ccjp-marine/55">
                      {a.email}
                      {a.quartier ? ` · ${a.quartier}` : ""}
                    </span>
                  </span>
                  <Badge
                    ton={
                      a.statut === "accepte"
                        ? "vert"
                        : a.statut === "refuse"
                          ? "rouge"
                          : "or"
                    }
                  >
                    {a.statut === "accepte"
                      ? "Acceptée"
                      : a.statut === "refuse"
                        ? "Refusée"
                        : "En attente"}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Rappel des modules */}
      <section aria-labelledby="modules-titre">
        <h2
          id="modules-titre"
          className="mb-4 font-display text-lg font-bold text-ccjp-marine"
        >
          Les {MODULES_ADMIN.length} modules
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES_ADMIN.map((m) => (
            <li key={m.href}>
              <Card interactive as="div" className="h-full">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ccjp-vert/10"
                  >
                    <m.Icone className="h-5 w-5 text-ccjp-vert" aria-hidden="true" />
                  </span>
                  <p className="font-display text-base font-bold text-ccjp-marine">
                    {m.libelle}
                  </p>
                </div>
                <p className="text-sm text-ccjp-marine/70">{m.description}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

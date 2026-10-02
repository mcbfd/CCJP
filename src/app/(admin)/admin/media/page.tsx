import { redirect } from "next/navigation";
import { FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BoutonSuppression } from "@/components/admin/BoutonSuppression";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";
import { formatDateCourteFr, formatTailleFichier } from "@/lib/utils";
import { actionSupprimer } from "./actions";
import { BUCKETS } from "./constantes";
import { DeposeMedia } from "./DeposeMedia";
import { CopieUrlBouton } from "./CopieUrlBouton";

/**
 * Module Médiathèque (§10.2, P4.10)
 *
 * La médiathèque a un rôle précis : donner à l'administrateur une adresse web
 * stable à coller dans le champ « Image (URL) » d'un article, d'un événement
 * ou d'un membre. Chaque carte affiche donc l'image, son nom, sa taille, et
 * un bouton qui copie l'adresse.
 */

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isCurrentUserAdmin()))
    redirect("/auth/login?next=/admin/media");

  const { data: medias } = await supabase
    .from("medias")
    .select("*")
    .order("created_at", { ascending: false });

  const liste = medias ?? [];

  return (
    <div className="space-y-6">
      <header>
        <Badge ton="or">Module Médiathèque</Badge>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ccjp-marine">
          Médiathèque
        </h1>
        <p className="mt-2 max-w-3xl text-ccjp-marine/75">
          Déposez ici les images et documents du site. Chaque fichier reçoit une
          adresse web que vous pouvez coller dans le champ « Image (URL) » ou
          « Lien d&apos;inscription » d&apos;un article, d&apos;un événement ou
          d&apos;un membre. Les fichiers déposés sont immédiatement accessibles
          au public.
        </p>
      </header>

      {/* Zone de dépôt */}
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-ccjp-marine">
          Déposer un fichier
        </h2>
        <p className="mt-1 text-sm text-ccjp-marine/70">
          Choisissez d&apos;abord la destination : elle détermine les formats et
          la taille acceptés.
        </p>
        <div className="mt-4">
          <DeposeMedia />
        </div>
      </Card>

      {/* Rappel des destinations */}
      <Card className="bg-ccjp-creme p-4">
        <h2 className="text-sm font-bold text-ccjp-marine">Destinations</h2>
        <ul className="mt-2 space-y-1 text-xs text-ccjp-marine/75">
          {BUCKETS.map((b) => (
            <li key={b.id}>
              <strong>{b.libelle}</strong> — {b.tailleMax / 1024 / 1024} Mo
              maximum.
            </li>
          ))}
        </ul>
      </Card>

      {/* Fichiers déposés */}
      {liste.length > 0 ? (
        <section>
          <h2 className="font-display text-lg font-bold text-ccjp-marine">
            {liste.length} fichier{liste.length > 1 ? "s" : ""} déposé
            {liste.length > 1 ? "s" : ""}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liste.map((m) => (
              <li key={m.id}>
                <Card className="flex h-full flex-col p-4">
                  {/* Aperçu */}
                  <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-ccjp-creme">
                    {m.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.nom}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <FileText
                        className="h-10 w-10 text-ccjp-marine/40"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="mt-3 flex-1">
                    <div className="flex items-start gap-2">
                      {m.type === "image" ? (
                        <ImageIcon
                          className="mt-0.5 h-4 w-4 flex-none text-ccjp-marine/50"
                          aria-hidden="true"
                        />
                      ) : (
                        <FileText
                          className="mt-0.5 h-4 w-4 flex-none text-ccjp-marine/50"
                          aria-hidden="true"
                        />
                      )}
                      <p
                        className="break-all text-sm font-semibold text-ccjp-marine"
                        title={m.nom}
                      >
                        {m.nom}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-ccjp-marine/60">
                      {m.taille ? formatTailleFichier(Number(m.taille)) : "taille inconnue"}
                      {" · "}
                      {formatDateCourteFr(m.created_at)}
                    </p>
                    <p className="mt-1.5 break-all rounded bg-ccjp-beige px-2 py-1 font-mono text-[10px] text-ccjp-marine/70">
                      {m.url}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <CopieUrlBouton url={m.url} />
                    <BoutonSuppression
                      action={actionSupprimer}
                      id={m.id}
                      confirmation={`Supprimer définitivement « ${m.nom} » ? Le fichier et son adresse disparaîtront : tout article qui l'utilise s'affichera avec une image manquante.`}
                      libelle={`Supprimer ${m.nom}`}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-lg font-semibold text-ccjp-marine">
            La médiathèque est vide.
          </p>
          <p className="mt-2 text-sm text-ccjp-marine/70">
            Déposez une image ci-dessus pour obtenir son adresse web.
          </p>
        </Card>
      )}
    </div>
  );
}


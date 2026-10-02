import { NextResponse } from "next/server";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Export CSV des demandes d'adhésion (PLAN §10.2, P4.8)
 *
 * ⚠️ Sécurité : cette route expose des DONNÉES PERSONNELLES (nom, e-mail,
 *    téléphone, motivation). Elle n'est pas protégée par le middleware, qui
 *    ne couvre que la navigation vers `/admin`. La vérification d'habilitation
 *    est donc faite ICI, explicitement, avant toute lecture.
 *
 * Le client privilégié (service_role) n'est PAS utilisé : la lecture passe par
 * le client serveur et la RLS, donc même si la vérification d'habilitation
 * était contournée un jour, la base resterait la garde finale.
 */

export const dynamic = "force-dynamic";

/**
 * Échappe une valeur pour un CSV conforme à la RFC 4180.
 *
 * Excel francophone attend le point-virgule comme séparateur et l'encodage
 * Windows-1252 : on produit donc du CSV séparé par `;` encodé en UTF-8 avec
 * BOM, ce que Excel moderne ouvre correctement quel que soit le séparateur
 * régional déclaré dans le système.
 */
function echapperCsv(valeur: unknown): string {
  if (valeur === null || valeur === undefined) return "";
  const texte = String(valeur);
  // Guillemets, séparateur ou retour à la ligne : on encadre de guillemets.
  if (/[";\r\n]/.test(texte)) {
    return `"${texte.replace(/"/g, '""')}"`;
  }
  return texte;
}

export async function GET() {
  // ---- Contrôle d'accès, avant toute lecture ----
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { erreur: "Authentification requise." },
      { status: 401 },
    );
  }

  // `isCurrentUserAdmin` relit la table `admins` protégée par RLS : impossible
  // de se déclarer administrateur depuis le client.
  //
  // 401 = pas de session ; 403 = session valide mais compte non habilité.
  // Les distinguer évite qu'un administrateur légitime croie sa session
  // expirée alors qu'il vient d'être retiré de la table `admins`.
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json(
      { erreur: "Accès réservé aux administrateurs." },
      { status: 403 },
    );
  }

  // ---- Lecture ----
  const { data: adhesions, error } = await supabase
    .from("adhesions")
    .select("*, commissions(nom)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/adhesions/export] lecture :", error.message);
    return NextResponse.json(
      { erreur: "Impossible de lire les demandes." },
      { status: 500 },
    );
  }

  // ---- Construction du CSV ----
  const entetes = [
    "Prénom",
    "Nom",
    "E-mail",
    "Téléphone",
    "Quartier",
    "Commission souhaitée",
    "Motivation",
    "Statut",
    "Date de la demande",
  ];

  const lignes = (adhesions ?? []).map((a) =>
    [
      a.prenom,
      a.nom,
      a.email,
      a.telephone,
      a.quartier,
      a.commissions?.nom ?? "",
      a.motivation,
      a.statut,
      a.created_at,
    ]
      .map(echapperCsv)
      .join(";"),
  );

  // BOM UTF-8 : sans lui, Excel affiche des caractères accentués cassés.
  const csv = "\uFEFF" + [entetes.join(";"), ...lignes].join("\r\n") + "\r\n";

  const horodatage = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="adhesions-${horodatage}.csv"`,
      // Ne jamais mettre en cache un export de données personnelles.
      "cache-control": "no-store, max-age=0",
    },
  });
}

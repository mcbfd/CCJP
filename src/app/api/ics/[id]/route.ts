import { getEvenementById } from "@/lib/data/evenements";

/**
 * Export `.ics` d'un événement (§9.2)
 *
 * Permet d'ajouter un événement à n'importe quel agenda (Google Calendar,
 * Outlook, téléphone). Le fichier est généré à la volée : pas de stockage.
 *
 * Format iCalendar RFC 5545. Les dates sont en UTC (`Z`) car le Sénégal est
 * à UTC+0 toute l'année — aucun décalage horaire à gérer.
 */

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const evenement = await getEvenementById(params.id);

  if (!evenement) {
    return new Response("Événement introuvable.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const debut = new Date(evenement.date_debut);
  const fin = evenement.date_fin
    ? new Date(evenement.date_fin)
    : new Date(debut.getTime() + 60 * 60 * 1000); // 1 h par défaut

  const formatUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Échappement iCalendar : antislash, point-virgule, virgule, saut de ligne.
  const echapper = (texte: string) =>
    texte
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");

  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CCJP Podor//Evenements//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${evenement.id}@ccjp-podor.sn`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(debut)}`,
    `DTEND:${formatUtc(fin)}`,
    `SUMMARY:${echapper(evenement.titre)}`,
    evenement.description
      ? `DESCRIPTION:${echapper(evenement.description)}`
      : null,
    evenement.lieu ? `LOCATION:${echapper(evenement.lieu)}` : null,
    evenement.lien_inscription
      ? `URL:${evenement.lien_inscription}`
      : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  const ics = lignes.join("\r\n");

  return new Response(ics, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="evenement-${evenement.slug}.ics"`,
      "cache-control": "public, max-age=300",
    },
  });
}

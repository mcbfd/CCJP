import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NOM_CCJP } from "@/lib/constants";
import "./globals.css";

/**
 * Layout racine — CCJP
 *
 * Les polices (Inter, Playfair Display) sont auto-hébergées via @fontsource
 * et importées dans globals.css. Aucune requête vers un CDN externe n'est
 * faite au moment du build.
 * (PLAN_IMPLEMENTATION.md §13.1)
 */

export const metadata: Metadata = {
  title: {
    default: `${NOM_CCJP} — CCJP`,
    template: `%s | CCJP Podor`,
  },
  description:
    "Plateforme officielle du Conseil Consultatif des Jeunes de Podor. " +
    "Écoute · Participation · Impact. Découvrez les 14 commissions, les " +
    "actualités, les événements et rejoignez le CCJP.",
  keywords: [
    "CCJP",
    "Conseil Consultatif des Jeunes de Podor",
    "jeunesse Podor",
    "Sénégal",
    "Saint-Louis",
    "commissions",
    "participation citoyenne",
  ],
  authors: [{ name: NOM_CCJP }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CCJP Podor",
    title: `${NOM_CCJP} — CCJP`,
    description: "La voix de la jeunesse podoroise. Écoute · Participation · Impact.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        {/* Lien d'évitement pour la navigation au clavier (WCAG 2.1 AA) */}
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>

        {children}

        {/* Notifications (toasts) — messages en français */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

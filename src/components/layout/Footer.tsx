import Link from "next/link";
import { Facebook, Instagram, Music2, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { COMMISSIONS, DEVISE_CCJP, NOM_CCJP } from "@/lib/constants";

/**
 * Footer — pied de page public (PLAN_IMPLEMENTATION.md §4.4, §9.1 section 10)
 *
 * Contenu attendu : logo, navigation, commissions, contact, réseaux sociaux,
 * devise, mention de copyright.
 *
 * Les coordonnées et les réseaux sociaux sont stockés en base (table
 * `parametres`). Le composant les reçoit en propriétés avec des valeurs de
 * repli issues du seed, afin de rester affichable avant que la base ne soit
 * connectée. Les réseaux sociaux vides ne sont pas affichés.
 */

export interface FooterProps {
  email?: string;
  telephone?: string;
  adresse?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
}

/** Année courante pour la mention de copyright. */
const ANNEE = new Date().getFullYear();

const NAVIGATION = [
  { href: "/", libelle: "Accueil" },
  { href: "/a-propos", libelle: "Le CCJP" },
  { href: "/programme", libelle: "Programme triennal" },
  { href: "/bureau-executif", libelle: "Bureau exécutif" },
  { href: "/actualites", libelle: "Actualités" },
  { href: "/evenements", libelle: "Événements" },
  { href: "/contact", libelle: "Contact" },
  { href: "/rejoindre", libelle: "Rejoindre le CCJP" },
] as const;

export function Footer({
  email = "contact@ccjp-podor.sn",
  telephone,
  adresse = "Podor, Région de Saint-Louis, Sénégal",
  facebookUrl,
  instagramUrl,
  xUrl,
  tiktokUrl,
}: FooterProps) {
  const reseaux = [
    facebookUrl && { href: facebookUrl, libelle: "Facebook", Icone: Facebook },
    instagramUrl && { href: instagramUrl, libelle: "Instagram", Icone: Instagram },
    xUrl && { href: xUrl, libelle: "X (Twitter)", Icone: Twitter },
    tiktokUrl && { href: tiktokUrl, libelle: "TikTok", Icone: Music2 },
  ].filter(Boolean) as { href: string; libelle: string; Icone: typeof Facebook }[];

  return (
    <footer className="mt-auto bg-ccjp-marine text-white/80">
      {/* ---- Corps du pied de page ---- */}
      <div className="ccjp-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Colonne 1 — identité */}
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ccjp-or bg-white text-2xl"
            >
              🏛️
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-none text-white">
                CCJP
              </span>
              <span className="block text-[11px] leading-tight text-white/60">
                Conseil des Jeunes de Podor
              </span>
            </span>
          </div>

          <p className="mb-4 text-sm leading-relaxed">
            Le Conseil Consultatif des Jeunes de Podor est l&apos;instance de
            dialogue entre la jeunesse podoroise et les autorités locales.
          </p>

          <p className="mb-4 font-display text-sm font-bold italic text-ccjp-or">
            « {DEVISE_CCJP} »
          </p>

          {reseaux.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {reseaux.map(({ href, libelle, Icone }) => (
                <li key={libelle}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-ccjp-or hover:text-ccjp-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                  >
                    <Icone className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{libelle}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Colonne 2 — navigation */}
        <nav aria-label="Navigation de pied de page">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">
            Navigation
          </h2>
          <ul className="space-y-2 text-sm">
            {NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded transition-colors hover:text-ccjp-or focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                >
                  {item.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Colonne 3 — les 14 commissions */}
        <nav aria-label="Commissions">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">
            Les 14 commissions
          </h2>
          <ul className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {COMMISSIONS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/commissions/${c.slug}`}
                  className="flex items-baseline gap-1.5 rounded transition-colors hover:text-ccjp-or focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                >
                  <span className="text-[10px] font-bold tabular-nums text-ccjp-or/70">
                    {String(c.numero).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{c.nom}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Colonne 4 — contact */}
        <div>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">
            Contact
          </h2>
          <ul className="space-y-3 text-sm">
            {email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ccjp-or" aria-hidden="true" />
                <a
                  href={`mailto:${email}`}
                  className="break-all rounded transition-colors hover:text-ccjp-or focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                >
                  {email}
                </a>
              </li>
            )}
            {telephone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ccjp-or" aria-hidden="true" />
                <a
                  href={`tel:${telephone.replace(/\s/g, "")}`}
                  className="rounded transition-colors hover:text-ccjp-or focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
                >
                  {telephone}
                </a>
              </li>
            )}
            {adresse && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ccjp-or" aria-hidden="true" />
                <span className="leading-snug">{adresse}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ---- Barre de bas de page ---- */}
      <div className="border-t border-white/10">
        <div className="ccjp-container flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <p>
            © {ANNEE} {NOM_CCJP}. Tous droits réservés.
          </p>
          <p>Programme Triennal 2026–2029 · Commune de Podor, Sénégal</p>
        </div>
      </div>
    </footer>
  );
}

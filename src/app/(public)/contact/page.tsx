import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { FormulaireContact } from "./FormulaireContact";
import { getCommissions } from "@/lib/data/commissions";
import { getParametresSite } from "@/lib/parametres";

/**
 * Page « Contact » (§9.2)
 *
 * Les coordonnées viennent de la table `parametres` (modifiable depuis le
 * back-office), le formulaire insère dans `contacts`.
 *
 * Cette page reste volontairement dynamique côté formulaire : le composant
 * client gère l'état d'envoi et les erreurs de validation.
 */

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter le Conseil Consultatif des Jeunes de Podor : formulaire en " +
    "ligne, adresse e-mail, localisation à Podor et liens vers les réseaux sociaux.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [parametres, commissions] = await Promise.all([
    getParametresSite(),
    getCommissions(),
  ]);

  const sujets = commissions.map((c) => c.nom);

  return (
    <>
      {/* Bandeau */}
      <section className="bg-ccjp-hero px-4 py-14 text-white">
        <div className="ccjp-container">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-ccjp-or">
            Nous écrire
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Contact
          </h1>
          <div className="ccjp-rule mb-5" aria-hidden="true" />
          <p className="max-w-2xl text-lg text-white/85">
            Une question, une proposition, une envie de vous engager ? Le
            secrétariat du CCJP vous répond.
          </p>
        </div>
      </section>

      <section className="px-4 py-16" aria-labelledby="contact-titre">
        <div className="ccjp-container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Coordonnées */}
          <div>
            <SectionTitle surtitre="Coordonnées" as="h2">
              <span id="contact-titre">Où nous trouver</span>
            </SectionTitle>

            <ul className="mt-8 space-y-4">
              <Coordonnee
                icone={<Mail className="h-5 w-5" aria-hidden="true" />}
                label="Adresse e-mail"
                valeur={parametres.emailContact}
                lien={`mailto:${parametres.emailContact}`}
              />
              {parametres.telephone && (
                <Coordonnee
                  icone={<Phone className="h-5 w-5" aria-hidden="true" />}
                  label="Téléphone"
                  valeur={parametres.telephone}
                  lien={`tel:${parametres.telephone.replace(/[^\d+]/g, "")}`}
                />
              )}
              <Coordonnee
                icone={<MapPin className="h-5 w-5" aria-hidden="true" />}
                label="Adresse"
                valeur={parametres.adresse}
              />
              <Coordonnee
                icone={<Clock className="h-5 w-5" aria-hidden="true" />}
                label="Permanence"
                valeur="Du lundi au vendredi, de 9h à 17h"
              />
            </ul>

            {(parametres.facebookUrl ||
              parametres.instagramUrl ||
              parametres.xUrl ||
              parametres.tiktokUrl) && (
              <div className="mt-8">
                <h3 className="mb-3 font-display text-lg font-bold text-ccjp-marine">
                  Suivez-nous
                </h3>
                <ul className="flex flex-wrap gap-3 text-sm">
                  {[
                    { label: "Facebook", url: parametres.facebookUrl },
                    { label: "Instagram", url: parametres.instagramUrl },
                    { label: "X", url: parametres.xUrl },
                    { label: "TikTok", url: parametres.tiktokUrl },
                  ]
                    .filter((r) => r.url)
                    .map((r) => (
                      <li key={r.label}>
                        <a
                          href={r.url!}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1.5 rounded-full border border-ccjp-marine/20 px-3.5 py-1.5 font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:bg-ccjp-vert/5 hover:text-ccjp-vert"
                        >
                          {r.label}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Formulaire */}
          <div>
            <Card className="p-6 sm:p-8">
              <SectionTitle surtitre="Formulaire" as="h2">
                Écrivez-nous
              </SectionTitle>
              <div className="mt-6">
                <FormulaireContact sujets={sujets} />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Ligne de coordonnée                                                 */
/* ------------------------------------------------------------------ */

function Coordonnee({
  icone,
  label,
  valeur,
  lien,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
  lien?: string;
}) {
  const contenu = (
    <>
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ccjp-vert/10 text-ccjp-vert">
        {icone}
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.15em] text-ccjp-or">
          {label}
        </span>
        <span className="block text-ccjp-marine">{valeur}</span>
      </span>
    </>
  );

  return (
    <li className="flex items-start gap-3">
      {lien ? (
        <a
          href={lien}
          className="flex items-start gap-3 rounded-lg transition-colors hover:text-ccjp-vert"
        >
          {contenu}
        </a>
      ) : (
        contenu
      )}
    </li>
  );
}

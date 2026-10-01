import type { MetadataRoute } from "next";
import { urlAbsolue } from "@/lib/site";

/**
 * Robots.txt (§13.2)
 *
 * Autorise l'indexation de tout le site public et exclut explicitement :
 *   - `/admin` : espace d'administration (authentifié, jamais indexé) ;
 *   - `/api` : routes techniques (export .ics, webhooks) ;
 *   - les URL de filtre et de pagination des actualités, qui créeraient du
 *     contenu dupliqué sans apporter de page distincte.
 *
 * Le sitemap est déclaré pour accélérer la découverte des pages.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/actualites?commission=", "/actualites?page="],
      },
    ],
    sitemap: urlAbsolue("/sitemap.xml"),
    host: urlAbsolue("/"),
  };
}

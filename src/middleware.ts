import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de protection de l'espace d'administration (§7.2, §7.3, P4.2)
 *
 * Trois contrôles successifs pour toute URL commençant par `/admin` :
 *
 *   1. **Session valide ?** On appelle `supabase.auth.getUser()`, qui valide
 *      le JWT auprès de Supabase (et non la simple présence d'un cookie :
 *      un cookie forgé ne suffit pas). Cet appel rafraîchit aussi la session
 *      si elle est proche de l'expiration — c'est indispensable, sans quoi un
 *      administrateur serait déconnecté en cours de travail.
 *
 *   2. **Habilité dans `admins` ?** Une session Supabase ne suffit pas : la
 *      table `admins` liste nominativement les personnes autorisées (§7.1).
 *      La politique RLS « Un admin voit sa propre ligne » permet à chacun de
 *      lire sa propre entrée, et seulement la sienne.
 *
 *   3. Sinon → redirection vers `/auth/login` (avec `?next=`) ou vers
 *      `/auth/erreur` si la session existe mais n'est pas habilitée.
 *
 * ⚠️ Ce middleware ne protège que la NAVIGATION. Une Server Action reste un
 *    point d'entrée HTTP public : chacune revérifie donc `isCurrentUserAdmin()`
 *    avant d'écrire en base.
 *
 * ⚠️ En cas d'erreur base de données, on FERME l'accès (redirection vers
 *    `/auth/login`). Échouer en mode ouvert transformerait une panne de base
 *    en faille de sécurité.
 */

/** Chemin vers lequel renvoyer l'utilisateur après connexion. */
function urlConnexion(request: NextRequest, codeErreur?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  if (codeErreur) url.searchParams.set("erreur", codeErreur);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  // `response` doit être créé avant le client Supabase : c'est lui qui porte
  // les cookies de session rafraîchis. On ne le réaffecte jamais — on mute
  // uniquement ses cookies — d'où le `const`.
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 1. Session valide ? (`getUser` valide le JWT côté Supabase)
  //
  // L'absence de session est le cas NORMAL pour un visiteur qui arrive sur
  // `/admin` : on le renvoie simplement vers le formulaire, sans message
  // d'erreur — lui annoncer que « sa session a expiré » serait faux et
  // déroutant. Le code d'erreur `inconnu` est réservé aux pannes techniques.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return urlConnexion(request);
  }

  // 2. Utilisateur habilité dans la table `admins` ?
  let estAdmin = false;
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[middleware] vérification admin échouée :", error.message);
      // Base injoignable ou RLS bloquante : on refuse l'accès.
      return urlConnexion(request, "inconnu");
    }

    estAdmin = Boolean(data);
  } catch (e) {
    console.error("[middleware] exception vérification admin :", e);
    return urlConnexion(request, "inconnu");
  }

  if (!estAdmin) {
    // Session valide mais non habilitée : page dédiée, pas la page de connexion.
    const url = request.nextUrl.clone();
    url.pathname = "/auth/erreur";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { deconnexion } from "@/lib/actions/auth";
import { createClient, isCurrentUserAdmin } from "@/lib/supabase/server";

/**
 * Layout de l'espace d'administration (§5, P2.6, P4.2)
 *
 * Le groupe de routes `(admin)` n'ajoute rien à l'URL : tout ce qui est
 * déclaré sous `app/(admin)/admin/` reste servi sous `/admin/...`.
 *
 * Double filet de sécurité :
 *   - le `middleware.ts` filtre déjà les requêtes vers `/admin` ;
 *   - ce layout revérifie la session ET l'habilitation, car un layout est un
 *     point d'entrée comme un autre et une Server Action doit rester
 *     autonome. Le coût est négligeable (une requête de plus par
 *     chargement de page) et la garantie est réelle.
 */

export const metadata = {
  title: {
    default: "Administration",
    template: "%s | Administration CCJP",
  },
  // Le back-office ne doit jamais être indexé par les moteurs de recherche.
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");
  if (!(await isCurrentUserAdmin())) redirect("/auth/erreur");

  return (
    <AdminShell email={user.email ?? null} actionDeconnexion={deconnexion}>
      {children}
    </AdminShell>
  );
}

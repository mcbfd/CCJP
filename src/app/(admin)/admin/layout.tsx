import { AdminShell } from "@/components/layout/AdminShell";

/**
 * Layout de l'espace d'administration (PLAN_IMPLEMENTATION.md §5, P2.6)
 *
 * Le groupe de routes `(admin)` n'ajoute rien à l'URL : tout ce qui est
 * déclaré sous `app/(admin)/admin/` reste servi sous `/admin/...`.
 *
 * La sidebar liste les 9 modules (§10.2). La protection par authentification
 * (redirection vers `/auth/login`) est ajoutée en Phase 4 avec
 * `middleware.ts` (P4.2).
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell email={null}>
      {children}
    </AdminShell>
  );
}

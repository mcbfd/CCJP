/**
 * Layout du groupe `(auth)` — pages de connexion et d'erreur d'accès.
 *
 * Contrairement au groupe `(public)`, il n'affiche ni navbar ni pied de page :
 * une page de connexion doit rester épurée et ne pas offrir de navigation
 * superflue. Le groupe n'ajoute aucun segment à l'URL : `/auth/login` reste
 * inchangé.
 */

export const metadata = {
  title: {
    default: "Connexion",
    template: "%s | Administration CCJP",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ccjp-marine">
      <main id="contenu" className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}

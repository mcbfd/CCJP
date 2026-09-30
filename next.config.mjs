/**
 * Configuration Next.js — CCJP
 *
 * Voir PLAN_IMPLEMENTATION.md §7.6 (en-têtes de sécurité) et §13.1 (performance).
 */

/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 * (PLAN_IMPLEMENTATION.md §7.6)
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,

  /**
   * Images : WebP uniquement.
   *
   * ⚠️ MITIGATION DE SÉCURITÉ — ne pas réactiver AVIF sur Next.js 14.
   * L'avis GHSA-2xp9-vwfh-vxw4 (« Unauthenticated Remote Code Execution in
   * Image Optimization API when AVIF files are used ») affecte toutes les
   * versions de Next.js antérieures à 15.5.24, donc toute la ligne 14.x.
   * Le format AVIF est donc désactivé volontairement tant que le projet
   * reste sur Next.js 14. WebP offre une compression quasi équivalente.
   *
   * Voir docs/SECURITE.md §2 pour le détail et la marche à suivre en cas de
   * montée de version.
   */
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      // Supabase Storage — images des actualités, membres, événements
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

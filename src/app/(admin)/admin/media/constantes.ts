/**
 * Configuration de la médiathèque (§10.2, P4.10)
 *
 * Module neutre, SANS directive `"use server"` : consommé par les pages
 * serveur, le formulaire client et les actions.
 *
 * Les limites reprennent EXACTEMENT celles des buckets déclarés dans la
 * migration 0004. Supabase Storage applique ces règles de toute façon ; les
 * refléter ici permet de refuser un fichier trop gros AVANT de l'envoyer, ce
 * qui évite un aller-retour réseau pour rien.
 */

export interface BucketMedia {
  id: string;
  libelle: string;
  /** Types MIME acceptés, tels que déclarés sur le bucket. */
  types: readonly string[];
  /** Taille maximale en octets, telle que déclarée sur le bucket. */
  tailleMax: number;
  /** Types de la table `medias` concernés. */
  typeMedia: "image" | "document";
}

export const BUCKETS: readonly BucketMedia[] = [
  {
    id: "actualites-images",
    libelle: "Images d'actualités",
    types: ["image/jpeg", "image/png", "image/webp"],
    tailleMax: 5 * 1024 * 1024,
    typeMedia: "image",
  },
  {
    id: "membres-photos",
    libelle: "Photos des membres",
    types: ["image/jpeg", "image/png", "image/webp"],
    tailleMax: 2 * 1024 * 1024,
    typeMedia: "image",
  },
  {
    id: "evenements-images",
    libelle: "Images d'événements",
    types: ["image/jpeg", "image/png", "image/webp"],
    tailleMax: 5 * 1024 * 1024,
    typeMedia: "image",
  },
  {
    id: "documents",
    libelle: "Documents",
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    tailleMax: 20 * 1024 * 1024,
    typeMedia: "document",
  },
] as const;

/** Retrouve la configuration d'un bucket par son identifiant. */
export function bucketParId(id: string): BucketMedia | undefined {
  return BUCKETS.find((b) => b.id === id);
}

/** Extensions affichées à l'utilisateur, ex. « JPG, PNG, WebP ». */
export function extensionsAcceptees(bucket: BucketMedia): string {
  const table: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  };
  return bucket.types.map((t) => table[t] ?? t).join(", ");
}

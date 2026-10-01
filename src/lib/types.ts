// ---------------------------------------------------------------------------
// Types de la base CCJP — généré par introspection du schéma PostgreSQL.
//
// ⚠️ NE PAS MODIFIER À LA MAIN : régénérer après chaque migration.
//    Projet Supabase en place :  npm run db:types
//    Repli hors-ligne :          node scripts/generate-types.mjs
//
// Voir PLAN_IMPLEMENTATION.md §6.7 (tâche P1.6).
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      actualites: {
        Row: {
          id: string;
          titre: string;
          slug: string;
          extrait: string | null;
          contenu: string | null;
          image_url: string | null;
          commission_id: string | null;
          auteur_id: string | null;
          statut: Database['public']['Enums']['actualite_statut'];
          epingle: boolean;
          tags: string[];
          date_publication: string | null;
          vues: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titre: string;
          slug: string;
          extrait?: string | null;
          contenu?: string | null;
          image_url?: string | null;
          commission_id?: string | null;
          auteur_id?: string | null;
          statut?: Database['public']['Enums']['actualite_statut'];
          epingle?: boolean;
          tags?: string[];
          date_publication?: string | null;
          vues?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titre?: string;
          slug?: string;
          extrait?: string | null;
          contenu?: string | null;
          image_url?: string | null;
          commission_id?: string | null;
          auteur_id?: string | null;
          statut?: Database['public']['Enums']['actualite_statut'];
          epingle?: boolean;
          tags?: string[];
          date_publication?: string | null;
          vues?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "actualites_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actualites_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
        ];
      };
      adhesions: {
        Row: {
          id: string;
          prenom: string;
          nom: string;
          email: string;
          telephone: string | null;
          quartier: string | null;
          commission_id: string | null;
          motivation: string | null;
          statut: Database['public']['Enums']['adhesion_statut'];
          created_at: string;
        };
        Insert: {
          id?: string;
          prenom: string;
          nom: string;
          email: string;
          telephone?: string | null;
          quartier?: string | null;
          commission_id?: string | null;
          motivation?: string | null;
          statut?: Database['public']['Enums']['adhesion_statut'];
          created_at?: string;
        };
        Update: {
          id?: string;
          prenom?: string;
          nom?: string;
          email?: string;
          telephone?: string | null;
          quartier?: string | null;
          commission_id?: string | null;
          motivation?: string | null;
          statut?: Database['public']['Enums']['adhesion_statut'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "adhesions_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
        ];
      };
      admins: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          nom: string | null;
          actif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          nom?: string | null;
          actif?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          nom?: string | null;
          actif?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      commissions: {
        Row: {
          id: string;
          numero: number;
          slug: string;
          nom: string;
          description: string | null;
          vision: string | null;
          axes_strategiques: string[];
          couleur: string;
          icone: string | null;
          ordre: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero: number;
          slug: string;
          nom: string;
          description?: string | null;
          vision?: string | null;
          axes_strategiques?: string[];
          couleur?: string;
          icone?: string | null;
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          slug?: string;
          nom?: string;
          description?: string | null;
          vision?: string | null;
          axes_strategiques?: string[];
          couleur?: string;
          icone?: string | null;
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      contacts: {
        Row: {
          id: string;
          nom: string;
          email: string;
          sujet: string;
          message: string;
          lu: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          email: string;
          sujet: string;
          message: string;
          lu?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          email?: string;
          sujet?: string;
          message?: string;
          lu?: boolean;
          created_at?: string;
        };
        Relationships: [
        ];
      };
      evenements: {
        Row: {
          id: string;
          titre: string;
          slug: string;
          description: string | null;
          lieu: string | null;
          date_debut: string;
          date_fin: string | null;
          type_evenement: string | null;
          lien_inscription: string | null;
          image_url: string | null;
          statut: Database['public']['Enums']['evenement_statut'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titre: string;
          slug: string;
          description?: string | null;
          lieu?: string | null;
          date_debut: string;
          date_fin?: string | null;
          type_evenement?: string | null;
          lien_inscription?: string | null;
          image_url?: string | null;
          statut?: Database['public']['Enums']['evenement_statut'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titre?: string;
          slug?: string;
          description?: string | null;
          lieu?: string | null;
          date_debut?: string;
          date_fin?: string | null;
          type_evenement?: string | null;
          lien_inscription?: string | null;
          image_url?: string | null;
          statut?: Database['public']['Enums']['evenement_statut'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      medias: {
        Row: {
          id: string;
          nom: string;
          url: string;
          type: Database['public']['Enums']['media_type'];
          taille: number | null;
          commission_id: string | null;
          evenement_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          url: string;
          type?: Database['public']['Enums']['media_type'];
          taille?: number | null;
          commission_id?: string | null;
          evenement_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          url?: string;
          type?: Database['public']['Enums']['media_type'];
          taille?: number | null;
          commission_id?: string | null;
          evenement_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medias_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medias_evenement_id_fkey";
            columns: ["evenement_id"];
            isOneToOne: false;
            referencedRelation: "evenements";
            referencedColumns: ["id"];
          },
        ];
      };
      membres_bureau: {
        Row: {
          id: string;
          prenom: string;
          nom: string;
          poste: string;
          commission_id: string | null;
          biographie: string | null;
          photo_url: string | null;
          email: string | null;
          telephone: string | null;
          ordre: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prenom: string;
          nom: string;
          poste: string;
          commission_id?: string | null;
          biographie?: string | null;
          photo_url?: string | null;
          email?: string | null;
          telephone?: string | null;
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prenom?: string;
          nom?: string;
          poste?: string;
          commission_id?: string | null;
          biographie?: string | null;
          photo_url?: string | null;
          email?: string | null;
          telephone?: string | null;
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membres_bureau_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
        ];
      };
      parametres: {
        Row: {
          cle: string;
          valeur: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          cle: string;
          valeur: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          cle?: string;
          valeur?: string;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [
        ];
      };
      projets_phares: {
        Row: {
          id: string;
          commission_id: string;
          titre: string;
          description: string | null;
          annee: number | null;
          statut: Database['public']['Enums']['projet_statut'];
          ordre: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commission_id: string;
          titre: string;
          description?: string | null;
          annee?: number | null;
          statut?: Database['public']['Enums']['projet_statut'];
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          commission_id?: string;
          titre?: string;
          description?: string | null;
          annee?: number | null;
          statut?: Database['public']['Enums']['projet_statut'];
          ordre?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projets_phares_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
        ];
      };
      statistiques_indicateurs: {
        Row: {
          id: string;
          libelle: string;
          valeur: string;
          unite: string | null;
          icone: string | null;
          ordre: number;
          actif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          libelle: string;
          valeur: string;
          unite?: string | null;
          icone?: string | null;
          ordre?: number;
          actif?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          libelle?: string;
          valeur?: string;
          unite?: string | null;
          icone?: string | null;
          ordre?: number;
          actif?: boolean;
          created_at?: string;
        };
        Relationships: [
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      actualites_search_vector: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      actualite_statut: "brouillon" | "publie";
      adhesion_statut: "en_attente" | "accepte" | "refuse";
      evenement_statut: "a_venir" | "termine" | "annule";
      media_type: "image" | "video" | "document";
      projet_statut: "planifie" | "en_cours" | "realise";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

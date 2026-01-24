export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          ethos_confirmed_at: string | null
          contributions_count: number
          problems_submitted: number
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          ethos_confirmed_at?: string | null
          contributions_count?: number
          problems_submitted?: number
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          ethos_confirmed_at?: string | null
          contributions_count?: number
          problems_submitted?: number
          is_admin?: boolean
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
        }
        Relationships: []
      }
      problems: {
        Row: {
          id: string
          user_id: string
          title: string
          category_id: number | null
          situation: string
          tried_already: string | null
          desired_outcome: string | null
          constraints: string | null
          status: string
          contribution_threshold: number
          contribution_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category_id?: number | null
          situation: string
          tried_already?: string | null
          desired_outcome?: string | null
          constraints?: string | null
          status?: string
          contribution_threshold?: number
          contribution_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category_id?: number | null
          situation?: string
          tried_already?: string | null
          desired_outcome?: string | null
          constraints?: string | null
          status?: string
          contribution_threshold?: number
          contribution_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      contributions: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          content: string
          flagged_harmful: boolean
          created_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          user_id: string
          content: string
          flagged_harmful?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          user_id?: string
          content?: string
          flagged_harmful?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      syntheses: {
        Row: {
          id: string
          problem_id: string
          summary: string
          common_themes: Json | null
          divergent_views: Json | null
          considerations: Json | null
          warnings: Json | null
          contribution_count: number
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          summary: string
          common_themes?: Json | null
          divergent_views?: Json | null
          considerations?: Json | null
          warnings?: Json | null
          contribution_count: number
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          summary?: string
          common_themes?: Json | null
          divergent_views?: Json | null
          considerations?: Json | null
          warnings?: Json | null
          contribution_count?: number
          helpful_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syntheses_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          }
        ]
      }
      helpful_flags: {
        Row: {
          id: string
          synthesis_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          synthesis_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          synthesis_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "helpful_flags_synthesis_id_fkey"
            columns: ["synthesis_id"]
            isOneToOne: false
            referencedRelation: "syntheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpful_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_contribution_count: {
        Args: { problem_id: string }
        Returns: undefined
      }
      increment_contributions_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_problems_submitted: {
        Args: { user_id: string }
        Returns: undefined
      }
      increment_helpful_count: {
        Args: { synthesis_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common use cases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Problem = Database['public']['Tables']['problems']['Row']
export type Contribution = Database['public']['Tables']['contributions']['Row']
export type Synthesis = Database['public']['Tables']['syntheses']['Row']
export type HelpfulFlag = Database['public']['Tables']['helpful_flags']['Row']

// Problem with category joined
export type ProblemWithCategory = Problem & {
  categories: Category | null
}

// Synthesis with parsed JSON fields
export type SynthesisParsed = Omit<Synthesis, 'common_themes' | 'divergent_views' | 'considerations' | 'warnings'> & {
  common_themes: Array<{ theme: string; explanation: string }> | null
  divergent_views: Array<{ view: string; alternative: string }> | null
  considerations: string[] | null
  warnings: string[] | null
}

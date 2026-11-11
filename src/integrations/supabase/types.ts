export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_systems: {
        Row: {
          affected_population: string
          automation_level: string
          created_at: string
          department_id: string | null
          domain: string
          id: string
          name: string
          owner_id: string | null
          purpose: string
          risk_score: number | null
          risk_tier: string | null
          status: string
          updated_at: string
          uses_personal_data: boolean
        }
        Insert: {
          affected_population?: string
          automation_level?: string
          created_at?: string
          department_id?: string | null
          domain?: string
          id?: string
          name: string
          owner_id?: string | null
          purpose?: string
          risk_score?: number | null
          risk_tier?: string | null
          status?: string
          updated_at?: string
          uses_personal_data?: boolean
        }
        Update: {
          affected_population?: string
          automation_level?: string
          created_at?: string
          department_id?: string | null
          domain?: string
          id?: string
          name?: string
          owner_id?: string | null
          purpose?: string
          risk_score?: number | null
          risk_tier?: string | null
          status?: string
          updated_at?: string
          uses_personal_data?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_systems_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_profiles: {
        Row: {
          age: number
          annual_income: number
          bpl: boolean
          created_at: string
          disability: boolean
          full_name: string
          gender: string
          id: string
          occupation: string
          residence: string
          social_category: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age: number
          annual_income: number
          bpl?: boolean
          created_at?: string
          disability?: boolean
          full_name: string
          gender: string
          id?: string
          occupation: string
          residence: string
          social_category: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number
          annual_income?: number
          bpl?: boolean
          created_at?: string
          disability?: boolean
          full_name?: string
          gender?: string
          id?: string
          occupation?: string
          residence?: string
          social_category?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          id: string
          level: string
          name: string
          state_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          name: string
          state_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          name?: string
          state_name?: string | null
        }
        Relationships: []
      }
      findings: {
        Row: {
          ai_system_id: string
          created_at: string
          due_date: string | null
          id: string
          severity: string
          status: string
          title: string
        }
        Insert: {
          ai_system_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          severity?: string
          status?: string
          title: string
        }
        Update: {
          ai_system_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          ai_system_id: string | null
          created_at: string
          description: string
          id: string
          reported_by: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          ai_system_id?: string | null
          created_at?: string
          description?: string
          id?: string
          reported_by?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          ai_system_id?: string | null
          created_at?: string
          description?: string
          id?: string
          reported_by?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          ai_system_id: string
          answers: Json
          created_at: string
          created_by: string | null
          dimension_scores: Json
          id: string
          rationale: string
          tier: string
          total_score: number
        }
        Insert: {
          ai_system_id: string
          answers?: Json
          created_at?: string
          created_by?: string | null
          dimension_scores?: Json
          id?: string
          rationale?: string
          tier: string
          total_score: number
        }
        Update: {
          ai_system_id?: string
          answers?: Json
          created_at?: string
          created_by?: string | null
          dimension_scores?: Json
          id?: string
          rationale?: string
          tier?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_bookmarks: {
        Row: {
          created_at: string
          scheme_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          scheme_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          scheme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheme_bookmarks_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_feedback: {
        Row: {
          comment: string | null
          created_at: string
          guest_key: string | null
          id: string
          name: string | null
          rating: number
          scheme_id: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          guest_key?: string | null
          id?: string
          name?: string | null
          rating: number
          scheme_id: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          guest_key?: string | null
          id?: string
          name?: string | null
          rating?: number
          scheme_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_feedback_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          beneficiary_types: string[]
          benefits: string
          category: string
          created_at: string
          eligibility: string
          genders: string[]
          id: string
          is_demo: boolean
          last_verified: string | null
          level: string
          max_age: number | null
          max_annual_income: number | null
          min_age: number | null
          ministry: string
          occupations: string[]
          official_url: string | null
          requires_bpl: boolean
          requires_disability: boolean
          residence: string
          sector: string
          slug: string
          social_categories: string[]
          state_name: string | null
          states: string[]
          status: string
          summary: string
          tags: string[]
          title: string
        }
        Insert: {
          beneficiary_types?: string[]
          benefits?: string
          category?: string
          created_at?: string
          eligibility?: string
          genders?: string[]
          id?: string
          is_demo?: boolean
          last_verified?: string | null
          level: string
          max_age?: number | null
          max_annual_income?: number | null
          min_age?: number | null
          ministry: string
          occupations?: string[]
          official_url?: string | null
          requires_bpl?: boolean
          requires_disability?: boolean
          residence?: string
          sector: string
          slug: string
          social_categories?: string[]
          state_name?: string | null
          states?: string[]
          status?: string
          summary: string
          tags?: string[]
          title: string
        }
        Update: {
          beneficiary_types?: string[]
          benefits?: string
          category?: string
          created_at?: string
          eligibility?: string
          genders?: string[]
          id?: string
          is_demo?: boolean
          last_verified?: string | null
          level?: string
          max_age?: number | null
          max_annual_income?: number | null
          min_age?: number | null
          ministry?: string
          occupations?: string[]
          official_url?: string | null
          requires_bpl?: boolean
          requires_disability?: boolean
          residence?: string
          sector?: string
          slug?: string
          social_categories?: string[]
          state_name?: string | null
          states?: string[]
          status?: string
          summary?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gov: { Args: { _user_id: string }; Returns: boolean }
      scheme_feedback_stats: {
        Args: { p_scheme_id: string }
        Returns: {
          average_rating: number
          review_count: number
        }[]
      }
      register_citizen_profile: {
        Args: {
          p_age: number
          p_annual_income: number
          p_bpl?: boolean
          p_disability?: boolean
          p_full_name: string
          p_gender: string
          p_occupation: string
          p_residence: string
          p_social_category: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "gov_officer" | "citizen"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gov_officer", "citizen"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brand_memberships: {
        Row: {
          brand_id: string
          created_at: string
          profile_id: string
          role: Database["public"]["Enums"]["membership_role"]
        }
        Insert: {
          brand_id: string
          created_at?: string
          profile_id: string
          role: Database["public"]["Enums"]["membership_role"]
        }
        Update: {
          brand_id?: string
          created_at?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
        }
        Relationships: [
          {
            foreignKeyName: "brand_memberships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          accent_color: string
          created_at: string
          id: string
          name: string
          procedures: string
          slug: string
          voice_summary: string
        }
        Insert: {
          accent_color: string
          created_at?: string
          id?: string
          name: string
          procedures: string
          slug: string
          voice_summary: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          id?: string
          name?: string
          procedures?: string
          slug?: string
          voice_summary?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          brand_id: string
          created_at: string
          customer_message: string
          customer_name: string
          external_id: string | null
          id: string
          opened_at: string
          source: string
          subject: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          customer_message: string
          customer_name: string
          external_id?: string | null
          id?: string
          opened_at: string
          source?: string
          subject: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          customer_message?: string
          customer_name?: string
          external_id?: string | null
          id?: string
          opened_at?: string
          source?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      criteria: {
        Row: {
          archived_at: string | null
          brand_id: string | null
          created_at: string
          description: string
          id: string
          label: string
          position: number
          severity: Database["public"]["Enums"]["flag_severity"]
        }
        Insert: {
          archived_at?: string | null
          brand_id?: string | null
          created_at?: string
          description: string
          id?: string
          label: string
          position?: number
          severity: Database["public"]["Enums"]["flag_severity"]
        }
        Update: {
          archived_at?: string | null
          brand_id?: string | null
          created_at?: string
          description?: string
          id?: string
          label?: string
          position?: number
          severity?: Database["public"]["Enums"]["flag_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "criteria_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      replies: {
        Row: {
          author_id: string
          body: string
          brand_id: string
          conversation_id: string
          created_at: string
          id: string
          response_minutes: number | null
          sent_at: string
        }
        Insert: {
          author_id: string
          body: string
          brand_id: string
          conversation_id: string
          created_at?: string
          id?: string
          response_minutes?: number | null
          sent_at: string
        }
        Update: {
          author_id?: string
          body?: string
          brand_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          response_minutes?: number | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_conversation_id_brand_id_fkey"
            columns: ["conversation_id", "brand_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id", "brand_id"]
          },
        ]
      }
      review_acknowledgements: {
        Row: {
          acknowledged_at: string
          profile_id: string
          review_id: string
        }
        Insert: {
          acknowledged_at?: string
          profile_id: string
          review_id: string
        }
        Update: {
          acknowledged_at?: string
          profile_id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_acknowledgements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_acknowledgements_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_flags: {
        Row: {
          criterion_id: string
          review_id: string
        }
        Insert: {
          criterion_id: string
          review_id: string
        }
        Update: {
          criterion_id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          note: string | null
          reply_id: string
          reviewer_id: string
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          reply_id: string
          reviewer_id: string
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          reply_id?: string
          reviewer_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_review: {
        Args: {
          flagged_criteria: string[]
          new_note: string
          new_score: number
          target_reply: string
        }
        Returns: string
      }
    }
    Enums: {
      flag_severity: "critical" | "major" | "minor"
      membership_role: "lead" | "specialist"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flag_severity: ["critical", "major", "minor"],
      membership_role: ["lead", "specialist"],
    },
  },
} as const


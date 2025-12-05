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
      ai_recipe_recommendations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          recommendations: Json
          user_id: string
          user_products_hash: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recommendations: Json
          user_id: string
          user_products_hash: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          recommendations?: Json
          user_id?: string
          user_products_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recipe_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cooked_meals: {
        Row: {
          cooked_at: string | null
          created_at: string | null
          id: string
          meal_plan_item_id: string | null
          portions_count: number
          recipe_id: string
          user_id: string
        }
        Insert: {
          cooked_at?: string | null
          created_at?: string | null
          id?: string
          meal_plan_item_id?: string | null
          portions_count: number
          recipe_id: string
          user_id: string
        }
        Update: {
          cooked_at?: string | null
          created_at?: string | null
          id?: string
          meal_plan_item_id?: string | null
          portions_count?: number
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooked_meals_meal_plan_item_id_fkey"
            columns: ["meal_plan_item_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooked_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooked_meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          created_at: string | null
          id: string
          meal_date: string
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          portions: number
          recipe_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_date: string
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          portions?: number
          recipe_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_date?: string
          meal_plan_id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          portions?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_name: string
          is_required: boolean
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_name: string
          is_required?: boolean
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_name?: string
          is_required?: boolean
          quantity?: number
          recipe_id?: string
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          instructions: string
          is_active: boolean | null
          meal_category: Database["public"]["Enums"]["meal_category"]
          name: string
          nutritional_values: Json | null
          prep_time_minutes: number
          protein_type: Database["public"]["Enums"]["protein_type"]
          servings: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions: string
          is_active?: boolean | null
          meal_category: Database["public"]["Enums"]["meal_category"]
          name: string
          nutritional_values?: Json | null
          prep_time_minutes: number
          protein_type: Database["public"]["Enums"]["protein_type"]
          servings: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string
          is_active?: boolean | null
          meal_category?: Database["public"]["Enums"]["meal_category"]
          name?: string
          nutritional_values?: Json | null
          prep_time_minutes?: number
          protein_type?: Database["public"]["Enums"]["protein_type"]
          servings?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          additional_preferences: Json | null
          created_at: string | null
          daily_calories: number | null
          egg_breakfasts_per_week: number | null
          egg_dinners_per_week: number | null
          id: string
          max_fish_meals_per_week: number | null
          max_meat_meals_per_week: number | null
          min_fish_meals_per_week: number | null
          sweet_breakfast_ratio: number | null
          updated_at: string | null
          user_id: string
          vege_meals_per_week: number | null
        }
        Insert: {
          additional_preferences?: Json | null
          created_at?: string | null
          daily_calories?: number | null
          egg_breakfasts_per_week?: number | null
          egg_dinners_per_week?: number | null
          id?: string
          max_fish_meals_per_week?: number | null
          max_meat_meals_per_week?: number | null
          min_fish_meals_per_week?: number | null
          sweet_breakfast_ratio?: number | null
          updated_at?: string | null
          user_id: string
          vege_meals_per_week?: number | null
        }
        Update: {
          additional_preferences?: Json | null
          created_at?: string | null
          daily_calories?: number | null
          egg_breakfasts_per_week?: number | null
          egg_dinners_per_week?: number | null
          id?: string
          max_fish_meals_per_week?: number | null
          max_meat_meals_per_week?: number | null
          min_fish_meals_per_week?: number | null
          sweet_breakfast_ratio?: number | null
          updated_at?: string | null
          user_id?: string
          vege_meals_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          category_id: number
          created_at: string | null
          expires_at: string | null
          id: string
          name: string
          quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          name: string
          quantity: number
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verification_token: string | null
          id: string
          is_demo: boolean | null
          is_email_verified: boolean | null
          password_hash: string
          password_reset_expires_at: string | null
          password_reset_token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verification_token?: string | null
          id?: string
          is_demo?: boolean | null
          is_email_verified?: boolean | null
          password_hash: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verification_token?: string | null
          id?: string
          is_demo?: boolean | null
          is_email_verified?: boolean | null
          password_hash?: string
          password_reset_expires_at?: string | null
          password_reset_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_meal_plans: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      meal_category: "śniadanie" | "obiad" | "kolacja" | "przekąska"
      meal_type:
        | "śniadanie"
        | "drugie śniadanie"
        | "obiad"
        | "podwieczorek"
        | "kolacja"
      protein_type: "ryba" | "drób" | "czerwone mięso" | "vege"
      unit_type: "g" | "l" | "szt"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      meal_category: ["śniadanie", "obiad", "kolacja", "przekąska"],
      meal_type: [
        "śniadanie",
        "drugie śniadanie",
        "obiad",
        "podwieczorek",
        "kolacja",
      ],
      protein_type: ["ryba", "drób", "czerwone mięso", "vege"],
      unit_type: ["g", "l", "szt"],
    },
  },
} as const


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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights_history: {
        Row: {
          created_at: string
          id: string
          prompt: string
          response: string
          response_metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          response?: string
          response_metadata?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          response_metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          ai_sentiment: string
          ai_summary: string
          capital: string
          classification: string
          continent: string
          created_at: string
          currency: string
          currency_symbol: string
          economic_indicators: Json
          exchange_rate_usd: number
          flag: string
          gdp_growth: number
          id: string
          inflation: number
          interest_rate: number
          iso: string
          lat: number
          lng: number
          market_status: string
          name: string
          opportunity_score: number
          primary_exchange: string
          primary_index: string
          region: string
          risk_level: string
          timezone: string
          top_companies: Json
          top_sectors: string[]
          updated_at: string
          volatility_level: number
        }
        Insert: {
          ai_sentiment?: string
          ai_summary?: string
          capital?: string
          classification?: string
          continent?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          economic_indicators?: Json
          exchange_rate_usd?: number
          flag?: string
          gdp_growth?: number
          id?: string
          inflation?: number
          interest_rate?: number
          iso: string
          lat?: number
          lng?: number
          market_status?: string
          name: string
          opportunity_score?: number
          primary_exchange?: string
          primary_index?: string
          region?: string
          risk_level?: string
          timezone?: string
          top_companies?: Json
          top_sectors?: string[]
          updated_at?: string
          volatility_level?: number
        }
        Update: {
          ai_sentiment?: string
          ai_summary?: string
          capital?: string
          classification?: string
          continent?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          economic_indicators?: Json
          exchange_rate_usd?: number
          flag?: string
          gdp_growth?: number
          id?: string
          inflation?: number
          interest_rate?: number
          iso?: string
          lat?: number
          lng?: number
          market_status?: string
          name?: string
          opportunity_score?: number
          primary_exchange?: string
          primary_index?: string
          region?: string
          risk_level?: string
          timezone?: string
          top_companies?: Json
          top_sectors?: string[]
          updated_at?: string
          volatility_level?: number
        }
        Relationships: []
      }
      forex_rates: {
        Row: {
          base_currency: string
          id: string
          last_updated: string
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency?: string
          id?: string
          last_updated?: string
          rate?: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          id?: string
          last_updated?: string
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          change_percent: number
          change_value: number
          data_type: string
          fetched_at: string
          id: string
          metadata: Json
          name: string
          source: string
          symbol: string
          value: number
        }
        Insert: {
          change_percent?: number
          change_value?: number
          data_type?: string
          fetched_at?: string
          id?: string
          metadata?: Json
          name?: string
          source?: string
          symbol?: string
          value?: number
        }
        Update: {
          change_percent?: number
          change_value?: number
          data_type?: string
          fetched_at?: string
          id?: string
          metadata?: Json
          name?: string
          source?: string
          symbol?: string
          value?: number
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string
          fetched_at: string
          id: string
          published_at: string
          sentiment: string
          sentiment_score: number
          source: string
          summary: string
          title: string
          url: string | null
        }
        Insert: {
          category?: string
          fetched_at?: string
          id?: string
          published_at?: string
          sentiment?: string
          sentiment_score?: number
          source?: string
          summary?: string
          title: string
          url?: string | null
        }
        Update: {
          category?: string
          fetched_at?: string
          id?: string
          published_at?: string
          sentiment?: string
          sentiment_score?: number
          source?: string
          summary?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_type: string
          avg_cost: number
          created_at: string
          currency: string
          id: string
          name: string
          notes: string
          quantity: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type?: string
          avg_cost?: number
          created_at?: string
          currency?: string
          id?: string
          name?: string
          notes?: string
          quantity?: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          avg_cost?: number
          created_at?: string
          currency?: string
          id?: string
          name?: string
          notes?: string
          quantity?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          ai_summary: string
          bearish_probability: number
          bullish_probability: number
          confidence: number
          country_iso: string | null
          created_at: string
          current_price: number
          id: string
          model_version: string
          target_price: number
          ticker: string
          timeframe: string
        }
        Insert: {
          ai_summary?: string
          bearish_probability?: number
          bullish_probability?: number
          confidence?: number
          country_iso?: string | null
          created_at?: string
          current_price?: number
          id?: string
          model_version?: string
          target_price?: number
          ticker: string
          timeframe?: string
        }
        Update: {
          ai_summary?: string
          bearish_probability?: number
          bullish_probability?: number
          confidence?: number
          country_iso?: string | null
          created_at?: string
          current_price?: number
          id?: string
          model_version?: string
          target_price?: number
          ticker?: string
          timeframe?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_region: string
          display_currency: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_region?: string
          display_currency?: string
          first_name?: string
          id: string
          last_name?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_region?: string
          display_currency?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      stocks: {
        Row: {
          country: string
          created_at: string
          currency: string
          exchange: string
          id: string
          name: string
          sector: string
          symbol: string
        }
        Insert: {
          country?: string
          created_at?: string
          currency?: string
          exchange?: string
          id?: string
          name: string
          sector?: string
          symbol: string
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          exchange?: string
          id?: string
          name?: string
          sector?: string
          symbol?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_predictions_alerts: boolean
          created_at: string
          id: string
          market_news_alerts: boolean
          notifications_enabled: boolean
          portfolio_update_alerts: boolean
          price_alerts: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_predictions_alerts?: boolean
          created_at?: string
          id?: string
          market_news_alerts?: boolean
          notifications_enabled?: boolean
          portfolio_update_alerts?: boolean
          price_alerts?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_predictions_alerts?: boolean
          created_at?: string
          id?: string
          market_news_alerts?: boolean
          notifications_enabled?: boolean
          portfolio_update_alerts?: boolean
          price_alerts?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          alert_enabled: boolean
          country_iso: string | null
          created_at: string
          id: string
          name: string
          ticker: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean
          country_iso?: string | null
          created_at?: string
          id?: string
          name?: string
          ticker: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean
          country_iso?: string | null
          created_at?: string
          id?: string
          name?: string
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const

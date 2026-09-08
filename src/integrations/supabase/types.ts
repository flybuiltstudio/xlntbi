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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_coupons: {
        Row: {
          all_products: boolean
          amount_off: number | null
          code: string
          created_at: string
          created_by: string | null
          currency: string
          disabled_at: string | null
          discount_type: string
          environment: string
          expires_at: string | null
          id: string
          last_synced_at: string | null
          max_redemptions: number | null
          min_amount: number | null
          percent_off: number | null
          product_slugs: string[]
          source: string
          stripe_active: boolean | null
          stripe_coupon_id: string
          stripe_promotion_code_id: string
          times_redeemed: number
        }
        Insert: {
          all_products?: boolean
          amount_off?: number | null
          code: string
          created_at?: string
          created_by?: string | null
          currency?: string
          disabled_at?: string | null
          discount_type: string
          environment: string
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          max_redemptions?: number | null
          min_amount?: number | null
          percent_off?: number | null
          product_slugs?: string[]
          source?: string
          stripe_active?: boolean | null
          stripe_coupon_id: string
          stripe_promotion_code_id: string
          times_redeemed?: number
        }
        Update: {
          all_products?: boolean
          amount_off?: number | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          disabled_at?: string | null
          discount_type?: string
          environment?: string
          expires_at?: string | null
          id?: string
          last_synced_at?: string | null
          max_redemptions?: number | null
          min_amount?: number | null
          percent_off?: number | null
          product_slugs?: string[]
          source?: string
          stripe_active?: boolean | null
          stripe_coupon_id?: string
          stripe_promotion_code_id?: string
          times_redeemed?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      billingo_invoice_logs: {
        Row: {
          billingo_invoice_id: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          invoice_number: string | null
          order_id: string | null
          order_number: string
          source: string
          status: string
        }
        Insert: {
          billingo_invoice_id?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          order_id?: string | null
          order_number?: string
          source?: string
          status?: string
        }
        Update: {
          billingo_invoice_id?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          invoice_number?: string | null
          order_id?: string | null
          order_number?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billingo_invoice_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      billingo_invoice_snapshots: {
        Row: {
          billingo_invoice_id: number
          created_at: string
          currency: string | null
          fetched_at: string
          fulfillment_date: string | null
          gross_total: number | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          invoice_type: string | null
          items: Json
          net_total: number | null
          order_id: string | null
          paid: boolean | null
          payment_method: string | null
          raw: Json | null
          vat_labels: string[] | null
          vat_total: number | null
        }
        Insert: {
          billingo_invoice_id: number
          created_at?: string
          currency?: string | null
          fetched_at?: string
          fulfillment_date?: string | null
          gross_total?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          items?: Json
          net_total?: number | null
          order_id?: string | null
          paid?: boolean | null
          payment_method?: string | null
          raw?: Json | null
          vat_labels?: string[] | null
          vat_total?: number | null
        }
        Update: {
          billingo_invoice_id?: number
          created_at?: string
          currency?: string | null
          fetched_at?: string
          fulfillment_date?: string | null
          gross_total?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          items?: Json
          net_total?: number | null
          order_id?: string | null
          paid?: boolean | null
          payment_method?: string | null
          raw?: Json | null
          vat_labels?: string[] | null
          vat_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billingo_invoice_snapshots_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_overrides: {
        Row: {
          file_name: string
          html: string
          key: string
          script: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          file_name?: string
          html: string
          key: string
          script?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          file_name?: string
          html?: string
          key?: string
          script?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          contact_method: string | null
          contact_time: string | null
          created_at: string
          email: string
          first_name: string
          form_type: string
          id: string
          ip_address: string | null
          last_name: string
          message: string
          phone: string
          services: string[]
          tax_number: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          contact_method?: string | null
          contact_time?: string | null
          created_at?: string
          email: string
          first_name: string
          form_type: string
          id?: string
          ip_address?: string | null
          last_name: string
          message: string
          phone: string
          services?: string[]
          tax_number?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          contact_method?: string | null
          contact_time?: string | null
          created_at?: string
          email?: string
          first_name?: string
          form_type?: string
          id?: string
          ip_address?: string | null
          last_name?: string
          message?: string
          phone?: string
          services?: string[]
          tax_number?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      coupon_attempts: {
        Row: {
          amount: number | null
          code: string
          created_at: string
          detail: string | null
          email: string | null
          environment: string
          id: string
          message: string
          order_number: string | null
          outcome: string
          price_id: string | null
          reason_code: string
        }
        Insert: {
          amount?: number | null
          code: string
          created_at?: string
          detail?: string | null
          email?: string | null
          environment?: string
          id?: string
          message?: string
          order_number?: string | null
          outcome?: string
          price_id?: string | null
          reason_code?: string
        }
        Update: {
          amount?: number | null
          code?: string
          created_at?: string
          detail?: string | null
          email?: string | null
          environment?: string
          id?: string
          message?: string
          order_number?: string | null
          outcome?: string
          price_id?: string | null
          reason_code?: string
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          bundled: boolean
          created_at: string
          image_path: string | null
          key: string
          sort_order: number
          title: string
          title_en: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bundled?: boolean
          created_at?: string
          image_path?: string | null
          key: string
          sort_order?: number
          title: string
          title_en: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bundled?: boolean
          created_at?: string
          image_path?: string | null
          key?: string
          sort_order?: number
          title?: string
          title_en?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      custom_products: {
        Row: {
          category_key: string
          created_at: string
          created_by: string | null
          download_file_name: string | null
          download_storage_path: string | null
          features: string[]
          features_en: string[]
          image_path: string | null
          intro: string[]
          intro_en: string[]
          meta_description: string | null
          meta_description_en: string | null
          meta_title: string | null
          meta_title_en: string | null
          name: string
          position: number
          slug: string
          source_file_name: string
          status: string
          stripe_error: string | null
          stripe_product_live: string | null
          stripe_product_sandbox: string | null
          summary: string | null
          summary_en: string | null
          tagline: string | null
          tiers: Json
          updated_at: string
          why: string | null
          why_en: string | null
        }
        Insert: {
          category_key: string
          created_at?: string
          created_by?: string | null
          download_file_name?: string | null
          download_storage_path?: string | null
          features?: string[]
          features_en?: string[]
          image_path?: string | null
          intro?: string[]
          intro_en?: string[]
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          name: string
          position?: number
          slug: string
          source_file_name?: string
          status?: string
          stripe_error?: string | null
          stripe_product_live?: string | null
          stripe_product_sandbox?: string | null
          summary?: string | null
          summary_en?: string | null
          tagline?: string | null
          tiers?: Json
          updated_at?: string
          why?: string | null
          why_en?: string | null
        }
        Update: {
          category_key?: string
          created_at?: string
          created_by?: string | null
          download_file_name?: string | null
          download_storage_path?: string | null
          features?: string[]
          features_en?: string[]
          image_path?: string | null
          intro?: string[]
          intro_en?: string[]
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          name?: string
          position?: number
          slug?: string
          source_file_name?: string
          status?: string
          stripe_error?: string | null
          stripe_product_live?: string | null
          stripe_product_sandbox?: string | null
          summary?: string | null
          summary_en?: string | null
          tagline?: string | null
          tiers?: Json
          updated_at?: string
          why?: string | null
          why_en?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          body_html: string
          created_by: string | null
          created_by_email: string | null
          failed_count: number
          id: string
          recipients: number
          sent_at: string
          sent_count: number
          subject: string
          test_only: boolean
        }
        Insert: {
          body_html?: string
          created_by?: string | null
          created_by_email?: string | null
          failed_count?: number
          id?: string
          recipients?: number
          sent_at?: string
          sent_count?: number
          subject: string
          test_only?: boolean
        }
        Update: {
          body_html?: string
          created_by?: string | null
          created_by_email?: string | null
          failed_count?: number
          id?: string
          recipients?: number
          sent_at?: string
          sent_count?: number
          subject?: string
          test_only?: boolean
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          company: string | null
          confirm_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          ip_address: string | null
          last_name: string
          phone: string | null
          provider_error: string | null
          provider_name: string | null
          provider_synced_at: string | null
          source: string
          status: string
          unsubscribed_at: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          confirm_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          ip_address?: string | null
          last_name: string
          phone?: string | null
          provider_error?: string | null
          provider_name?: string | null
          provider_synced_at?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          confirm_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          ip_address?: string | null
          last_name?: string
          phone?: string | null
          provider_error?: string | null
          provider_name?: string | null
          provider_synced_at?: string | null
          source?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      order_downloads: {
        Row: {
          created_at: string
          download_count: number
          email: string
          expires_at: string
          file_name: string
          id: string
          last_downloaded_at: string | null
          max_downloads: number
          order_id: string
          order_number: string
          product_slug: string
          storage_path: string
          token: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          email: string
          expires_at: string
          file_name: string
          id?: string
          last_downloaded_at?: string | null
          max_downloads?: number
          order_id: string
          order_number: string
          product_slug: string
          storage_path: string
          token: string
        }
        Update: {
          created_at?: string
          download_count?: number
          email?: string
          expires_at?: string
          file_name?: string
          id?: string
          last_downloaded_at?: string | null
          max_downloads?: number
          order_id?: string
          order_number?: string
          product_slug?: string
          storage_path?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line: string
          billing_name: string
          billingo_invoice_id: number | null
          billingo_invoice_number: string | null
          city: string
          company_name: string | null
          country: string
          coupon_code: string | null
          created_at: string
          currency: string
          discount_amount: number
          email: string
          id: string
          ip_address: string | null
          last_stripe_event_at: string | null
          license_sent_at: string | null
          note: string | null
          order_number: string
          original_amount: number | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          phone: string
          postal_code: string
          product_name: string
          product_slug: string
          quantity: number
          refunded_amount: number
          status: string
          tax_number: string | null
          tier_id: string | null
          tier_label: string | null
          total_price: number
          unit_price: number
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          address_line: string
          billing_name: string
          billingo_invoice_id?: number | null
          billingo_invoice_number?: string | null
          city: string
          company_name?: string | null
          country: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          email: string
          id?: string
          ip_address?: string | null
          last_stripe_event_at?: string | null
          license_sent_at?: string | null
          note?: string | null
          order_number: string
          original_amount?: number | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone: string
          postal_code: string
          product_name: string
          product_slug: string
          quantity?: number
          refunded_amount?: number
          status?: string
          tax_number?: string | null
          tier_id?: string | null
          tier_label?: string | null
          total_price: number
          unit_price: number
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          address_line?: string
          billing_name?: string
          billingo_invoice_id?: number | null
          billingo_invoice_number?: string | null
          city?: string
          company_name?: string | null
          country?: string
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          email?: string
          id?: string
          ip_address?: string | null
          last_stripe_event_at?: string | null
          license_sent_at?: string | null
          note?: string | null
          order_number?: string
          original_amount?: number | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          postal_code?: string
          product_name?: string
          product_slug?: string
          quantity?: number
          refunded_amount?: number
          status?: string
          tax_number?: string | null
          tier_id?: string | null
          tier_label?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          month: number
          page_key: string
          page_type: string
          updated_at: string
          views: number
          year: number
        }
        Insert: {
          id?: string
          month: number
          page_key: string
          page_type: string
          updated_at?: string
          views?: number
          year: number
        }
        Update: {
          id?: string
          month?: number
          page_key?: string
          page_type?: string
          updated_at?: string
          views?: number
          year?: number
        }
        Relationships: []
      }
      product_category_order: {
        Row: {
          key: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_content_overrides: {
        Row: {
          features: string[]
          features_en: string[]
          intro: string[]
          intro_en: string[]
          meta_description: string | null
          meta_description_en: string | null
          meta_title: string | null
          meta_title_en: string | null
          slug: string
          source_file_name: string
          summary: string | null
          summary_en: string | null
          updated_at: string
          updated_by: string | null
          why: string | null
          why_en: string | null
        }
        Insert: {
          features?: string[]
          features_en?: string[]
          intro?: string[]
          intro_en?: string[]
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          slug: string
          source_file_name?: string
          summary?: string | null
          summary_en?: string | null
          updated_at?: string
          updated_by?: string | null
          why?: string | null
          why_en?: string | null
        }
        Update: {
          features?: string[]
          features_en?: string[]
          intro?: string[]
          intro_en?: string[]
          meta_description?: string | null
          meta_description_en?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          slug?: string
          source_file_name?: string
          summary?: string | null
          summary_en?: string | null
          updated_at?: string
          updated_by?: string | null
          why?: string | null
          why_en?: string | null
        }
        Relationships: []
      }
      product_file_versions: {
        Row: {
          file_name: string
          product_slug: string
          size: number | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          product_slug: string
          size?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          product_slug?: string
          size?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      product_placements: {
        Row: {
          category: string
          slug: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          slug: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_price_overrides: {
        Row: {
          price: number
          slug: string
          stripe_price_id: string | null
          sync_error: string | null
          synced_live_at: string | null
          synced_sandbox_at: string | null
          tier_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          price: number
          slug: string
          stripe_price_id?: string | null
          sync_error?: string | null
          synced_live_at?: string | null
          synced_sandbox_at?: string | null
          tier_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          price?: number
          slug?: string
          stripe_price_id?: string | null
          sync_error?: string | null
          synced_live_at?: string | null
          synced_sandbox_at?: string | null
          tier_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          environment: string
          event_created_at: string | null
          event_id: string
          event_type: string
          order_number: string | null
          outcome: string | null
          processed_at: string
        }
        Insert: {
          environment?: string
          event_created_at?: string | null
          event_id: string
          event_type: string
          order_number?: string | null
          outcome?: string | null
          processed_at?: string
        }
        Update: {
          environment?: string
          event_created_at?: string | null
          event_id?: string
          event_type?: string
          order_number?: string | null
          outcome?: string | null
          processed_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      increment_page_view: {
        Args: {
          _month: number
          _page_key: string
          _page_type: string
          _year: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

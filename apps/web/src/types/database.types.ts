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
      accounts: {
        Row: {
          active: boolean
          created_at: string
          deleted_at: string | null
          id: string
          kind: string
          name: string
          opening_balance: number
          org_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          kind: string
          name: string
          opening_balance?: number
          org_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deleted_at?: string | null
          id?: string
          kind?: string
          name?: string
          opening_balance?: number
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      appointments: {
        Row: {
          all_day: boolean
          cancel_reason: string | null
          cancelled_at: string | null
          color: string | null
          commission_snapshot: number
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          done_at: string | null
          ends_at: string
          id: string
          notes: string | null
          org_id: string
          price_snapshot: number
          professional_id: string
          service_id: string
          starts_at: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          cancel_reason?: string | null
          cancelled_at?: string | null
          color?: string | null
          commission_snapshot?: number
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          done_at?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          org_id: string
          price_snapshot: number
          professional_id: string
          service_id: string
          starts_at: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          cancel_reason?: string | null
          cancelled_at?: string | null
          color?: string | null
          commission_snapshot?: number
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          done_at?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          price_snapshot?: number
          professional_id?: string
          service_id?: string
          starts_at?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          after: Json | null
          before: Json | null
          created_at: string
          id: number
          ip_address: unknown
          org_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: number
          ip_address?: unknown
          org_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: number
          ip_address?: unknown
          org_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      command_items: {
        Row: {
          command_id: string
          commission_rate: number
          created_at: string
          description: string
          discount_amount: number
          id: string
          org_id: string
          professional_id: string | null
          quantity: number
          service_id: string
          total: number | null
          unit_cost: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          command_id: string
          commission_rate?: number
          created_at?: string
          description: string
          discount_amount?: number
          id?: string
          org_id: string
          professional_id?: string | null
          quantity?: number
          service_id: string
          total?: number | null
          unit_cost?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          command_id?: string
          commission_rate?: number
          created_at?: string
          description?: string
          discount_amount?: number
          id?: string
          org_id?: string
          professional_id?: string | null
          quantity?: number
          service_id?: string
          total?: number | null
          unit_cost?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "command_items_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "commands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "command_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "command_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "command_items_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "command_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      commands: {
        Row: {
          appointment_id: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          discount_amount: number
          finalized_at: string | null
          id: string
          notes: string | null
          opened_at: string
          org_id: string
          paid_amount: number
          paid_at: string | null
          professional_id: string | null
          status: string
          subtotal: number
          total: number | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          finalized_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          org_id: string
          paid_amount?: number
          paid_at?: string | null
          professional_id?: string | null
          status?: string
          subtotal?: number
          total?: number | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          discount_amount?: number
          finalized_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          org_id?: string
          paid_amount?: number
          paid_at?: string | null
          professional_id?: string | null
          status?: string
          subtotal?: number
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commands_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "commands_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          birth_date: string | null
          consent_lgpd_at: string | null
          cpf_encrypted: string | null
          cpf_hash: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          external_ref: string | null
          full_name: string
          id: string
          notes: string | null
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          consent_lgpd_at?: string | null
          cpf_encrypted?: string | null
          cpf_hash?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          external_ref?: string | null
          full_name: string
          id?: string
          notes?: string | null
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          consent_lgpd_at?: string | null
          cpf_encrypted?: string | null
          cpf_hash?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          external_ref?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_default: boolean
          kind: string
          name: string
          org_id: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          kind: string
          name: string
          org_id: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_default?: boolean
          kind?: string
          name?: string
          org_id?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "expense_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          org_id: string
          period_month: string
          target_appointments: number | null
          target_profit: number | null
          target_revenue: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          org_id: string
          period_month: string
          target_appointments?: number | null
          target_profit?: number | null
          target_revenue?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          period_month?: string
          target_appointments?: number | null
          target_profit?: number | null
          target_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          org_id: string
          quantity: number
          source_id: string | null
          source_type: string | null
          supply_id: string
          unit_cost_at_move: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          org_id: string
          quantity: number
          source_id?: string | null
          source_type?: string | null
          supply_id: string
          unit_cost_at_move?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          org_id?: string
          quantity?: number
          source_id?: string | null
          source_type?: string | null
          supply_id?: string
          unit_cost_at_move?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "inventory_movements_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          accepted_at: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          org_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          org_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          org_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role: string
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          cnpj: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          id: string
          legal_name: string | null
          locale: string
          name: string
          plan: string
          slug: string | null
          subscription_status: string
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          id?: string
          legal_name?: string | null
          locale?: string
          name: string
          plan?: string
          slug?: string | null
          subscription_status?: string
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          id?: string
          legal_name?: string | null
          locale?: string
          name?: string
          plan?: string
          slug?: string | null
          subscription_status?: string
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          default_account_id: string | null
          deleted_at: string | null
          fee_fixed: number
          fee_rate: number
          id: string
          kind: string
          name: string
          org_id: string
          settlement_days: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_account_id?: string | null
          deleted_at?: string | null
          fee_fixed?: number
          fee_rate?: number
          id?: string
          kind: string
          name: string
          org_id: string
          settlement_days?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_account_id?: string | null
          deleted_at?: string | null
          fee_fixed?: number
          fee_rate?: number
          id?: string
          kind?: string
          name?: string
          org_id?: string
          settlement_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_default_account_id_fkey"
            columns: ["default_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      payments: {
        Row: {
          account_id: string
          command_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          external_reference: string | null
          fee_amount: number
          fee_fixed_snapshot: number
          fee_rate_snapshot: number
          gross_amount: number
          id: string
          installments: number
          net_amount: number
          notes: string | null
          org_id: string
          paid_at: string
          payment_method_id: string
          settled_at: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          command_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_reference?: string | null
          fee_amount?: number
          fee_fixed_snapshot?: number
          fee_rate_snapshot?: number
          gross_amount: number
          id?: string
          installments?: number
          net_amount: number
          notes?: string | null
          org_id: string
          paid_at?: string
          payment_method_id: string
          settled_at?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          command_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          external_reference?: string | null
          fee_amount?: number
          fee_fixed_snapshot?: number
          fee_rate_snapshot?: number
          gross_amount?: number
          id?: string
          installments?: number
          net_amount?: number
          notes?: string | null
          org_id?: string
          paid_at?: string
          payment_method_id?: string
          settled_at?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "commands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          default_commission_rate: number
          deleted_at: string | null
          display_name: string
          email: string | null
          id: string
          org_id: string
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          default_commission_rate?: number
          deleted_at?: string | null
          display_name: string
          email?: string | null
          id?: string
          org_id: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          default_commission_rate?: number
          deleted_at?: string | null
          display_name?: string
          email?: string | null
          id?: string
          org_id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professionals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      service_categories: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      service_supplies: {
        Row: {
          created_at: string
          id: string
          org_id: string
          quantity: number
          service_id: string
          supply_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          quantity: number
          service_id: string
          supply_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          quantity?: number
          service_id?: string
          supply_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_supplies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_supplies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "service_supplies_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_supplies_supply_id_fkey"
            columns: ["supply_id"]
            isOneToOne: false
            referencedRelation: "supplies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category_id: string | null
          commission_rate: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          org_id: string
          package_sessions: number | null
          price: number
          type: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          org_id: string
          package_sessions?: number | null
          price: number
          type: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          org_id?: string
          package_sessions?: number | null
          price?: number
          type?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      supplies: {
        Row: {
          active: boolean
          created_at: string
          current_stock: number
          deleted_at: string | null
          id: string
          name: string
          org_id: string
          reorder_level: number | null
          supplier_name: string | null
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          id?: string
          name: string
          org_id: string
          reorder_level?: number | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_stock?: number
          deleted_at?: string | null
          id?: string
          name?: string
          org_id?: string
          reorder_level?: number | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          deleted_at: string | null
          description: string | null
          direction: string
          expense_category_id: string | null
          fee_amount: number
          gross_amount: number
          id: string
          is_fixed: boolean
          net_amount: number
          org_id: string
          origin: string
          professional_id: string | null
          reference_date: string
          settled_at: string | null
          source_id: string | null
          source_type: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          direction: string
          expense_category_id?: string | null
          fee_amount?: number
          gross_amount: number
          id?: string
          is_fixed?: boolean
          net_amount: number
          org_id: string
          origin: string
          professional_id?: string | null
          reference_date?: string
          settled_at?: string | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          deleted_at?: string | null
          description?: string | null
          direction?: string
          expense_category_id?: string | null
          fee_amount?: number
          gross_amount?: number
          id?: string
          is_fixed?: boolean
          net_amount?: number
          org_id?: string
          origin?: string
          professional_id?: string | null
          reference_date?: string
          settled_at?: string | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          active_org_id: string | null
          created_at: string
          onboarding_done: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          active_org_id?: string | null
          created_at?: string
          onboarding_done?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          active_org_id?: string | null
          created_at?: string
          onboarding_done?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_active_org_id_fkey"
            columns: ["active_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_active_org_id_fkey"
            columns: ["active_org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Views: {
      v_cashflow_daily: {
        Row: {
          day: string | null
          inflows: number | null
          net: number | null
          org_id: string | null
          outflows: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_dashboard_kpis: {
        Row: {
          appointments_today: number | null
          current_month: string | null
          expected_revenue_mtd: number | null
          expenses_mtd: number | null
          org_id: string | null
          revenue_mtd: number | null
        }
        Insert: {
          appointments_today?: never
          current_month?: never
          expected_revenue_mtd?: never
          expenses_mtd?: never
          org_id?: string | null
          revenue_mtd?: never
        }
        Update: {
          appointments_today?: never
          current_month?: never
          expected_revenue_mtd?: never
          expenses_mtd?: never
          org_id?: string | null
          revenue_mtd?: never
        }
        Relationships: []
      }
      v_dre_by_professional: {
        Row: {
          commission_to_pay: number | null
          gross_profit: number | null
          items_count: number | null
          org_id: string | null
          period_month: string | null
          professional_id: string | null
          professional_name: string | null
          revenue_gross: number | null
          variable_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "command_items_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_dre_by_service: {
        Row: {
          commissions: number | null
          discounts: number | null
          gross_profit: number | null
          items_count: number | null
          org_id: string | null
          period_month: string | null
          revenue_gross: number | null
          service_id: string | null
          service_name: string | null
          service_type: string | null
          total_quantity: number | null
          variable_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "command_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commands_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_dre_monthly: {
        Row: {
          acquirer_fees: number | null
          commissions: number | null
          fixed_costs: number | null
          net_profit: number | null
          operating_expenses: number | null
          org_id: string | null
          other_expenses: number | null
          period_month: string | null
          revenue_gross: number | null
          revenue_net: number | null
          taxes: number | null
          variable_costs_manual: number | null
          variable_costs_supplies: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_receitas_previstas: {
        Row: {
          appointments_count: number | null
          day: string | null
          expected_revenue: number | null
          month: string | null
          org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_kpis"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Functions: {
      _consume_command_inventory: {
        Args: { p_command_id: string; p_created_by: string; p_org_id: string }
        Returns: undefined
      }
      accept_organization_invite: { Args: { p_token: string }; Returns: string }
      count_org_owners: { Args: { p_org_id: string }; Returns: number }
      create_organization_with_owner: {
        Args: { p_cnpj?: string; p_name: string }
        Returns: string
      }
      current_org_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      is_org_member: {
        Args: { min_role?: string; target_org_id: string }
        Returns: boolean
      }
      round_half_even: {
        Args: { digits?: number; value: number }
        Returns: number
      }
      seed_default_chart_of_accounts: {
        Args: { p_org_id: string }
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

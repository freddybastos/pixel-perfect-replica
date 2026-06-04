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
      clientes: {
        Row: {
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      fotos_os: {
        Row: {
          created_at: string
          id: string
          legenda: string | null
          os_id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          legenda?: string | null
          os_id: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          legenda?: string | null
          os_id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      guias_das: {
        Row: {
          competencia: string
          created_at: string
          data_pagamento: string | null
          id: string
          observacoes: string | null
          pdf_url: string | null
          status: string
          updated_at: string
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          competencia: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor?: number
          vencimento: string
        }
        Update: {
          competencia?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      itens_os: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem: number
          os_id: string
          quantidade: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          ordem?: number
          os_id: string
          quantidade?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem?: number
          os_id?: string
          quantidade?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_os_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_servico: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          itens: Json
          nome: string
          user_id: string
          valor_padrao: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          itens?: Json
          nome: string
          user_id: string
          valor_padrao?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          itens?: Json
          nome?: string
          user_id?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          aceite_token: string
          aceito_em: string | null
          aceito_ip: string | null
          aceito_por: string | null
          cliente_id: string | null
          created_at: string
          data_execucao: string | null
          descricao: string | null
          endereco: string | null
          id: string
          numero: number
          observacoes: string | null
          status: Database["public"]["Enums"]["os_status"]
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          aceite_token?: string
          aceito_em?: string | null
          aceito_ip?: string | null
          aceito_por?: string | null
          cliente_id?: string | null
          created_at?: string
          data_execucao?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          user_id: string
          valor_total?: number
        }
        Update: {
          aceite_token?: string
          aceito_em?: string | null
          aceito_ip?: string | null
          aceito_por?: string | null
          cliente_id?: string | null
          created_at?: string
          data_execucao?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["os_status"]
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          id: string
          metodo: Database["public"]["Enums"]["pagamento_metodo"]
          os_id: string | null
          parcelas: number
          pix_codigo: string | null
          pix_qrcode: string | null
          status: Database["public"]["Enums"]["pagamento_status"]
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["pagamento_metodo"]
          os_id?: string | null
          parcelas?: number
          pix_codigo?: string | null
          pix_qrcode?: string | null
          status?: Database["public"]["Enums"]["pagamento_status"]
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["pagamento_metodo"]
          os_id?: string | null
          parcelas?: number
          pix_codigo?: string | null
          pix_qrcode?: string | null
          status?: Database["public"]["Enums"]["pagamento_status"]
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cidade: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          notificacoes_push: boolean
          plano: string
          telefone: string | null
          tipo_servico: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          id: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          notificacoes_push?: boolean
          plano?: string
          telefone?: string | null
          tipo_servico?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          notificacoes_push?: boolean
          plano?: string
          telefone?: string | null
          tipo_servico?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      os_status:
        | "rascunho"
        | "enviado"
        | "aceito"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      pagamento_metodo:
        | "pix"
        | "dinheiro"
        | "cartao"
        | "boleto"
        | "transferencia"
      pagamento_status: "pendente" | "pago" | "vencido" | "cancelado"
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
    Enums: {
      os_status: [
        "rascunho",
        "enviado",
        "aceito",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      pagamento_metodo: [
        "pix",
        "dinheiro",
        "cartao",
        "boleto",
        "transferencia",
      ],
      pagamento_status: ["pendente", "pago", "vencido", "cancelado"],
    },
  },
} as const

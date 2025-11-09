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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cartoes: {
        Row: {
          apelido: string | null
          bandeira: string | null
          criado_em: string | null
          emissor: string | null
          final_cartao: string | null
          id: number
          is_principal: boolean | null
          limite_total: number
          nome_exibicao: string
          uso_percentual: number | null
          valor_disponivel: number
          valor_utilizado: number
        }
        Insert: {
          apelido?: string | null
          bandeira?: string | null
          criado_em?: string | null
          emissor?: string | null
          final_cartao?: string | null
          id?: number
          is_principal?: boolean | null
          limite_total?: number
          nome_exibicao: string
          uso_percentual?: number | null
          valor_disponivel?: number
          valor_utilizado?: number
        }
        Update: {
          apelido?: string | null
          bandeira?: string | null
          criado_em?: string | null
          emissor?: string | null
          final_cartao?: string | null
          id?: number
          is_principal?: boolean | null
          limite_total?: number
          nome_exibicao?: string
          uso_percentual?: number | null
          valor_disponivel?: number
          valor_utilizado?: number
        }
        Relationships: []
      },
      contas: {
        Row: {
          id: number;
          descricao: string;
          valor: number;
          data_vencimento: string;
          tipo: string;
          status: string;
          categoria_id: number | null;
          data_pagamento_recebimento: string | null;
          created_at: string;
          whatsapp: string | null;
          grupo_parcelamento_id: string | null;
        };
        Insert: {
          descricao: string;
          valor: number;
          data_vencimento: string;
          tipo: string;
          status?: string;
          categoria_id?: number | null;
          data_pagamento_recebimento?: string | null;
          whatsapp?: string | null;
          grupo_parcelamento_id?: string | null;
        };
        Update: {
          descricao?: string;
          valor?: number;
          data_vencimento?: string;
          tipo?: string;
          status?: string;
          categoria_id?: number | null;
          data_pagamento_recebimento?: string | null;
          whatsapp?: string | null;
          grupo_parcelamento_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contas_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          }
        ];
      },
      contas_financeiras: {
        Row: {
          id: number;
          nome_conta: string;
          tipo_conta: string;
          saldo: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          nome_conta: string;
          tipo_conta: string;
          saldo?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nome_conta?: string;
          tipo_conta?: string;
          saldo?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      },
      categorias: {
        Row: {
          cor_hex: string | null
          created_at: string
          descricao: string | null
          id: number
          nome: string
          tipo: string | null
        }
        Insert: {
          cor_hex?: string | null
          created_at?: string
          descricao?: string | null
          id?: number
          nome: string
          tipo?: string | null
        }
        Update: {
          cor_hex?: string | null
          created_at?: string
          descricao?: string | null
          id?: number
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      entradas: {
        Row: {
          categoria_id: number | null
          created_at: string
          data: string
          descricao: string | null
          id: number
          valor: number
          whatsapp: string | null
        }
        Insert: {
          categoria_id?: number | null
          created_at?: string
          data: string
          descricao?: string | null
          id?: number
          valor: number
          whatsapp?: string | null
        }
        Update: {
          categoria_id?: number | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: number
          valor?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entradas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entradas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "vw_saidas_por_categoria"
            referencedColumns: ["categoria_id"]
          },
        ]
      }
      saidas: {
        Row: {
          categoria_id: number | null
          created_at: string
          data: string
          descricao: string | null
          id: number
          valor: number
          whatsapp: string | null
        }
        Insert: {
          categoria_id?: number | null
          created_at?: string
          data: string
          descricao?: string | null
          id?: number
          valor: number
          whatsapp?: string | null
        }
        Update: {
          categoria_id?: number | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: number
          valor?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saidas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saidas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "vw_saidas_por_categoria"
            referencedColumns: ["categoria_id"]
          },
        ]
      }
      tarefas: {
        Row: {
          concluida: boolean | null
          created_at: string
          descricao: string | null
          id: number
          titulo: string | null
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: number
          titulo?: string | null
        }
        Update: {
          concluida?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: number
          titulo?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string
          id: number
          nome: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: number
          nome: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string
          whatsapp?: string
        }
        Relationships: []
      }
      whatsapp_conversas: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_contas_vencer: {
        Row: {
          id: number;
          descricao: string;
          valor: number;
          data_vencimento: string;
          tipo: string;
          status: string;
          categoria_id: number | null;
          whatsapp: string | null;
          created_at: string;
          grupo_parcelamento_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contas_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_contas_vencidas: {
        Row: {
          id: number;
          descricao: string;
          valor: number;
          data_vencimento: string;
          tipo: string;
          status: string;
          categoria_id: number | null;
          whatsapp: string | null;
          created_at: string;
          grupo_parcelamento_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contas_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          }
        ];
      };
      vw_entradas_saidas_mensal: {
        Row: {
          mes: string | null
          total_entradas: number | null
          total_saidas: number | null
        }
        Relationships: []
      }
      vw_saidas_por_categoria: {
        Row: {
          categoria: string | null
          categoria_id: number | null
          total_saidas: number | null
        }
        Relationships: []
      }
      vw_saldo_diario: {
        Row: {
          dia: string | null
          entradas_dia: number | null
          saidas_dia: number | null
          saldo_acumulado: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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

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
      Audios: {
        Row: {
          audio: string | null
          city: number | null
          created_at: string
          event: number | null
          id: number
          info: Json | null
          name: Json | null
          route: number | null
          spot: number | null
          time: number | null
        }
        Insert: {
          audio?: string | null
          city?: number | null
          created_at?: string
          event?: number | null
          id?: number
          info?: Json | null
          name?: Json | null
          route?: number | null
          spot?: number | null
          time?: number | null
        }
        Update: {
          audio?: string | null
          city?: number | null
          created_at?: string
          event?: number | null
          id?: number
          info?: Json | null
          name?: Json | null
          route?: number | null
          spot?: number | null
          time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Audios_city_fkey"
            columns: ["city"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audios_event_fkey"
            columns: ["event"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audios_route_fkey"
            columns: ["route"]
            isOneToOne: false
            referencedRelation: "Routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Audios_spot_fkey"
            columns: ["spot"]
            isOneToOne: false
            referencedRelation: "Spots"
            referencedColumns: ["id"]
          },
        ]
      }
      Cities: {
        Row: {
          cityorder: number | null
          coment: string | null
          countryeng: string | null
          countryId: number | null
          created_at: string
          events: number | null
          id: number
          images: string[] | null
          info: Json | null
          latitude: number | null
          longitude: number | null
          name: Json | null
          routes: number | null
          spots: number | null
        }
        Insert: {
          cityorder?: number | null
          coment?: string | null
          countryeng?: string | null
          countryId?: number | null
          created_at?: string
          events?: number | null
          id?: number
          images?: string[] | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          routes?: number | null
          spots?: number | null
        }
        Update: {
          cityorder?: number | null
          coment?: string | null
          countryeng?: string | null
          countryId?: number | null
          created_at?: string
          events?: number | null
          id?: number
          images?: string[] | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          routes?: number | null
          spots?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_countryeng_fkey"
            columns: ["countryeng"]
            isOneToOne: false
            referencedRelation: "Countries"
            referencedColumns: ["name_eng"]
          },
        ]
      }
      Countries: {
        Row: {
          created_at: string
          id: number
          name: Json | null
          name_eng: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: Json | null
          name_eng?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: Json | null
          name_eng?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      events: {
        Row: {
          city: number | null
          create_at: string
          id: number
          images: string[] | null
          info: Json | null
          kind: string | null
          name: Json | null
          spot: number[] | null
          time: string | null
          type: string | null
        }
        Insert: {
          city?: number | null
          create_at?: string
          id?: number
          images?: string[] | null
          info?: Json | null
          kind?: string | null
          name?: Json | null
          spot?: number[] | null
          time?: string | null
          type?: string | null
        }
        Update: {
          city?: number | null
          create_at?: string
          id?: number
          images?: string[] | null
          info?: Json | null
          kind?: string | null
          name?: Json | null
          spot?: number[] | null
          time?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_fkey"
            columns: ["city"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
        ]
      }
      language: {
        Row: {
          code: string
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
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
      Routes: {
        Row: {
          city: number | null
          created_at: string
          id: number
          info: Json | null
          name: Json | null
          spots: number[] | null
        }
        Insert: {
          city?: number | null
          created_at?: string
          id?: number
          info?: Json | null
          name?: Json | null
          spots?: number[] | null
        }
        Update: {
          city?: number | null
          created_at?: string
          id?: number
          info?: Json | null
          name?: Json | null
          spots?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "Routes_city_fkey"
            columns: ["city"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
        ]
      }
      sm_bot_users: {
        Row: {
          created_at: string
          id: number
          name: string | null
          surname: string | null
          telegram_ID: number | null
          user: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          surname?: string | null
          telegram_ID?: number | null
          user?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          surname?: string | null
          telegram_ID?: number | null
          user?: string | null
        }
        Relationships: []
      }
      sm_chat_history: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      sm_text: {
        Row: {
          content: string | null
          created_at: string
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      Spots: {
        Row: {
          city: number | null
          cityeng: string | null
          coordinates: Json | null
          created_at: string
          id: number
          images: string[] | null
          imagesdf: Json | null
          info: Json | null
          latitude: number | null
          longitude: number | null
          name: Json | null
          orderby: number | null
          spotype: number | null
          spotypeng: string | null
        }
        Insert: {
          city?: number | null
          cityeng?: string | null
          coordinates?: Json | null
          created_at?: string
          id?: number
          images?: string[] | null
          imagesdf?: Json | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          orderby?: number | null
          spotype?: number | null
          spotypeng?: string | null
        }
        Update: {
          city?: number | null
          cityeng?: string | null
          coordinates?: Json | null
          created_at?: string
          id?: number
          images?: string[] | null
          imagesdf?: Json | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          orderby?: number | null
          spotype?: number | null
          spotypeng?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Spots_city_fkey"
            columns: ["city"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
        ]
      }
      spots1: {
        Row: {
          city: number | null
          coordinates: Json | null
          created_at: string
          id: number
          images: string[] | null
          info: Json | null
          latitude: string | null
          longitude: string | null
          name: Json | null
          order: number | null
          type: number | null
        }
        Insert: {
          city?: number | null
          coordinates?: Json | null
          created_at?: string
          id?: number
          images?: string[] | null
          info?: Json | null
          latitude?: string | null
          longitude?: string | null
          name?: Json | null
          order?: number | null
          type?: number | null
        }
        Update: {
          city?: number | null
          coordinates?: Json | null
          created_at?: string
          id?: number
          images?: string[] | null
          info?: Json | null
          latitude?: string | null
          longitude?: string | null
          name?: Json | null
          order?: number | null
          type?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          city_id: number | null
          created_at: string
          email: string | null
          id: number
          info: string | null
          language: string
          name: string
          password: string | null
          phone: number | null
          pin: number | null
          points: number | null
          role: string | null
          session_token: string | null
          tarif: string | null
          tg_id: number | null
          timezone: string | null
        }
        Insert: {
          city_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          info?: string | null
          language?: string
          name: string
          password?: string | null
          phone?: number | null
          pin?: number | null
          points?: number | null
          role?: string | null
          session_token?: string | null
          tarif?: string | null
          tg_id?: number | null
          timezone?: string | null
        }
        Update: {
          city_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          info?: string | null
          language?: string
          name?: string
          password?: string | null
          phone?: number | null
          pin?: number | null
          points?: number | null
          role?: string | null
          session_token?: string | null
          tarif?: string | null
          tg_id?: number | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Users_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "Cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      get_public_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

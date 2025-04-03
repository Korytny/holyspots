
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Cities: {
        Row: {
          id: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds: string[];
          routeIds: string[];
          eventIds: string[];
          location: Json;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds?: string[];
          routeIds?: string[];
          eventIds?: string[];
          location: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: Json;
          description?: Json;
          media?: Json;
          thumbnail?: string;
          pointIds?: string[];
          routeIds?: string[];
          eventIds?: string[];
          location?: Json;
          created_at?: string;
        };
      };
      Spots: {
        Row: {
          id: string;
          cityId: string;
          type: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          location: Json;
          routeIds: string[];
          eventIds: string[];
          ownerId?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          cityId: string;
          type: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          location: Json;
          routeIds?: string[];
          eventIds?: string[];
          ownerId?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cityId?: string;
          type?: string;
          name?: Json;
          description?: Json;
          media?: Json;
          thumbnail?: string;
          location?: Json;
          routeIds?: string[];
          eventIds?: string[];
          ownerId?: string;
          created_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          cityId: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds: string[];
          eventIds: string[];
          distance?: number;
          duration?: number;
          created_at?: string;
        };
        Insert: {
          id?: string;
          cityId: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds?: string[];
          eventIds?: string[];
          distance?: number;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          cityId?: string;
          name?: Json;
          description?: Json;
          media?: Json;
          thumbnail?: string;
          pointIds?: string[];
          eventIds?: string[];
          distance?: number;
          duration?: number;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          cityId: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds: string[];
          startDate: string;
          endDate: string;
          ownerId?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          cityId: string;
          name: Json;
          description: Json;
          media: Json;
          thumbnail: string;
          pointIds?: string[];
          startDate: string;
          endDate: string;
          ownerId?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cityId?: string;
          name?: Json;
          description?: Json;
          media?: Json;
          thumbnail?: string;
          pointIds?: string[];
          startDate?: string;
          endDate?: string;
          ownerId?: string;
          created_at?: string;
        };
      };
    };
  };
}

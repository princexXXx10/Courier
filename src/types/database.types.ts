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
      deliveries: {
        Row: {
          assigned_courier: string | null
          courier_name: string | null
          created_at: string | null
          current_city: string
          current_lat: number
          current_lng: number
          current_status: string | null
          customer_name: string | null
          destination_city: string
          destination_code: string | null
          destination_eta: string | null
          destination_lat: number
          destination_lng: number
          dimensions: string | null
          eta: string | null
          id: string
          origin_city: string
          origin_code: string | null
          origin_date: string | null
          origin_lat: number
          origin_lng: number
          progress: number | null
          service: string | null
          status: string
          status_text: string
          tracking_code: string
          weight: string | null
        }
        Insert: {
          assigned_courier?: string | null
          courier_name?: string | null
          created_at?: string | null
          current_city: string
          current_lat: number
          current_lng: number
          current_status?: string | null
          customer_name?: string | null
          destination_city: string
          destination_code?: string | null
          destination_eta?: string | null
          destination_lat: number
          destination_lng: number
          dimensions?: string | null
          eta?: string | null
          id?: string
          origin_city: string
          origin_code?: string | null
          origin_date?: string | null
          origin_lat: number
          origin_lng: number
          progress?: number | null
          service?: string | null
          status: string
          status_text: string
          tracking_code: string
          weight?: string | null
        }
        Update: {
          assigned_courier?: string | null
          courier_name?: string | null
          created_at?: string | null
          current_city?: string
          current_lat?: number
          current_lng?: number
          current_status?: string | null
          customer_name?: string | null
          destination_city?: string
          destination_code?: string | null
          destination_eta?: string | null
          destination_lat?: number
          destination_lng?: number
          dimensions?: string | null
          eta?: string | null
          id?: string
          origin_city?: string
          origin_code?: string | null
          origin_date?: string | null
          origin_lat?: number
          origin_lng?: number
          progress?: number | null
          service?: string | null
          status?: string
          status_text?: string
          tracking_code?: string
          weight?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          delivery_id: string | null
          event_date: string
          event_time: string
          id: string
          location: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          delivery_id?: string | null
          event_date: string
          event_time: string
          id?: string
          location: string
          status: string
          title: string
        }
        Update: {
          created_at?: string | null
          delivery_id?: string | null
          event_date?: string
          event_time?: string
          id?: string
          location?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

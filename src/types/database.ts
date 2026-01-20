export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          is_direct_distributor: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          is_direct_distributor?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          is_direct_distributor?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          brand_id: string
          model: string
          type: string
          description: string | null
          specifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          model: string
          type: string
          description?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          model?: string
          type?: string
          description?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      parts: {
        Row: {
          id: string
          part_number: string
          description: string
          brand_id: string
          compatible_equipment: string[]
          category: string
          subcategory: string | null
          in_stock: boolean
          lead_time_days: number | null
          image_url: string | null
          specifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          part_number: string
          description: string
          brand_id: string
          compatible_equipment?: string[]
          category: string
          subcategory?: string | null
          in_stock?: boolean
          lead_time_days?: number | null
          image_url?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          part_number?: string
          description?: string
          brand_id?: string
          compatible_equipment?: string[]
          category?: string
          subcategory?: string | null
          in_stock?: boolean
          lead_time_days?: number | null
          image_url?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          client_name: string
          client_logo_url: string | null
          location: string
          year: number
          industry: string
          application: string
          refrigerant: string | null
          capacity_tr: number | null
          challenge: string
          solution: string
          results: string | null
          testimonial: string | null
          testimonial_author: string | null
          images: string[]
          tags: string[]
          featured: boolean
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          client_name: string
          client_logo_url?: string | null
          location: string
          year: number
          industry: string
          application: string
          refrigerant?: string | null
          capacity_tr?: number | null
          challenge: string
          solution: string
          results?: string | null
          testimonial?: string | null
          testimonial_author?: string | null
          images?: string[]
          tags?: string[]
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          client_name?: string
          client_logo_url?: string | null
          location?: string
          year?: number
          industry?: string
          application?: string
          refrigerant?: string | null
          capacity_tr?: number | null
          challenge?: string
          solution?: string
          results?: string | null
          testimonial?: string | null
          testimonial_author?: string | null
          images?: string[]
          tags?: string[]
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          quote_number: string
          name: string
          company: string
          email: string
          phone: string
          message: string | null
          type: 'project' | 'parts'
          status: 'pending' | 'contacted' | 'quoted' | 'closed'
          items: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_number?: string
          name: string
          company: string
          email: string
          phone: string
          message?: string | null
          type: 'project' | 'parts'
          status?: 'pending' | 'contacted' | 'quoted' | 'closed'
          items?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_number?: string
          name?: string
          company?: string
          email?: string
          phone?: string
          message?: string | null
          type?: 'project' | 'parts'
          status?: 'pending' | 'contacted' | 'quoted' | 'closed'
          items?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          company: string | null
          email: string
          phone: string | null
          source: string
          interest: string | null
          notes: string | null
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          email: string
          phone?: string | null
          source: string
          interest?: string | null
          notes?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          email?: string
          phone?: string | null
          source?: string
          interest?: string | null
          notes?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          created_at?: string
          updated_at?: string
        }
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
  }
}

// Helper types
export type Brand = Database['public']['Tables']['brands']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type Part = Database['public']['Tables']['parts']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Quote = Database['public']['Tables']['quotes']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']

// Filter types for projects
export type IndustryFilter =
  | 'lacteos'
  | 'carnicos'
  | 'bebidas'
  | 'chocolates'
  | 'frutas-verduras'
  | 'petroquimica'

export type ApplicationFilter =
  | 'cuartos-frios'
  | 'tuneles'
  | 'bancos-hielo'
  | 'chillers'
  | 'pre-enfriadores'

export type RefrigerantFilter =
  | 'nh3'
  | 'r-404a'
  | 'r-134a'
  | 'co2'

export type CapacityFilter =
  | 'small' // < 50 TR
  | 'medium' // 50-150 TR
  | 'large' // 150-500 TR
  | 'xlarge' // > 500 TR

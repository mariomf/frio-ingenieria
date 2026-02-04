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
          // AI Agent fields
          score: number
          score_breakdown: Json | null
          category: 'HOT' | 'WARM' | 'COLD' | 'DISCARD'
          industry: string | null
          equipment_brands: string[]
          assigned_agent: string | null
          consent_status: 'pending' | 'granted' | 'denied' | 'unsubscribed'
          last_contact_at: string | null
          next_action_at: string | null
          company_size: string | null
          location: string | null
          website: string | null
          enrichment_data: Json | null
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
          score?: number
          score_breakdown?: Json | null
          category?: 'HOT' | 'WARM' | 'COLD' | 'DISCARD'
          industry?: string | null
          equipment_brands?: string[]
          assigned_agent?: string | null
          consent_status?: 'pending' | 'granted' | 'denied' | 'unsubscribed'
          last_contact_at?: string | null
          next_action_at?: string | null
          company_size?: string | null
          location?: string | null
          website?: string | null
          enrichment_data?: Json | null
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
          score?: number
          score_breakdown?: Json | null
          category?: 'HOT' | 'WARM' | 'COLD' | 'DISCARD'
          industry?: string | null
          equipment_brands?: string[]
          assigned_agent?: string | null
          consent_status?: 'pending' | 'granted' | 'denied' | 'unsubscribed'
          last_contact_at?: string | null
          next_action_at?: string | null
          company_size?: string | null
          location?: string | null
          website?: string | null
          enrichment_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_runs: {
        Row: {
          id: string
          agent_id: string
          agent_type: 'prospector' | 'engage' | 'qualifier' | 'enricher'
          config: Json
          results: Json
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          leads_found: number
          leads_qualified: number
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          agent_type: 'prospector' | 'engage' | 'qualifier' | 'enricher'
          config?: Json
          results?: Json
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          leads_found?: number
          leads_qualified?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          agent_type?: 'prospector' | 'engage' | 'qualifier' | 'enricher'
          config?: Json
          results?: Json
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          leads_found?: number
          leads_qualified?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      lead_interactions: {
        Row: {
          id: string
          lead_id: string
          agent_id: string | null
          channel: 'email' | 'whatsapp' | 'phone' | 'sms' | 'web' | 'linkedin'
          direction: 'inbound' | 'outbound'
          interaction_type: string
          subject: string | null
          content: string | null
          metadata: Json | null
          status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at: string | null
          opened_at: string | null
          replied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          agent_id?: string | null
          channel: 'email' | 'whatsapp' | 'phone' | 'sms' | 'web' | 'linkedin'
          direction: 'inbound' | 'outbound'
          interaction_type: string
          subject?: string | null
          content?: string | null
          metadata?: Json | null
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at?: string | null
          opened_at?: string | null
          replied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          agent_id?: string | null
          channel?: 'email' | 'whatsapp' | 'phone' | 'sms' | 'web' | 'linkedin'
          direction?: 'inbound' | 'outbound'
          interaction_type?: string
          subject?: string | null
          content?: string | null
          metadata?: Json | null
          status?: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
          sent_at?: string | null
          opened_at?: string | null
          replied_at?: string | null
          created_at?: string
        }
      }
      prospect_sources: {
        Row: {
          id: string
          name: string
          source_type: 'directory' | 'api' | 'scrape' | 'manual' | 'referral'
          url: string | null
          config: Json | null
          last_scraped_at: string | null
          leads_found_total: number
          is_active: boolean
          region: string | null
          industries: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          source_type: 'directory' | 'api' | 'scrape' | 'manual' | 'referral'
          url?: string | null
          config?: Json | null
          last_scraped_at?: string | null
          leads_found_total?: number
          is_active?: boolean
          region?: string | null
          industries?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          source_type?: 'directory' | 'api' | 'scrape' | 'manual' | 'referral'
          url?: string | null
          config?: Json | null
          last_scraped_at?: string | null
          leads_found_total?: number
          is_active?: boolean
          region?: string | null
          industries?: string[]
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
export type AgentRun = Database['public']['Tables']['agent_runs']['Row']
export type LeadInteraction = Database['public']['Tables']['lead_interactions']['Row']
export type ProspectSource = Database['public']['Tables']['prospect_sources']['Row']

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

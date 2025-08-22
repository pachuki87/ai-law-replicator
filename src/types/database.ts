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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          gemini_api_key: string | null
          openai_api_key: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gemini_api_key?: string | null
          openai_api_key?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gemini_api_key?: string | null
          openai_api_key?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          company: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string
          description: string | null
          case_type: string
          status: string
          priority: string
          court: string | null
          case_number: string | null
          start_date: string | null
          end_date: string | null
          case_value: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title: string
          description?: string | null
          case_type: string
          status?: string
          priority?: string
          court?: string | null
          case_number?: string | null
          start_date?: string | null
          end_date?: string | null
          case_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          case_type?: string
          status?: string
          priority?: string
          court?: string | null
          case_number?: string | null
          start_date?: string | null
          end_date?: string | null
          case_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_activities: {
        Row: {
          id: string
          case_id: string
          user_id: string
          activity_type: string
          title: string
          description: string | null
          status: string
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          user_id: string
          activity_type: string
          title: string
          description?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          user_id?: string
          activity_type?: string
          title?: string
          description?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generated_documents: {
        Row: {
          id: string
          user_id: string
          case_id: string | null
          template_id: string | null
          document_type: string
          title: string
          content: string
          format: string
          file_path: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_id?: string | null
          template_id?: string | null
          document_type: string
          title: string
          content: string
          format?: string
          file_path?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_id?: string | null
          template_id?: string | null
          document_type?: string
          title?: string
          content?: string
          format?: string
          file_path?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      document_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          document_type: string
          template_content: string
          variables: Json | null
          is_public: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          document_type: string
          template_content: string
          variables?: Json | null
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          document_type?: string
          template_content?: string
          variables?: Json | null
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_history: {
        Row: {
          id: string
          document_id: string
          version: number
          content: string
          changes_summary: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          version: number
          content: string
          changes_summary?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          version?: number
          content?: string
          changes_summary?: string | null
          created_by?: string
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          search_type: string
          results_count: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          search_type: string
          results_count?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          search_type?: string
          results_count?: number | null
          metadata?: Json | null
          created_at?: string
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          query: string
          search_type: string
          filters: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          query: string
          search_type: string
          filters?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          query?: string
          search_type?: string
          filters?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          context_type: string | null
          context_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          context_type?: string | null
          context_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          context_type?: string | null
          context_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      compliance_areas: {
        Row: {
          id: string
          name: string
          description: string | null
          regulations: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          regulations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          regulations?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      compliance_issues: {
        Row: {
          id: string
          user_id: string
          case_id: string | null
          area_id: string
          title: string
          description: string | null
          severity: string
          status: string
          due_date: string | null
          resolved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_id?: string | null
          area_id: string
          title: string
          description?: string | null
          severity?: string
          status?: string
          due_date?: string | null
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_id?: string | null
          area_id?: string
          title?: string
          description?: string | null
          severity?: string
          status?: string
          due_date?: string | null
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_predictions: {
        Row: {
          id: string
          user_id: string
          case_id: string
          prediction_type: string
          outcome: string
          confidence: number
          reasoning: string | null
          factors_used: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_id: string
          prediction_type: string
          outcome: string
          confidence: number
          reasoning?: string | null
          factors_used?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_id?: string
          prediction_type?: string
          outcome?: string
          confidence?: number
          reasoning?: string | null
          factors_used?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      case_documents: {
        Row: {
          id: string
          case_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          file_name: string
          file_path: string
          file_size: number
          mime_type?: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      prediction_factors: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          weight: number
          data_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          weight?: number
          data_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          weight?: number
          data_type?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Case = Database['public']['Tables']['cases']['Row']
export type CaseActivity = Database['public']['Tables']['case_activities']['Row']
export type GeneratedDocument = Database['public']['Tables']['generated_documents']['Row']
export type DocumentTemplate = Database['public']['Tables']['document_templates']['Row']
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row']
export type AIMessage = Database['public']['Tables']['ai_messages']['Row']
export type ComplianceIssue = Database['public']['Tables']['compliance_issues']['Row']
export type CasePrediction = Database['public']['Tables']['case_predictions']['Row']
export type CaseDocument = Database['public']['Tables']['case_documents']['Row']

// Insert types
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type CaseInsert = Database['public']['Tables']['cases']['Insert']
export type CaseActivityInsert = Database['public']['Tables']['case_activities']['Insert']
export type GeneratedDocumentInsert = Database['public']['Tables']['generated_documents']['Insert']
export type DocumentTemplateInsert = Database['public']['Tables']['document_templates']['Insert']
export type AIConversationInsert = Database['public']['Tables']['ai_conversations']['Insert']
export type AIMessageInsert = Database['public']['Tables']['ai_messages']['Insert']
export type ComplianceIssueInsert = Database['public']['Tables']['compliance_issues']['Insert']
export type CasePredictionInsert = Database['public']['Tables']['case_predictions']['Insert']
export type CaseDocumentInsert = Database['public']['Tables']['case_documents']['Insert']

// Update types
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type CaseUpdate = Database['public']['Tables']['cases']['Update']
export type CaseActivityUpdate = Database['public']['Tables']['case_activities']['Update']
export type GeneratedDocumentUpdate = Database['public']['Tables']['generated_documents']['Update']
export type DocumentTemplateUpdate = Database['public']['Tables']['document_templates']['Update']
export type AIConversationUpdate = Database['public']['Tables']['ai_conversations']['Update']
export type AIMessageUpdate = Database['public']['Tables']['ai_messages']['Update']
export type ComplianceIssueUpdate = Database['public']['Tables']['compliance_issues']['Update']
export type CasePredictionUpdate = Database['public']['Tables']['case_predictions']['Update']
export type CaseDocumentUpdate = Database['public']['Tables']['case_documents']['Update']
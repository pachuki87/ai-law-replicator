import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  GeneratedDocument,
  GeneratedDocumentInsert,
  GeneratedDocumentUpdate,
  DocumentTemplate,
  DocumentHistory
} from '../types/database'

export interface DocumentWithTemplate extends GeneratedDocument {
  template?: DocumentTemplate
}

export interface DocumentWithHistory extends GeneratedDocument {
  history: DocumentHistory[]
}

export interface DocumentGenerationData {
  caseId?: string
  templateId?: string
  documentType: string
  title: string
  content: string
  format?: string
  metadata?: Record<string, any>
}

class DocumentService {
  // ============ DOCUMENT OPERATIONS ============

  // Generate and save new document
  async generateDocument(documentData: DocumentGenerationData): Promise<GeneratedDocument | null> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          user_id: 'anonymous',
          case_id: documentData.caseId || null,
          template_id: documentData.templateId || null,
          document_type: documentData.documentType,
          title: documentData.title,
          content: documentData.content,
          format: documentData.format || 'html',
          metadata: documentData.metadata || null
        })
        .select()
        .single()

      if (error) throw error

      // Create initial history entry
      if (data) {
        await this.createDocumentHistory({
          document_id: data.id,
          version: 1,
          content: data.content,
          changes_summary: 'Documento creado inicialmente',
          created_by: 'anonymous'
        })
      }

      return data
    } catch (error) {
      console.error('Generate document error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get all documents for current user
  async getDocuments(): Promise<DocumentWithTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select(`
          *,
          template:document_templates(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get documents error:', error)
      return []
    }
  }

  // Get documents by case
  async getDocumentsByCase(caseId: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get documents by case error:', error)
      return []
    }
  }

  // Get documents by type
  async getDocumentsByType(documentType: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('document_type', documentType)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get documents by type error:', error)
      return []
    }
  }

  // Get document by ID with history
  async getDocument(documentId: string): Promise<DocumentWithHistory | null> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select(`
          *,
          history:document_history(*)
        `)
        .eq('id', documentId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get document error:', error)
      return null
    }
  }

  // Update document
  async updateDocument(documentId: string, updates: GeneratedDocumentUpdate): Promise<GeneratedDocument | null> {
    try {
      // Get current document for history
      const currentDoc = await this.getDocument(documentId)
      if (!currentDoc) throw new Error('Document not found')

      const { data, error } = await supabase
        .from('generated_documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .select()
        .single()

      if (error) throw error

      // Create history entry if content changed
      if (updates.content && updates.content !== currentDoc.content) {
        const nextVersion = Math.max(...currentDoc.history.map(h => h.version)) + 1
        await this.createDocumentHistory({
          document_id: documentId,
          version: nextVersion,
          content: updates.content,
          changes_summary: 'Documento actualizado',
          created_by: 'anonymous'
        })
      }

      return data
    } catch (error) {
      console.error('Update document error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('generated_documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete document error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ TEMPLATE OPERATIONS ============

  // Get all public templates
  async getPublicTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_public', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get public templates error:', error)
      return []
    }
  }

  // Get templates by type
  async getTemplatesByType(documentType: string): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_public', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get templates by type error:', error)
      return []
    }
  }

  // Get template by ID
  async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get template error:', error)
      return null
    }
  }

  // ============ DOCUMENT HISTORY OPERATIONS ============

  // Create document history entry
  private async createDocumentHistory(historyData: {
    document_id: string
    version: number
    content: string
    changes_summary?: string
    created_by: string
  }): Promise<DocumentHistory | null> {
    try {
      const { data, error } = await supabase
        .from('document_history')
        .insert(historyData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create document history error:', error)
      return null
    }
  }

  // Get document history
  async getDocumentHistory(documentId: string): Promise<DocumentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('document_history')
        .select('*')
        .eq('document_id', documentId)
        .order('version', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get document history error:', error)
      return []
    }
  }

  // Restore document to previous version
  async restoreDocumentVersion(documentId: string, version: number): Promise<GeneratedDocument | null> {
    try {
      // Get the historical version
      const { data: historyData, error: historyError } = await supabase
        .from('document_history')
        .select('*')
        .eq('document_id', documentId)
        .eq('version', version)
        .single()

      if (historyError) throw historyError
      if (!historyData) throw new Error('Version not found')

      // Update document with historical content
      return this.updateDocument(documentId, {
        content: historyData.content
      })
    } catch (error) {
      console.error('Restore document version error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // ============ SEARCH AND FILTER OPERATIONS ============

  // Search documents by title or content
  async searchDocuments(query: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search documents error:', error)
      return []
    }
  }

  // Get recent documents
  async getRecentDocuments(limit: number = 10): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get recent documents error:', error)
      return []
    }
  }

  // Get document statistics
  async getDocumentStats(): Promise<{
    totalDocuments: number
    documentsByType: Record<string, number>
    recentDocuments: number
  }> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('document_type, created_at')

      if (error) throw error

      const documents = data || []
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const documentsByType = documents.reduce((acc, doc) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const recentDocuments = documents.filter(
        doc => new Date(doc.created_at) > lastWeek
      ).length

      return {
        totalDocuments: documents.length,
        documentsByType,
        recentDocuments
      }
    } catch (error) {
      console.error('Get document stats error:', error)
      return {
        totalDocuments: 0,
        documentsByType: {},
        recentDocuments: 0
      }
    }
  }
}

export const documentService = new DocumentService()
export default documentService
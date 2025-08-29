import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  AiConversation,
  AiConversationInsert,
  AiConversationUpdate,
  AiMessage,
  AiMessageInsert
} from '../types/database'

export interface ConversationWithMessages extends AiConversation {
  messages: AiMessage[]
}

export interface MessageData {
  conversationId: string
  sender: 'user' | 'ai' | 'system'
  content: string
  metadata?: Record<string, any>
}

export interface ConversationData {
  title: string
  caseId?: string
  conversationType: string
}

class AiService {
  // ============ CONVERSATION OPERATIONS ============

  // Create new conversation
  async createConversation(conversationData: ConversationData): Promise<AiConversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: null, // Aplicación abierta sin usuarios
          case_id: conversationData.caseId || null,
          title: conversationData.title,
          conversation_type: conversationData.conversationType
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create conversation error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get all conversations for current user
  async getConversations(): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get conversations error:', error)
      return []
    }
  }

  // Get conversations by case
  async getConversationsByCase(caseId: string): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('case_id', caseId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get conversations by case error:', error)
      return []
    }
  }

  // Get conversations by type
  async getConversationsByType(conversationType: string): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('conversation_type', conversationType)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get conversations by type error:', error)
      return []
    }
  }

  // Get conversation with messages
  async getConversation(conversationId: string): Promise<ConversationWithMessages | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          messages:ai_messages(*)
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error

      // Sort messages by created_at
      if (data && data.messages) {
        data.messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }

      return data
    } catch (error) {
      console.error('Get conversation error:', error)
      return null
    }
  }

  // Update conversation
  async updateConversation(conversationId: string, updates: AiConversationUpdate): Promise<AiConversation | null> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update conversation error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete conversation (and all its messages)
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete conversation error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ MESSAGE OPERATIONS ============

  // Add message to conversation
  async addMessage(messageData: MessageData): Promise<AiMessage | null> {
    try {
      // Verify conversation exists
      const conversation = await this.getConversation(messageData.conversationId)
      if (!conversation) throw new Error('Conversation not found')

      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: messageData.conversationId,
          sender: messageData.sender,
          content: messageData.content,
          metadata: messageData.metadata || null
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation's updated_at timestamp
      await this.updateConversation(messageData.conversationId, {})

      return data
    } catch (error) {
      console.error('Add message error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Get messages for conversation
  async getMessages(conversationId: string): Promise<AiMessage[]> {
    try {
      // Verify conversation exists
      const conversation = await this.getConversation(conversationId)
      if (!conversation) throw new Error('Conversation not found')

      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get messages error:', error)
      return []
    }
  }

  // Alias for getMessages - for compatibility
  async getConversationMessages(conversationId: string): Promise<AiMessage[]> {
    return this.getMessages(conversationId)
  }

  // Update message
  async updateMessage(messageId: string, content: string, metadata?: Record<string, any>): Promise<AiMessage | null> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .update({ 
          content, 
          metadata: metadata || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Update message error:', error)
      handleSupabaseError(error)
      return null
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete message error:', error)
      handleSupabaseError(error)
      return false
    }
  }

  // ============ CONVERSATION MANAGEMENT ============

  // Archive conversation (simplified without context)
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      const result = await this.updateConversation(conversationId, {
        title: '[ARCHIVED] ' + (await this.getConversation(conversationId))?.title || 'Conversation'
      })
      return result !== null
    } catch (error) {
      console.error('Archive conversation error:', error)
      return false
    }
  }

  // Unarchive conversation (simplified without context)
  async unarchiveConversation(conversationId: string): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId)
      if (!conversation) return false

      const title = conversation.title.replace('[ARCHIVED] ', '')
      const result = await this.updateConversation(conversationId, { title })
      return result !== null
    } catch (error) {
      console.error('Unarchive conversation error:', error)
      return false
    }
  }

  // Get archived conversations (simplified without context)
  async getArchivedConversations(): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .ilike('title', '[ARCHIVED]%')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get archived conversations error:', error)
      return []
    }
  }

  // ============ SEARCH AND ANALYTICS ============

  // Search conversations and messages
  async searchConversations(query: string): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search conversations error:', error)
      return []
    }
  }

  // Search messages content
  async searchMessages(query: string): Promise<AiMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search messages error:', error)
      return []
    }
  }

  // Get recent conversations
  async getRecentConversations(limit: number = 10): Promise<AiConversation[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .not('title', 'ilike', '[ARCHIVED]%')
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get recent conversations error:', error)
      return []
    }
  }

  // Get conversation statistics
  async getConversationStats(): Promise<{
    totalConversations: number
    conversationsByType: Record<string, number>
    totalMessages: number
    recentConversations: number
    archivedConversations: number
  }> {
    try {
      const { data: conversations, error: convError } = await supabase
        .from('ai_conversations')
        .select('id, conversation_type, created_at, title')

      if (convError) throw convError

      const { data: messages, error: msgError } = await supabase
        .from('ai_messages')
        .select('conversation_id')

      if (msgError) throw msgError

      const conversationData = conversations || []
      const now = new Date()
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const conversationsByType = conversationData.reduce((acc, conv) => {
        acc[conv.conversation_type] = (acc[conv.conversation_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const recentConversations = conversationData.filter(
        conv => new Date(conv.created_at) > lastWeek
      ).length

      const archivedConversations = conversationData.filter(
        conv => conv.title && conv.title.startsWith('[ARCHIVED]')
      ).length

      return {
        totalConversations: conversationData.length,
        conversationsByType,
        totalMessages: (messages || []).length,
        recentConversations,
        archivedConversations
      }
    } catch (error) {
      console.error('Get conversation stats error:', error)
      return {
        totalConversations: 0,
        conversationsByType: {},
        totalMessages: 0,
        recentConversations: 0,
        archivedConversations: 0
      }
    }
  }
}

export const aiService = new AiService()
export default aiService
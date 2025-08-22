import { supabase } from '../lib/supabase'
import { CaseDocument, CaseDocumentInsert } from '../types/database'

export interface FileUploadResult {
  success: boolean
  data?: CaseDocument
  error?: string
}

export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
}

class FileService {
  private readonly UPLOADS_DIR = '/uploads'
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly ALLOWED_TYPES = ['application/pdf']

  /**
   * Sube un archivo PDF al almacenamiento local y guarda la referencia en la base de datos
   */
  async uploadCaseDocument(
    file: File,
    caseId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Generar nombre único para el archivo
      const fileName = this.generateFileName(file.name)
      const filePath = `${caseId}/${fileName}`

      // Subir archivo al almacenamiento local
      const uploadSuccess = await this.saveFileLocally(file, filePath, onProgress)
      
      if (!uploadSuccess) {
        return {
          success: false,
          error: 'Error al guardar el archivo localmente'
        }
      }

      // Guardar referencia en la base de datos
      const documentData: CaseDocumentInsert = {
        case_id: caseId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString()
      }

      const { data: dbData, error: dbError } = await supabase
        .from('case_documents')
        .insert(documentData)
        .select()
        .single()

      if (dbError) {
        // Si falla la inserción en DB, eliminar el archivo subido
        await this.deleteLocalFile(filePath)
        console.error('Error saving document reference:', dbError)
        return {
          success: false,
          error: `Error al guardar la referencia del documento: ${dbError.message}`
        }
      }

      return {
        success: true,
        data: dbData
      }
    } catch (error) {
      console.error('Unexpected error uploading file:', error)
      return {
        success: false,
        error: 'Error inesperado al subir el archivo'
      }
    }
  }

  /**
   * Obtiene todos los documentos de un caso
   */
  async getCaseDocuments(caseId: string): Promise<CaseDocument[]> {
    try {
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching case documents:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error fetching documents:', error)
      return []
    }
  }

  /**
   * Obtiene la URL pública de un documento local
   */
  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      // Para archivos locales, la URL es simplemente la ruta relativa
      return `${this.UPLOADS_DIR}/${filePath}`
    } catch (error) {
      console.error('Error getting document URL:', error)
      return null
    }
  }

  /**
   * Elimina un documento (archivo local y referencia en DB)
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Obtener información del documento
      const { data: document, error: fetchError } = await supabase
        .from('case_documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (fetchError || !document) {
        console.error('Error fetching document:', fetchError)
        return false
      }

      // Eliminar archivo local
      await this.deleteLocalFile(document.file_path)

      // Eliminar referencia de la base de datos
      const { error: dbError } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) {
        console.error('Error deleting document reference:', dbError)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error deleting document:', error)
      return false
    }
  }

  /**
   * Valida un archivo antes de subirlo
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos PDF'
      }
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Máximo permitido: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    return { isValid: true }
  }

  /**
   * Genera un nombre único para el archivo
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${random}.${extension}`
  }

  /**
   * Guarda un archivo en el almacenamiento local
   */
  private async saveFileLocally(
    file: File, 
    filePath: string, 
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<boolean> {
    try {
      // Simular progreso de subida
      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 })
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filePath', filePath)

      // Simular progreso
      if (onProgress) {
        onProgress({ loaded: file.size / 2, total: file.size, percentage: 50 })
      }

      // Enviar archivo al servidor (esto requiere un endpoint en el backend)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 })
      }

      return response.ok
    } catch (error) {
      console.error('Error saving file locally:', error)
      return false
    }
  }

  /**
   * Elimina un archivo del almacenamiento local
   */
  private async deleteLocalFile(filePath: string): Promise<void> {
    try {
      await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath })
      })
    } catch (error) {
      console.error('Error deleting local file:', error)
    }
  }

  /**
   * Formatea el tamaño del archivo para mostrar
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const fileService = new FileService()